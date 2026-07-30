from uuid import uuid4

from database.models.match import Match, MatchStatus

from repositories.match_repository import MatchRepository


GAMES_REQUIRED = {
    "BO1": 1,
    "BO3": 3,
}


class MatchService:

    def __init__(self, session):

        self.repo = MatchRepository(session)

    async def create(
        self,
        offer,
        accepter,
    ):

        match = Match(
            id=uuid4(),
            offer_id=offer.id,
            white_player_id=offer.owner_id,
            black_player_id=accepter.id,
            amount=offer.stake,
            currency="TON",
            games_required=GAMES_REQUIRED.get(offer.match_type, 1),
            status=MatchStatus.ACTIVE,
        )

        return await self.repo.create(match)
