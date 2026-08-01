from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_current_user
from database.models.user import User
from database.session import get_session
from repositories.match_repository import MatchRepository
from repositories.user_repository import UserRepository
from schemas.match import MatchHistoryEntry

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/mine", response_model=list[MatchHistoryEntry])
async def my_matches(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    match_repo = MatchRepository(session)
    user_repo = UserRepository(session)

    matches = await match_repo.list_for_user(user.id)

    entries: list[MatchHistoryEntry] = []

    for match in matches:

        is_white = match.white_player_id == user.id
        opponent_id = match.black_player_id if is_white else match.white_player_id

        opponent = await user_repo.get_by_id(opponent_id)

        if match.status.value != "FINISHED":
            outcome = "PENDING"
        elif match.winner_id is None:
            outcome = "DRAW"
        elif match.winner_id == user.id:
            outcome = "WON"
        else:
            outcome = "LOST"

        entries.append(
            MatchHistoryEntry(
                id=match.id,
                opponent_username=opponent.username if opponent else None,
                amount=float(match.amount),
                currency=match.currency,
                status=match.status,
                outcome=outcome,
                created_at=match.created_at,
            )
        )

    return entries
