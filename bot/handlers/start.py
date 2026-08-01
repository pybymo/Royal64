from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)

from bot.keyboards.main_menu import main_menu
from bot.texts import en
from core.config import settings
from database.session import SessionLocal
from schemas.user import UserCreate
from services.user_service import UserService

router = Router()


@router.message(CommandStart())
async def start_handler(message: Message):

    async with SessionLocal() as session:

        service = UserService(session)

        await service.register(
            UserCreate(
                telegram_id=message.from_user.id,
                username=message.from_user.username,
                first_name=message.from_user.first_name,
                last_name=message.from_user.last_name,
                language=message.from_user.language_code or "en",
            )
        )

    webapp_keyboard = None

    if settings.WEBAPP_URL:

        webapp_keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="🚀 Open Royal64",
                        web_app=WebAppInfo(url=settings.WEBAPP_URL),
                    )
                ]
            ]
        )

    await message.answer(
        en.WELCOME,
        reply_markup=webapp_keyboard,
    )

    await message.answer(
        "Menu:",
        reply_markup=main_menu(),
    )