from database.models.match_offer import MatchOffer
from repositories.match_offer_repository import MatchOfferRepository
from schemas.match_offer import MatchOfferCreate


class MatchOfferService:

    def __init__(self, session):

        self.repo = MatchOfferRepository(session)

    async def create(self, owner_id, data: MatchOfferCreate):

        offer = MatchOffer(

            owner_id=owner_id,

            wallet_id=data.wallet_id,

            stake=data.stake,

            match_type=data.match_type,

            time_control=data.time_control,

        )

        return await self.repo.create(offer)

    async def list_open(self):

        return await self.repo.list_open()