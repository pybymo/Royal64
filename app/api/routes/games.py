from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_current_user
from database.models.user import User
from database.session import get_session
from repositories.game_repository import GameRepository
from repositories.match_repository import MatchRepository
from schemas.game import GameOut

router = APIRouter(tags=["games"])


@router.get("/matches/{match_id}/current-game", response_model=GameOut)
async def get_current_game(
    match_id: UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    match = await MatchRepository(session).by_id(match_id)

    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="match not found")

    if user.id not in (match.white_player_id, match.black_player_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="not your match")

    game = await GameRepository(session).get_latest_for_match(match_id)

    if game is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="no game for this match yet")

    return game


@router.get("/games/{game_id}", response_model=GameOut)
async def get_game(
    game_id: UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    game = await GameRepository(session).get_by_id(game_id)

    if game is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="game not found")

    if user.id not in (game.white_player_id, game.black_player_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="not your game")

    return game
