from __future__ import annotations

import queue
import re
import threading
import time
from subprocess import Popen

from launcher.launcher_config import CLOUDFLARED_PATH
from launcher.logger import failure, info, success
from launcher.utils import run_background


URL_PATTERN = re.compile(r"https://[^\s|]+\.trycloudflare\.com")


class Tunnel:
    def __init__(
        self,
        port: int,
        name: str,
    ) -> None:

        self.port = port
        self.name = name

        self.process: Popen | None = None

        self.url: str | None = None

        self._ready = threading.Event()
        self._stop = threading.Event()

        self._queue: queue.Queue[str] = queue.Queue()

        self._reader_thread: threading.Thread | None = None
        self._parser_thread: threading.Thread | None = None

    # ==================================================

    def start(self) -> "Tunnel":

        self.process = run_background(
            [
                str(CLOUDFLARED_PATH),
                "tunnel",
                "--url",
                f"http://127.0.0.1:{self.port}",
            ]
        )

        self._reader_thread = threading.Thread(
            target=self._reader,
            daemon=True,
            name=f"{self.name}TunnelReader",
        )

        self._parser_thread = threading.Thread(
            target=self._parser,
            daemon=True,
            name=f"{self.name}TunnelParser",
        )

        self._reader_thread.start()
        self._parser_thread.start()

        return self

    # ==================================================

    def _reader(self) -> None:

        if (
            self.process is None
            or self.process.stdout is None
        ):
            return

        while not self._stop.is_set():

            line = self.process.stdout.readline()

            if line == "":

                if self.process.poll() is not None:
                    break

                time.sleep(0.1)
                continue

            self._queue.put(line.rstrip())

    # ==================================================

    def _parser(self) -> None:

        while not self._stop.is_set():

            try:
                line = self._queue.get(timeout=0.5)

            except queue.Empty:

                if (
                    self.process is not None
                    and self.process.poll() is not None
                ):
                    break

                continue

            info(f"[Tunnel:{self.name}] {line}")

            if self.url is None:

                match = URL_PATTERN.search(line)

                if match:

                    self.url = match.group(0)

                    success(f"{self.name} Tunnel Ready")
                    success(self.url)

                    self._ready.set()

    # ==================================================

    def wait_until_ready(
        self,
        timeout: int = 120,
    ) -> str | None:

        if self._ready.wait(timeout):
            return self.url

        failure(f"{self.name} tunnel timeout")

        return None

    # ==================================================

    def is_ready(self) -> bool:

        return self._ready.is_set()

    # ==================================================

    def stop(self) -> None:

        self._stop.set()

        if self.process is None:
            return

        try:

            self.process.terminate()
            self.process.wait(timeout=5)

        except Exception:

            try:
                self.process.kill()
            except Exception:
                pass

        self.process = None