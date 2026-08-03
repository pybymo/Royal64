"""
The system bot opponent — used for free/practice games when no human
is available, and for the MVP's calibration flow (games vs bot before
a player's first paid match). Reuses MatchService/GameService as-is
rather than duplicating match-creation logic; the only difference from
a normal match is that the "offer" is created and accepted in the same
step, with no stake and no escrow.
"""

from uuid import uuid4

from core.enums import MatchType, OfferStatus
from database.models.match_offer import MatchOffer
from database.models.user import User
from repositories.offer_repository import OfferRepository
from repositories.user_repository import UserRepository
from services.game_service import GameService
from services.match_service import MatchService

BOT_TELEGRAM_ID = -1
BOT_USERNAME = "Royal64Bot"


class BotOpponentService:

    def __init__(self, session):
        self.session = session
        self.user_repo = UserRepository(session)
        self.offer_repo = OfferRepository(session)
        self.match_service = MatchService(session)
        self.game_service = GameService(session)

    async def get_or_create_bot_user(self) -> User:

        existing = await self.user_repo.get_by_telegram_id(BOT_TELEGRAM_ID)

        if existing is not None:
            return existing

        bot = User(
            id=uuid4(),
            telegram_id=BOT_TELEGRAM_ID,
            username=BOT_USERNAME,
            first_name="Royal64",
            last_name="Bot",
            is_bot=True,
        )

        return await self.user_repo.create(bot)

    async def start_bot_game(self, human: User, time_control: int):
        """
        Free only, by design — a bot game with money on it would need
        the escrow contract to understand a non-human counterparty,
        which is real added complexity for a use case (practice/
        calibration) that was never meant to involve stakes anyway.
        """

        bot = await self.get_or_create_bot_user()

        offer = MatchOffer(
            id=uuid4(),
            owner_id=human.id,
            wallet_id=None,
            stake=0,
            match_type=MatchType.BO1,
            time_control=time_control,
            status=OfferStatus.ACCEPTED,
        )

        await self.offer_repo.save(offer)

        match = await self.match_service.create(offer, bot)

        game = await self.game_service.create_first_game(match)

        return match, game
