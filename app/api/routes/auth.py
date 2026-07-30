from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.rate_limit import rate_limiter
from database.session import get_session
from schemas.auth import AuthResponse, TelegramAuthRequest
from schemas.user import UserRead
from services.auth import AuthService
from services.auth.service import TelegramAuthError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/telegram",
    response_model=AuthResponse,
    dependencies=[Depends(rate_limiter("auth_telegram", limit=20, window_seconds=60))],
)
async def telegram_login(
    body: TelegramAuthRequest,
    session: AsyncSession = Depends(get_session),
):
    """
    Exchanges a Telegram Mini App `initData` payload (already signed by
    Telegram) for a Royal64 session token. This is the only way the
    frontend gets a Bearer token — everything else (wallet connect,
    offers, etc.) requires it.
    """

    service = AuthService(session)

    try:
        token, user = await service.authenticate(body.init_data)

    except TelegramAuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    return AuthResponse(
        access_token=token,
        user=UserRead.model_validate(user),
    )
