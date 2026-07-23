from sqlalchemy import select

from database.models.user import User

from repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):

    async def get_by_telegram_id(
        self,
        telegram_id: int,
    ) -> User | None:

        stmt = (
            select(User)
            .where(User.telegram_id == telegram_id)
        )

        result = await self.execute(stmt)

        return result.scalar_one_or_none()

    async def get_by_id(
        self,
        user_id,
    ) -> User | None:

        return await self.get(User, user_id)

    async def create(
        self,
        user: User,
    ) -> User:

        await self.add(user)

        await self.commit()

        await self.refresh(user)

        return user

    async def save(
        self,
        user: User,
    ) -> User:

        await self.commit()

        await self.refresh(user)

        return user