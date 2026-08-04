from __future__ import annotations

import logging
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

LOG_DIR = ROOT / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOG_DIR / "launcher.log"


class Color:
    RESET = "\033[0m"

    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    CYAN = "\033[96m"


# =========================================================

logger = logging.getLogger("Royal64Launcher")

if not logger.handlers:

    logger.setLevel(logging.INFO)
    logger.propagate = False

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(message)s",
        "%H:%M:%S",
    )

    file_handler = logging.FileHandler(
        LOG_FILE,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)


# =========================================================

def _console(
    color: str,
    tag: str,
    message: str,
) -> None:

    sys.stdout.write(
        f"{color}{tag}{Color.RESET} {message}\n"
    )
    sys.stdout.flush()


# =========================================================

def info(message: str) -> None:

    logger.info(message)
    _console(Color.CYAN, "[INFO]", message)


def success(message: str) -> None:

    logger.info(message)
    _console(Color.GREEN, "[ OK ]", message)


def warning(message: str) -> None:

    logger.warning(message)
    _console(Color.YELLOW, "[WARN]", message)


def failure(message: str) -> None:

    logger.error(message)
    _console(Color.RED, "[FAIL]", message)


# =========================================================

def exception(message: str) -> None:

    logger.exception(message)
    _console(Color.RED, "[EXCEPTION]", message)