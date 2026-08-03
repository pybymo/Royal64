from __future__ import annotations

import subprocess
import socket
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def wait_port(host: str, port: int, timeout: int = 30) -> bool:
    start = time.time()

    while time.time() - start < timeout:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except Exception:
            time.sleep(0.5)

    return False


def run_background(command: list[str], cwd: Path | None = None):
    return subprocess.Popen(
        command,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="ignore",
    )


def kill_process(proc):
    if proc and proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()


def print_title(title: str):
    print()
    print("=" * 70)
    print(title)
    print("=" * 70)


def ok(msg: str):
    print(f"[ OK ] {msg}")


def warn(msg: str):
    print(f"[WARN] {msg}")


def fail(msg: str):
    print(f"[FAIL] {msg}")