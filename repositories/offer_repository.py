from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.enums import OfferStatus
from database.models.match_offer import MatchOffer


class OfferRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def by_id(
        self,
        offer_id: UUID,
    ):

        stmt = (
            select(MatchOffer)
            .where(
                MatchOffer.id == offer_id
            )
        )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()

    async def list_open(self):

        stmt = (
            select(MatchOffer)
            .where(MatchOffer.status == OfferStatus.OPEN)
            .order_by(MatchOffer.created_at.desc())
        )

        result = await self.session.execute(stmt)

        return list(result.scalars().all())

    async def save(
        self,
        offer: MatchOffer,
    ):

        self.session.add(offer)

        await self.session.commit()

        await self.session.refresh(offer)

        return offer