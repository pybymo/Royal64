from __future__ import annotations

import threading

from launcher.cleanup import Cleanup
from launcher.dependency_check import DependencyCheck
from launcher.env_manager import EnvManager
from launcher.healthcheck import HealthCheck
from launcher.launcher_config import (
    BACKEND_HOST,
    BACKEND_PORT,
    BACKEND_TUNNEL_PORT,
    FRONTEND_TUNNEL_PORT,
)
from launcher.logger import failure, info, success
from launcher.process_manager import ProcessManager
from launcher.tunnel import Tunnel
from launcher.utils import (
    print_title,
    wait_port,
)


class Launcher:

    def __init__(self) -> None:

        self.pm = ProcessManager()

        self.backend_tunnel: Tunnel | None = None
        self.frontend_tunnel: Tunnel | None = None

        self.backend_url: str | None = None
        self.frontend_url: str | None = None

        self._startup_lock = threading.Lock()
        self._startup_completed = False

        self._shutdown = threading.Event()

    # =========================================================

    def start(self) -> None:

        print_title("ROYAL64 LAUNCHER")

        Cleanup.run()

        if not DependencyCheck.check():
            failure("Dependency check failed.")
            return

        # -----------------------------
        # Backend
        # -----------------------------

        if not self.pm.start_backend():
            return

        # -----------------------------
        # Backend Tunnel
        # -----------------------------

        info("Creating Backend Tunnel...")

        self.backend_tunnel = Tunnel(
            BACKEND_TUNNEL_PORT,
            "Backend",
        ).start()

        self.backend_url = self.backend_tunnel.wait_until_ready()

        if self.backend_url is None:
            failure("Backend tunnel failed.")
            return

        success(f"Backend tunnel -> {self.backend_url}")

        # -----------------------------
        # Frontend .env
        # -----------------------------

        EnvManager.update_frontend(
            self.backend_url,
        )

        # -----------------------------
        # Frontend
        # -----------------------------

        if not self.pm.build_frontend():
            return

        if not self.pm.start_frontend():
            return

        # -----------------------------
        # Frontend Tunnel
        # -----------------------------

        info("Creating Frontend Tunnel...")

        self.frontend_tunnel = Tunnel(
            FRONTEND_TUNNEL_PORT,
            "Frontend",
        ).start()

        self.frontend_url = self.frontend_tunnel.wait_until_ready()

        if self.frontend_url is None:
            failure("Frontend tunnel failed.")
            return

        success(f"Frontend tunnel -> {self.frontend_url}")

        # -----------------------------
        # Backend .env
        # -----------------------------

        EnvManager.update_backend(
            self.frontend_url,
        )

        # -----------------------------
        # Restart Backend
        # -----------------------------

        info("Restarting Backend...")

        if not self.pm.restart_backend():
            failure("Backend restart failed.")
            return

        if not wait_port(
            BACKEND_HOST,
            BACKEND_PORT,
            timeout=30,
        ):
            failure("Backend did not become ready.")
            return

        success("Backend restarted.")

        # -----------------------------
        # Bot
        # -----------------------------

        info("Starting Telegram Bot...")

        if not self.pm.start_bot():
            failure("Bot failed.")
            return

        # -----------------------------
        # Health
        # -----------------------------

        HealthCheck(
            backend_url=self.backend_url,
            frontend_url=self.frontend_url,
        ).check_all()

        self._print_summary()

        info("Royal64 is running...")
        info("Press Ctrl+C to stop.")

        self.wait_forever()

    # =========================================================

    def _print_summary(self) -> None:

        print()
        print("=" * 70)
        print("ROYAL64 READY")
        print()
        print(f"Backend : {self.backend_url}")
        print(f"Frontend: {self.frontend_url}")
        print("Bot      : Running")
        print("Health   : OK")
        print("=" * 70)
        print()

    # =========================================================

    def wait_forever(self) -> None:

        try:
            self._shutdown.wait()

        except KeyboardInterrupt:
            self.stop()

    # =========================================================

    def stop(self) -> None:

        info("Stopping launcher...")

        self._shutdown.set()

        self.pm.stop_all()

        if self.backend_tunnel:
            self.backend_tunnel.stop()

        if self.frontend_tunnel:
            self.frontend_tunnel.stop()

        success("Launcher stopped.")