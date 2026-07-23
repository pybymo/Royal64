from sqlalchemy import desc
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models.move import Move


class MoveRepository:

    def __init__(self, session: AsyncSession):

        self.session = session

    async def create(
        self,
        move: Move,
    ):

        self.session.add(move)

        await self.session.commit()

        await self.session.refresh(move)

        return move

    async def last_move(
        self,
        game_id,
    ):

        stmt = (

            select(Move)

            .where(

                Move.game_id == game_id

            )

            .order_by(

                desc(Move.move_number)

            )

            .limit(1)

        )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()