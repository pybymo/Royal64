from database.models.user import User
from repositories.user_repository import UserRepository
from schemas.user import UserCreate


class UserService:

    def __init__(self, session):

        self.repo = UserRepository(session)

    async def register(
        self,
        data: UserCreate,
    ) -> User:

        user = await self.repo.get_by_telegram_id(
            data.telegram_id
        )

        if user:

            user.username = data.username
            user.first_name = data.first_name
            user.last_name = data.last_name
            user.language = data.language

            return await self.repo.save(user)

        user = User(
            telegram_id=data.telegram_id,
            username=data.username,
            first_name=data.first_name,
            last_name=data.last_name,
            language=data.language,
        )

        return await self.repo.create(user)

    async def get(
        self,
        telegram_id: int,
    ):

        return await self.repo.get_by_telegram_id(
            telegram_id
        )