from aiogram.fsm.state import State
from aiogram.fsm.state import StatesGroup


class CreateOfferState(StatesGroup):

    stake = State()

    games = State()

    timer = State()