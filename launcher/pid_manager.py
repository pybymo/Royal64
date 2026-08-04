from __future__ import annotations

from pathlib import Path
import psutil

from launcher.launcher_config import ROOT

PID_DIR = ROOT / "launcher" / "pids"
PID_DIR.mkdir(exist_ok=True)


class PIDManager:

    @staticmethod
    def save(name: str, pid: int):

        (PID_DIR / f"{name}.pid").write_text(str(pid))

    @staticmethod
    def load(name: str):

        path = PID_DIR / f"{name}.pid"

        if not path.exists():
            return None

        try:
            return int(path.read_text().strip())
        except Exception:
            return None

    @staticmethod
    def kill(name: str):

        pid = PIDManager.load(name)

        if pid is None:
            return

        try:
            p = psutil.Process(pid)
            p.kill()
        except Exception:
            pass

        try:
            (PID_DIR / f"{name}.pid").unlink()
        except Exception:
            pass

    @staticmethod
    def kill_all():

        for name in (
            "backend",
            "bot",
            "frontend",
            "backend_tunnel",
            "frontend_tunnel",
        ):
            PIDManager.kill(name)