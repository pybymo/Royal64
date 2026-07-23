from aiogram import F, Router
from aiogram.types import Message

from bot.texts import en

router = Router()


@router.message(F.text == "⚙ Settings")
async def settings_handler(message: Message):

    await message.answer(en.COMING_SOON)