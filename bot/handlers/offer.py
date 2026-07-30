from uuid import UUID

from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from aiogram.types import Message

from database.session import SessionLocal

from core.exceptions import EscrowError, PlayerWalletNotVerifiedError

from repositories.offer_repository import OfferRepository
from repositories.user_repository import UserRepository

from services.offer_service import OfferService

from bot.keyboards.play import play_keyboard
from bot.states.create_offer import CreateOfferState

router = Router()


MATCH_TYPES = {
    "BO1": "⚔ Best of 1",
    "BO3": "👑 Best of 3",
}


@router.message(F.text == "🎮 Play")
async def play(message: Message):

    await message.answer(
        "Choose:",
        reply_markup=play_keyboard(),
    )


@router.callback_query(F.data == "offer_create")
async def create_offer(callback: CallbackQuery, state: FSMContext):

    await state.clear()

    await state.set_state(CreateOfferState.stake)

    await callback.message.answer(
        "💰 Stake (TON)"
    )

    await callback.answer()


@router.message(CreateOfferState.stake)
async def offer_stake(message: Message, state: FSMContext):

    stake = float(message.text)

    await state.update_data(stake=stake)

    await state.set_state(CreateOfferState.games)

    await message.answer(
        """
Choose Match Type

⚔ BO1

👑 BO3
""".strip()
    )


@router.message(CreateOfferState.games)
async def offer_games(message: Message, state: FSMContext):

    text = message.text.upper().strip()

    if text in ("BO1", "⚔ BO1"):
        match_type = "BO1"

    elif text in ("BO3", "👑 BO3"):
        match_type = "BO3"

    else:
        await message.answer(
            "Type BO1 or BO3"
        )
        return

    await state.update_data(
        match_type=match_type
    )

    await state.set_state(CreateOfferState.timer)

    await message.answer(
        "⏱ Time Control (1~10)"
    )


@router.message(CreateOfferState.timer)
async def offer_timer(message: Message, state: FSMContext):

    timer = int(message.text)

    await state.update_data(
        time_control=timer
    )

    data = await state.get_data()

    await state.clear()

    await message.answer(
        f"""
♟ Offer Preview

Stake
{data["stake"]} TON

Match
{MATCH_TYPES[data["match_type"]]}

Clock
{data["time_control"]} Minutes

(Database step next)
"""
    )


@router.callback_query(F.data.startswith("offer_accept:"))
async def accept_offer(callback: CallbackQuery):

    offer_id = UUID(
        callback.data.split(":")[1]
    )

    async with SessionLocal() as session:

        offer_repo = OfferRepository(session)

        user_repo = UserRepository(session)

        offer = await offer_repo.by_id(
            offer_id
        )

        if offer is None:

            await callback.answer(
                "Offer not found",
                show_alert=True,
            )

            return

        accepter = await user_repo.get_by_telegram_id(
            callback.from_user.id
        )

        service = OfferService(session)

        try:
            match = await service.accept(
                offer,
                accepter,
            )

        except PlayerWalletNotVerifiedError:

            await callback.message.answer(
                "⚠️ Connect and verify a TON wallet before accepting a paid match."
            )

            await callback.answer()

            return

        except EscrowError:

            await callback.message.answer(
                "⚠️ Could not set up escrow for this match right now. Please try again shortly."
            )

            await callback.answer()

            return

    await callback.message.answer(
        f"""
✅ Match Created

ID

{match.id}

Games

{match.games_required}

Stake

{match.amount} TON

Game #1 Ready
"""
    )

    await callback.answer()