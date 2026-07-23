from uuid import uuid4

from database.models.match import Match

from repositories.match_repository import MatchRepository


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

            owner_id=offer.owner_id,

            accepter_id=accepter.id,

            stake=offer.stake,

            match_type=offer.match_type,

            status="ACTIVE",

        )

        return await self.repo.create(match)