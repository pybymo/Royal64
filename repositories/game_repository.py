from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models.game import Game


class GameRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        game: Game,
    ):

        self.session.add(game)

        await self.session.commit()

        await self.session.refresh(game)

        return game

    async def get_by_id(
        self,
        game_id: UUID,
    ):

        return await self.session.get(Game, game_id)

    async def get_latest_for_match(
        self,
        match_id: UUID,
    ):

        stmt = (
            select(Game)
            .where(Game.match_id == match_id)
            .order_by(Game.game_number.desc())
            .limit(1)
        )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()

    async def save(
        self,
        game: Game,
    ):

        await self.session.commit()

        await self.session.refresh(game)

        return game
