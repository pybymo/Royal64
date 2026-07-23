from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models.match import Match


class MatchRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        match: Match,
    ):

        self.session.add(match)
        await self.session.commit()
        await self.session.refresh(match)

        return match

    async def by_id(
        self,
        match_id: UUID,
    ):

        stmt = select(Match).where(
            Match.id == match_id
        )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()