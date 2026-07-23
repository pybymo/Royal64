from aiogram import Dispatcher

from bot.handlers.game import router as game_router
from bot.handlers.offer import router as offer_router
from bot.handlers.profile import router as profile_router
from bot.handlers.start import router as start_router
from bot.handlers.wallet import router as wallet_router
from bot.handlers.help import router as help_router
from bot.handlers.history import router as history_router
from bot.handlers.settings import router as settings_router


def setup_routers(dp: Dispatcher):

    dp.include_router(start_router)
    dp.include_router(profile_router)
    dp.include_router(wallet_router)
    dp.include_router(offer_router)
    dp.include_router(game_router)
    dp.include_router(history_router)
    dp.include_router(settings_router)
    dp.include_router(help_router)