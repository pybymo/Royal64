from services.match_service import MatchService
from services.game_service import GameService

from repositories.offer_repository import OfferRepository


class OfferService:

    def __init__(self, session):

        self.session = session

        self.repo = OfferRepository(session)

        self.match_service = MatchService(session)

        self.game_service = GameService(session)

    async def accept(

        self,

        offer,

        accepter,

    ):

        offer.status = "ACCEPTED"

        await self.repo.save(offer)

        match = await self.match_service.create(

            offer,

            accepter,

        )

        await self.game_service.create_first_game(

            match,

        )

        return match