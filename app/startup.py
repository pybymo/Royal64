from loguru import logger

from core.config import settings


async def startup():

    logger.info("===================================")
    logger.info("Royal64 is starting...")
    logger.info(f"ENV : {settings.ENV}")
    logger.info("===================================")