from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models.match_offer import MatchOffer


class MatchOfferRepository:

    def __init__(self, session: AsyncSession):

        self.session = session

    async def create(self, offer: MatchOffer):

        self.session.add(offer)

        await self.session.commit()

        await self.session.refresh(offer)

        return offer

    async def get(self, offer_id: UUID):

        result = await self.session.execute(

            select(MatchOffer).where(
                MatchOffer.id == offer_id
            )

        )

        return result.scalar_one_or_none()

    async def list_open(self):

        result = await self.session.execute(

            select(MatchOffer).where(
                MatchOffer.status == "OPEN"
            )

        )

        return result.scalars().all()