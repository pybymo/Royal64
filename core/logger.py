import sys
from pathlib import Path

from loguru import logger

LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

logger.remove()

logger.add(
    sys.stderr,
    level="INFO",
    enqueue=True,
)

logger.add(
    LOG_DIR / "royal64.log",
    level="INFO",
    rotation="10 MB",
    retention="30 days",
    enqueue=True,
    encoding="utf-8",
)

app_logger = logger