from aiogram.fsm.state import State
from aiogram.fsm.state import StatesGroup


class UserStates(StatesGroup):

    idle = State()

    connecting_wallet = State()

    choosing_table = State()

    creating_offer = State()

    waiting_opponent = State()