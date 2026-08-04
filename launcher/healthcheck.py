from __future__ import annotations

import socket
import time

import requests

from launcher.launcher_config import (
    BACKEND_HOST,
    BACKEND_PORT,
    FRONTEND_HOST,
    FRONTEND_PORT,
    HEALTH_ENDPOINT,
)
from launcher.logger import failure, info, success


class HealthCheck:

    def __init__(
        self,
        backend_url: str,
        frontend_url: str,
    ) -> None:

        self.backend_url = backend_url.rstrip("/")
        self.frontend_url = frontend_url.rstrip("/")

    # ==================================================

    @staticmethod
    def _tcp(
        host: str,
        port: int,
        timeout: float = 2,
    ) -> bool:

        try:
            with socket.create_connection(
                (host, port),
                timeout=timeout,
            ):
                return True
        except Exception:
            return False

    # ==================================================

    @staticmethod
    def _http(
        url: str,
        timeout: float = 5,
    ) -> bool:

        try:

            r = requests.get(
                url,
                timeout=timeout,
            )

            return r.status_code == 200

        except Exception:
            return False

    # ==================================================

    def check_backend(self) -> bool:

        info("Checking Backend...")

        if not self._tcp(
            BACKEND_HOST,
            BACKEND_PORT,
        ):

            failure("Backend TCP failed")
            return False

        if not self._http(
            f"{self.backend_url}{HEALTH_ENDPOINT}",
        ):

            failure("Backend HTTP failed")
            return False

        success("Backend OK")

        return True

    # ==================================================

    def check_frontend(self) -> bool:

        info("Checking Frontend...")

        if not self._tcp(
            FRONTEND_HOST,
            FRONTEND_PORT,
        ):

            failure("Frontend TCP failed")
            return False

        if not self._http(
            self.frontend_url,
        ):

            failure("Frontend HTTP failed")
            return False

        success("Frontend OK")

        return True

    # ==================================================

    def check_all(self) -> bool:

        start = time.perf_counter()

        backend = self.check_backend()
        frontend = self.check_frontend()

        elapsed = time.perf_counter() - start

        print()
        print("=" * 60)
        print("Health Summary")
        print("=" * 60)
        print(f"Backend : {'OK' if backend else 'FAIL'}")
        print(f"Frontend: {'OK' if frontend else 'FAIL'}")
        print(f"Elapsed : {elapsed:.2f}s")
        print("=" * 60)

        return backend and frontend