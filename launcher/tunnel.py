from __future__ import annotations

import re
import threading
from pathlib import Path

from launcher.utils import run_background, ok, fail


CLOUDFLARED = Path(r"C:\tools\cloudflared\cloudflared-windows-amd64.exe")


class Tunnel:

    def __init__(self, port: int):

        self.port = port
        self.url = None
        self.proc = None

    # -----------------------------------------------------

    def start(self):

        if not CLOUDFLARED.exists():
            raise FileNotFoundError(
                f"cloudflared not found:\n{CLOUDFLARED}"
            )

        self.proc = run_background(
            [
                str(CLOUDFLARED),
                "tunnel",
                "--url",
                f"http://localhost:{self.port}",
            ]
        )

        thread = threading.Thread(
            target=self._watch_output,
            daemon=True,
        )

        thread.start()

        return self

    # -----------------------------------------------------

    def _watch_output(self):

        pattern = re.compile(
            r"https://[a-zA-Z0-9\-\.]+\.trycloudflare\.com"
        )

        for line in self.proc.stdout:

            line = line.strip()

            print(f"[Tunnel:{self.port}] {line}")

            m = pattern.search(line)

            if m and self.url is None:

                self.url = m.group(0)

                ok(f"Tunnel {self.port}")

                ok(self.url)

    # -----------------------------------------------------

    def wait_until_ready(self, timeout=30):

        import time

        start = time.time()

        while time.time() - start < timeout:

            if self.url:
                return self.url

            time.sleep(0.5)

        fail(f"Tunnel {self.port} timeout")

        return None

    # -----------------------------------------------------

    def stop(self):

        if self.proc and self.proc.poll() is None:
            self.proc.kill()