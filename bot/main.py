"""
Bot entrypoint. Nothing in this codebase previously created a Bot,
Dispatcher, or called start_polling anywhere — the bot could not run
at all before this file existed. Run with:

    python -m bot.main

Uses long polling (no public HTTPS endpoint required), which is the
right choice for local/dev testing. Switch to a webhook only once
you're deploying somewhere with a stable public HTTPS URL.
"""

import asyncio

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import MenuButtonWebApp, WebAppInfo
from loguru import logger

from core.config import settings
from bot.routers import setup_routers


async def main():

    if not settings.BOT_TOKEN:
        raise RuntimeError("BOT_TOKEN is not set in .env")

    bot = Bot(
        token=settings.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )

    dp = Dispatcher(storage=MemoryStorage())

    setup_routers(dp)

    if settings.WEBAPP_URL:

        # This is the persistent button next to the message box that
        # launches the Mini App with real Telegram.WebApp.initData —
        # opening the same URL in a plain browser tab will never
        # populate initData, by design on Telegram's side, not a bug
        # here. WEBAPP_URL must be a real https:// URL for a phone to
        # reach it (localhost only works for a desktop client pointed
        # at a local Telegram build, if at all) — use a tunnel
        # (ngrok/cloudflared) or a real deployment for phone testing.
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="Play",
                web_app=WebAppInfo(url=settings.WEBAPP_URL),
            )
        )

        logger.info(f"Mini App menu button set -> {settings.WEBAPP_URL}")

    else:
        logger.warning(
            "WEBAPP_URL is not set — the Mini App menu button will not "
            "be configured, so Telegram.WebApp.initData will stay empty "
            "no matter what the user taps."
        )

    logger.info("Royal64 bot starting (long polling)...")

    await bot.delete_webhook(drop_pending_updates=True)

    try:
        await dp.start_polling(bot)

    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
