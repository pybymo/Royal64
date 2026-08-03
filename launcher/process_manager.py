from __future__ import annotations

from pathlib import Path

from launcher.utils import (
    ROOT,
    run_background,
    wait_port,
    ok,
    fail,
    kill_process,
)


FRONTEND_DIR = ROOT / "frontend" / "royal64-web"


class ProcessManager:

    def __init__(self):

        self.backend = None
        self.bot = None
        self.frontend = None

    # --------------------------------------------------

    def start_backend(self):

        ok("Starting Backend...")

        self.backend = run_background(
            [
                str(ROOT / ".venv" / "Scripts" / "python.exe"),
                "-m",
                "uvicorn",
                "app.main:app",
                "--reload",
            ],
            cwd=ROOT,
        )

        if wait_port("127.0.0.1", 8000):

            ok("Backend Ready")

            return True

        fail("Backend Failed")

        return False

    # --------------------------------------------------

    def stop_backend(self):

        kill_process(self.backend)

        self.backend = None

    # --------------------------------------------------

    def restart_backend(self):

        self.stop_backend()

        return self.start_backend()

    # --------------------------------------------------

    def start_bot(self):

        ok("Starting Telegram Bot...")

        self.bot = run_background(
            [
                str(ROOT / ".venv" / "Scripts" / "python.exe"),
                "-m",
                "bot.main",
            ],
            cwd=ROOT,
        )

        ok("Bot Started")

        return True

    # --------------------------------------------------

    def stop_bot(self):

        kill_process(self.bot)

        self.bot = None

    # --------------------------------------------------

    def restart_bot(self):

        self.stop_bot()

        return self.start_bot()

    # --------------------------------------------------

    def build_frontend(self):

        ok("Building Frontend...")

        proc = run_background(
            [
                "pnpm",
                "build",
            ],
            cwd=FRONTEND_DIR,
        )

        proc.wait()

        if proc.returncode == 0:

            ok("Frontend Build OK")

            return True

        fail("Frontend Build Failed")

        return False

    # --------------------------------------------------

    def start_frontend(self):

        ok("Starting Frontend Preview...")

        self.frontend = run_background(
            [
                "pnpm",
                "preview",
                "--host",
            ],
            cwd=FRONTEND_DIR,
        )

        if wait_port("127.0.0.1", 4173):

            ok("Frontend Ready")

            return True

        fail("Frontend Failed")

        return False

    # --------------------------------------------------

    def stop_frontend(self):

        kill_process(self.frontend)

        self.frontend = None

    # --------------------------------------------------

    def restart_frontend(self):

        self.stop_frontend()

        return self.start_frontend()

    # --------------------------------------------------

    def stop_all(self):

        self.stop_backend()

        self.stop_bot()

        self.stop_frontend()