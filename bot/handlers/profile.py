from aiogram import F
from aiogram import Router
from aiogram.types import Message

from bot.keyboards.main_menu import main_menu
from bot.texts import en

router = Router()


@router.message(F.text == "👤 Profile")
async def profile_handler(message: Message):

    await message.answer(
        en.PROFILE,
        reply_markup=main_menu(),
    )