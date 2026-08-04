from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# =========================================================
# Python
# =========================================================

VENV_DIR = ROOT / ".venv"
VENV_PYTHON = VENV_DIR / "Scripts" / "python.exe"

# =========================================================
# Backend
# =========================================================

BACKEND_HOST = "127.0.0.1"
BACKEND_PORT = 8000

BACKEND_COMMAND = [
    str(VENV_PYTHON),
    "-m",
    "uvicorn",
    "app.main:app",
    "--reload",
]

# =========================================================
# Frontend
# =========================================================

FRONTEND_DIR = ROOT / "frontend" / "royal64-web"

FRONTEND_HOST = "127.0.0.1"
FRONTEND_PORT = 4173

# =========================================================
# Telegram Bot
# =========================================================

BOT_COMMAND = [
    str(VENV_PYTHON),
    "-m",
    "bot.main",
]

# =========================================================
# Environment
# =========================================================

BACKEND_ENV_FILE = ROOT / ".env"

FRONTEND_ENV_FILE = FRONTEND_DIR / ".env"

# =========================================================
# Health
# =========================================================

HEALTH_ENDPOINT = "/health"

# =========================================================
# Cloudflared
# =========================================================

CLOUDFLARED_PATH = Path(
    r"C:\tools\cloudflared\cloudflared-windows-amd64.exe"
)

# =========================================================
# Tunnel
# =========================================================

BACKEND_TUNNEL_PORT = BACKEND_PORT
FRONTEND_TUNNEL_PORT = FRONTEND_PORT

BACKEND_TUNNEL_NAME = "Backend"
FRONTEND_TUNNEL_NAME = "Frontend"

TUNNEL_TIMEOUT = 120

# =========================================================
# Launcher
# =========================================================

WAIT_FOREVER_INTERVAL = 1