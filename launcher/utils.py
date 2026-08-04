from __future__ import annotations

import shutil
import socket
import subprocess
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


# ==========================================================
# Network
# ==========================================================

def wait_port(
    host: str,
    port: int,
    timeout: int = 30,
) -> bool:

    deadline = time.monotonic() + timeout

    while time.monotonic() < deadline:

        try:
            with socket.create_connection(
                (host, port),
                timeout=1,
            ):
                return True

        except OSError:
            time.sleep(0.5)

    return False


# ==========================================================
# Process Output
# ==========================================================

def _stream_output(
    proc: subprocess.Popen,
    prefix: str,
) -> None:

    if proc.stdout is None:
        return

    try:

        while True:

            line = proc.stdout.readline()

            if line == "":

                if proc.poll() is not None:
                    break

                time.sleep(0.05)
                continue

            print(f"[{prefix}] {line.rstrip()}")

    except Exception:
        pass


# ==========================================================
# Process Launcher
# ==========================================================

def run_background(
    command: list[str],
    cwd: Path | None = None,
    name: str = "Process",
) -> subprocess.Popen:

    cmd = command.copy()

    exe = shutil.which(cmd[0])

    if exe is not None:
        cmd[0] = exe

    proc = subprocess.Popen(
        cmd,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        stdin=subprocess.DEVNULL,
        shell=False,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1,
        universal_newlines=True,
    )

    threading.Thread(
        target=_stream_output,
        args=(proc, name),
        daemon=True,
        name=f"{name}Output",
    ).start()

    return proc


# ==========================================================
# Kill
# ==========================================================

def kill_process(
    proc: subprocess.Popen | None,
) -> None:

    if proc is None:
        return

    if proc.poll() is not None:
        return

    try:

        proc.terminate()

        proc.wait(timeout=5)

    except Exception:

        try:
            proc.kill()
            proc.wait(timeout=5)

        except Exception:
            pass


# ==========================================================
# Console Helpers
# ==========================================================

def print_title(title: str) -> None:

    print()
    print("=" * 70)
    print(title)
    print("=" * 70)


def ok(msg: str) -> None:
    print(f"[ OK ] {msg}")


def warn(msg: str) -> None:
    print(f"[WARN] {msg}")


def fail(msg: str) -> None:
    print(f"[FAIL] {msg}")