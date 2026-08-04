from __future__ import annotations

from launcher.dependency_check import DependencyCheck
from launcher.launcher_config import (
    BACKEND_COMMAND,
    BACKEND_HOST,
    BACKEND_PORT,
    BOT_COMMAND,
    FRONTEND_DIR,
    FRONTEND_HOST,
    FRONTEND_PORT,
    ROOT,
)
from launcher.utils import (
    fail,
    kill_process,
    ok,
    run_background,
    wait_port,
)


class ProcessManager:
    def __init__(self) -> None:

        self.backend = None
        self.bot = None
        self.frontend = None

        self.package_manager = DependencyCheck.get_package_manager()

    # =========================================================

    def _frontend_cmd(self, mode: str) -> list[str]:

        if self.package_manager.lower().startswith("npm"):

            if mode == "build":
                return [
                    self.package_manager,
                    "run",
                    "build",
                ]

            return [
                self.package_manager,
                "run",
                "preview",
                "--",
                "--host",
            ]

        if mode == "build":
            return [
                self.package_manager,
                "build",
            ]

        return [
            self.package_manager,
            "preview",
            "--host",
        ]

    # =========================================================

    def start_backend(self) -> bool:

        ok("Starting Backend...")

        self.backend = run_background(
            BACKEND_COMMAND,
            cwd=ROOT,
            name="Backend",
        )

        if wait_port(
            BACKEND_HOST,
            BACKEND_PORT,
        ):
            ok("Backend Ready")
            return True

        fail("Backend Failed")
        return False

    # =========================================================

    def stop_backend(self):

        kill_process(self.backend)
        self.backend = None

    # =========================================================

    def restart_backend(self) -> bool:

        self.stop_backend()
        return self.start_backend()

    # =========================================================

    def start_bot(self) -> bool:

        ok("Starting Telegram Bot...")

        self.bot = run_background(
            BOT_COMMAND,
            cwd=ROOT,
            name="Bot",
        )

        ok("Bot Ready")
        return True

    # =========================================================

    def stop_bot(self):

        kill_process(self.bot)
        self.bot = None

    # =========================================================

    def restart_bot(self) -> bool:

        self.stop_bot()
        return self.start_bot()

    # =========================================================

    def build_frontend(self) -> bool:

        ok("Building Frontend...")

        proc = run_background(
            self._frontend_cmd("build"),
            cwd=FRONTEND_DIR,
            name="Frontend Build",
        )

        return_code = proc.wait()

        if return_code == 0:
            ok("Frontend Build OK")
            return True

        fail("Frontend Build Failed")
        return False

    # =========================================================

    def start_frontend(self) -> bool:

        ok("Starting Frontend Preview...")

        self.frontend = run_background(
            self._frontend_cmd("preview"),
            cwd=FRONTEND_DIR,
            name="Frontend",
        )

        if wait_port(
            FRONTEND_HOST,
            FRONTEND_PORT,
        ):
            ok("Frontend Ready")
            return True

        fail("Frontend Failed")
        return False

    # =========================================================

    def stop_frontend(self):

        kill_process(self.frontend)
        self.frontend = None

    # =========================================================

    def restart_frontend(self) -> bool:

        self.stop_frontend()
        return self.start_frontend()

    # =========================================================

    def stop_all(self):

        self.stop_frontend()
        self.stop_bot()
        self.stop_backend()