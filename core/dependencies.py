import jwt
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import decode_session_token
from database.models.user import User
from database.session import SessionLocal, get_session
from repositories.user_repository import UserRepository


class UnitOfWork:

    async def __aenter__(self):

        self.session = SessionLocal()

        return self.session

    async def __aexit__(
        self,
        exc_type,
        exc,
        tb,
    ):

        if exc:

            await self.session.rollback()

        else:

            await self.session.commit()

        await self.session.close()


async def get_current_user(
    authorization: str | None = Header(default=None),
    session: AsyncSession = Depends(get_session),
) -> User:
    """
    Resolves the caller's User from the `Authorization: Bearer <token>`
    session header issued by the Telegram login flow (see
    core.security.create_session_token). Raises 401 on anything wrong
    with the token — never guesses or falls back silently.
    """

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer session token",
        )

    token = authorization.removeprefix("Bearer ").strip()

    try:
        user_id = decode_session_token(token)

    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
        )

    user = await UserRepository(session).get_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
