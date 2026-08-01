from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_current_user
from core.exceptions import EscrowError, PlayerWalletNotVerifiedError, Royal64Error
from database.models.user import User
from database.session import get_session
from schemas.match import MatchOut
from schemas.offer import OfferCreate, OfferOut
from services.offer_service import OfferService

router = APIRouter(prefix="/offers", tags=["offers"])


@router.get("", response_model=list[OfferOut])
async def list_offers(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    service = OfferService(session)
    return await service.list_open()


@router.post("", response_model=OfferOut)
async def create_offer(
    body: OfferCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    service = OfferService(session)

    try:
        return await service.create(user, body)

    except PlayerWalletNotVerifiedError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/{offer_id}/accept", response_model=MatchOut)
async def accept_offer(
    offer_id: UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    service = OfferService(session)

    offer = await service.repo.by_id(offer_id)

    if offer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="offer not found")

    if offer.owner_id == user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="you can't accept your own offer",
        )

    try:
        return await service.accept(offer, user)

    except PlayerWalletNotVerifiedError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    except EscrowError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"could not set up escrow: {exc}",
        ) from exc

    except Royal64Error as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
