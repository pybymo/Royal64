from aiogram.types import InlineKeyboardButton
from aiogram.types import InlineKeyboardMarkup


def play_keyboard():

    return InlineKeyboardMarkup(

        inline_keyboard=[

            [

                InlineKeyboardButton(
                    text="➕ Create Match",
                    callback_data="offer_create",
                )

            ],

            [

                InlineKeyboardButton(
                    text="🎯 Open Matches",
                    callback_data="offer_list",
                )

            ],

        ]

    )