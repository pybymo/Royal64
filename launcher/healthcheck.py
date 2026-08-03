from __future__ import annotations

import requests
from launcher.utils import ok, fail


class HealthCheck:

    def __init__(
        self,
        backend_url: str,
        frontend_url: str,
    ):

        self.backend = backend_url.rstrip("/")
        self.frontend = frontend_url.rstrip("/")

    # -------------------------------------------------------

    def check_backend(self):

        try:

            r = requests.get(
                f"{self.backend}/docs",
                timeout=10,
            )

            if r.status_code == 200:
                ok("Backend Docs")
                return True

        except Exception as e:

            fail(f"Backend Docs -> {e}")

        return False

    # -------------------------------------------------------

    def check_openapi(self):

        try:

            r = requests.get(
                f"{self.backend}/openapi.json",
                timeout=10,
            )

            if r.status_code == 200:
                ok("OpenAPI")
                return True

        except Exception as e:

            fail(f"OpenAPI -> {e}")

        return False

    # -------------------------------------------------------

    def check_frontend(self):

        try:

            r = requests.get(
                self.frontend,
                timeout=10,
            )

            if r.status_code == 200:
                ok("Frontend")
                return True

        except Exception as e:

            fail(f"Frontend -> {e}")

        return False

    # -------------------------------------------------------

    def check_all(self):

        print()

        print("=========== HEALTH CHECK ===========")

        b1 = self.check_backend()

        b2 = self.check_openapi()

        f = self.check_frontend()

        print()

        if b1 and b2 and f:

            print("🟢 Royal64 Ready")

            return True

        print("🔴 Health Check Failed")

        return False