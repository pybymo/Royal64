from __future__ import annotations

from pathlib import Path

from launcher.utils import ROOT, ok


BACKEND_ENV = ROOT / ".env"

FRONTEND_ENV = (
    ROOT
    / "frontend"
    / "royal64-web"
    / ".env"
)


class EnvManager:

    @staticmethod
    def _replace_or_add(path: Path, key: str, value: str):

        if not path.exists():
            path.write_text("")

        lines = path.read_text(
            encoding="utf-8"
        ).splitlines()

        found = False

        new_lines = []

        for line in lines:

            if line.startswith(f"{key}="):

                new_lines.append(f"{key}={value}")

                found = True

            else:

                new_lines.append(line)

        if not found:
            new_lines.append(f"{key}={value}")

        path.write_text(
            "\n".join(new_lines),
            encoding="utf-8",
        )

    # --------------------------------------------------

    @classmethod
    def update_backend(
        cls,
        frontend_url: str,
    ):

        cls._replace_or_add(
            BACKEND_ENV,
            "WEBAPP_URL",
            frontend_url,
        )

        # ----------

        if BACKEND_ENV.exists():

            text = BACKEND_ENV.read_text(
                encoding="utf-8"
            )

            key = "CORS_ORIGINS="

            if key in text:

                lines = text.splitlines()

                out = []

                for line in lines:

                    if line.startswith(key):

                        origins = (
                            line[len(key):]
                            .split(",")
                        )

                        origins = [
                            x.strip()
                            for x in origins
                            if x.strip()
                        ]

                        if frontend_url not in origins:
                            origins.append(frontend_url)

                        out.append(
                            key + ",".join(origins)
                        )

                    else:
                        out.append(line)

                BACKEND_ENV.write_text(
                    "\n".join(out),
                    encoding="utf-8",
                )

        ok(".env updated")

    # --------------------------------------------------

    @classmethod
    def update_frontend(
        cls,
        backend_url: str,
    ):

        cls._replace_or_add(
            FRONTEND_ENV,
            "VITE_API_URL",
            backend_url,
        )

        ok("frontend/.env updated")