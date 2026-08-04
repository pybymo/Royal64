from __future__ import annotations

from pathlib import Path

from launcher.launcher_config import BACKEND_ENV_FILE, FRONTEND_ENV_FILE
from launcher.logger import success


class EnvManager:

    # ==================================================

    @staticmethod
    def _update(path: Path, values: dict[str, str]) -> None:

        lines: list[str] = []

        if path.exists():
            lines = path.read_text(
                encoding="utf-8",
            ).splitlines()

        data: dict[str, str] = {}

        for line in lines:

            if "=" not in line:
                continue

            k, v = line.split("=", 1)

            data[k.strip()] = v.strip()

        data.update(values)

        text = "\n".join(
            f"{k}={v}"
            for k, v in sorted(data.items())
        )

        path.write_text(
            text + "\n",
            encoding="utf-8",
        )

        success(f"{path.name} updated")

    # ==================================================

    @classmethod
    def update_frontend(
        cls,
        backend_url: str,
    ) -> None:

        cls._update(
            FRONTEND_ENV_FILE,
            {
                "VITE_API_URL": backend_url,
            },
        )

    # ==================================================

    @classmethod
    def update_backend(
        cls,
        frontend_url: str,
    ) -> None:

        cls._update(
            BACKEND_ENV_FILE,
            {
                "FRONTEND_URL": frontend_url,
            },
        )