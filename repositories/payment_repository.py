from uuid import UUID

from sqlalchemy import select

from database.models.payment import Payment
from repositories.base import BaseRepository


class PaymentRepository(BaseRepository[Payment]):

    async def get_by_match_id(self, match_id: UUID) -> Payment | None:

        stmt = select(Payment).where(Payment.match_id == match_id)
        result = await self.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_onchain_id(self, onchain_match_id: int) -> Payment | None:

        stmt = select(Payment).where(Payment.onchain_match_id == onchain_match_id)
        result = await self.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payment: Payment) -> Payment:

        await self.add(payment)
        await self.commit()
        await self.refresh(payment)
        return payment

    async def save(self, payment: Payment) -> Payment:

        await self.commit()
        await self.refresh(payment)
        return payment
