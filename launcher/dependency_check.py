from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from launcher.launcher_config import CLOUDFLARED_PATH
from launcher.logger import failure, info, success


class DependencyCheck:

    REQUIRED = {
        "python": ["python", "--version"],
        "node": ["node", "--version"],
        "docker": ["docker", "--version"],
    }

    @staticmethod
    def _exists(command: list[str]) -> bool:

        exe = shutil.which(command[0])

        if exe is None:
            return False

        try:
            subprocess.run(
                command,
                capture_output=True,
                timeout=5,
                check=False,
            )
            return True

        except Exception:
            return False

    @staticmethod
    def _cloudflared_exists() -> bool:

        return Path(CLOUDFLARED_PATH).exists()

    @classmethod
    def check(cls) -> bool:

        info("Checking dependencies...")

        ok = True

        # ---------- Python / Node / Docker ----------

        for name, cmd in cls.REQUIRED.items():

            if cls._exists(cmd):
                success(f"{name} OK")
            else:
                failure(f"{name} NOT FOUND")
                ok = False

        # ---------- Package Manager ----------

        if shutil.which("pnpm") or shutil.which("pnpm.cmd"):

            success("pnpm OK")

        elif shutil.which("npm") or shutil.which("npm.cmd"):

            success("npm OK")

        else:

            failure("Neither pnpm nor npm found")
            ok = False

        # ---------- Cloudflared ----------

        if cls._cloudflared_exists():

            success("cloudflared OK")

        else:

            failure(f"cloudflared NOT FOUND -> {CLOUDFLARED_PATH}")
            ok = False

        return ok

    @staticmethod
    def get_package_manager() -> str:

        if shutil.which("pnpm"):
            return "pnpm"

        if shutil.which("pnpm.cmd"):
            return "pnpm.cmd"

        if shutil.which("npm"):
            return "npm"

        if shutil.which("npm.cmd"):
            return "npm.cmd"

        raise RuntimeError(
            "Neither pnpm nor npm was found."
        )