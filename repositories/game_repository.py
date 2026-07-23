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