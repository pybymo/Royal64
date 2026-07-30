from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.dependencies import get_current_user
from core.exceptions import TonApiUnavailableError, WalletError
from core.rate_limit import rate_limiter
from database.models.user import User
from database.session import get_session
from schemas.wallet import (
    WalletChallengeOut,
    WalletConnectRequest,
    WalletOut,
)
from services.wallet import WalletService

router = APIRouter(prefix="/wallet", tags=["wallet"])


def _raise_for(exc: WalletError) -> None:
    """
    Maps our domain exceptions to HTTP responses. TonAPI being
    unreachable is *our* dependency failing (503, retry-able) — every
    other wallet error is a problem with the request itself (400).
    """

    if isinstance(exc, TonApiUnavailableError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Wallet verification service is temporarily unavailable. Please try again shortly.",
        ) from exc

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=str(exc),
    ) from exc


@router.post(
    "/challenge",
    response_model=WalletChallengeOut,
    dependencies=[Depends(rate_limiter("wallet_challenge", limit=10, window_seconds=60))],
)
async def create_challenge(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Issues a one-time nonce for the frontend to pass as the TonConnect
    `tonProof` payload before opening the wallet picker.
    """

    service = WalletService(session)

    payload = await service.generate_challenge(user.id)

    return WalletChallengeOut(
        payload=payload,
        expires_in=settings.WALLET_CHALLENGE_TTL_SECONDS,
    )


@router.post(
    "/connect",
    response_model=WalletOut,
    dependencies=[Depends(rate_limiter("wallet_connect", limit=10, window_seconds=60))],
)
async def connect_wallet(
    body: WalletConnectRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Verifies the signed ton_proof from a previously issued /challenge
    and, on success, links the wallet address to the current user.
    """

    service = WalletService(session)

    try:
        wallet = await service.connect(user, body)

    except WalletError as exc:
        _raise_for(exc)

    return wallet


@router.patch(
    "/{wallet_id}/default",
    response_model=WalletOut,
    dependencies=[Depends(rate_limiter("wallet_set_default", limit=20, window_seconds=60))],
)
async def set_default_wallet(
    wallet_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    The only sanctioned way to change which of the user's already-
    verified wallets is primary. Connecting a new wallet never does
    this implicitly.
    """

    service = WalletService(session)

    try:
        wallet = await service.set_default(user, wallet_id)

    except WalletError as exc:
        _raise_for(exc)

    return wallet
