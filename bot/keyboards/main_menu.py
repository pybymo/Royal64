from aiogram.types import KeyboardButton
from aiogram.types import ReplyKeyboardMarkup


def main_menu():

    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(text="🎮 Play"),
                KeyboardButton(text="👤 Profile"),
            ],
            [
                KeyboardButton(text="💰 Wallet"),
                KeyboardButton(text="📜 History"),
            ],
            [
                KeyboardButton(text="⚙ Settings"),
                KeyboardButton(text="❓ Help"),
            ],
        ],
        resize_keyboard=True,
        input_field_placeholder="Choose an option",
    )