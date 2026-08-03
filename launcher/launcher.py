from __future__ import annotations

from launcher.process_manager import ProcessManager
from launcher.tunnel import Tunnel
from launcher.env_manager import EnvManager
from launcher.healthcheck import HealthCheck
from launcher.utils import print_title


class Launcher:

    def __init__(self):

        self.pm = ProcessManager()

        self.backend_tunnel = None
        self.frontend_tunnel = None

    # --------------------------------------------------

    def start(self):

        print_title("ROYAL64 LAUNCHER")

        # ----------------------------

        if not self.pm.start_backend():
            return

        self.backend_tunnel = Tunnel(8000).start()

        backend_url = self.backend_tunnel.wait_until_ready()

        if backend_url is None:
            return

        # ----------------------------

        EnvManager.update_frontend(
            backend_url,
        )

        # ----------------------------

        if not self.pm.build_frontend():
            return

        if not self.pm.start_frontend():
            return

        self.frontend_tunnel = Tunnel(4173).start()

        frontend_url = self.frontend_tunnel.wait_until_ready()

        if frontend_url is None:
            return

        # ----------------------------

        EnvManager.update_backend(
            frontend_url,
        )

        # ----------------------------

        print_title("Restart Backend")

        self.pm.stop_backend()

        if not self.pm.start_backend():
            return

        # ----------------------------

        print_title("Restart Bot")

        self.pm.stop_bot()

        self.pm.start_bot()

        # ----------------------------

        HealthCheck(
            backend_url=backend_url,
            frontend_url=frontend_url,
        ).check_all()

        # ----------------------------

        print()

        print("=" * 60)

        print("Backend")

        print(backend_url)

        print()

        print("Frontend")

        print(frontend_url)

        print("=" * 60)

        print()

        print("Press Ctrl+C to stop...")

        self.wait_forever()

    # --------------------------------------------------

    def wait_forever(self):

        try:

            while True:
                pass

        except KeyboardInterrupt:

            self.stop()

    # --------------------------------------------------

    def stop(self):

        print()

        print("Stopping...")

        self.pm.stop_all()

        if self.backend_tunnel:
            self.backend_tunnel.stop()

        if self.frontend_tunnel:
            self.frontend_tunnel.stop()