from uuid import UUID

from sqlalchemy import or_, select
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

    async def list_for_user(
        self,
        user_id: UUID,
        limit: int = 50,
    ):

        stmt = (
            select(Match)
            .where(
                or_(
                    Match.white_player_id == user_id,
                    Match.black_player_id == user_id,
                )
            )
            .order_by(Match.created_at.desc())
            .limit(limit)
        )

        result = await self.session.execute(stmt)

        return list(result.scalars().all())

    async def save(
        self,
        match: Match,
    ):

        await self.session.commit()
        await self.session.refresh(match)

        return match