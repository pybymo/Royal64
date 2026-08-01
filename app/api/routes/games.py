from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_current_user
from database.models.user import User
from database.session import get_session
from repositories.game_repository import GameRepository
from repositories.match_repository import MatchRepository
from repositories.move_repository import MoveRepository
from repositories.user_repository import UserRepository
from schemas.game import GameOut
from schemas.game_summary import GameSummaryOut

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


@router.get("/games/{game_id}/summary", response_model=GameSummaryOut)
async def get_game_summary(
    game_id: UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """
    Feeds the shareable win-card: who won, how, how many moves, how
    much time the winner had left to spend, and the stake. Only the
    two players in the game can fetch it.
    """

    game_repo = GameRepository(session)
    move_repo = MoveRepository(session)
    user_repo = UserRepository(session)
    match_repo = MatchRepository(session)

    game = await game_repo.get_by_id(game_id)

    if game is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="game not found")

    if user.id not in (game.white_player_id, game.black_player_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="not your game")

    if game.status.value != "FINISHED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="game not finished yet")

    white = await user_repo.get_by_id(game.white_player_id)
    black = await user_repo.get_by_id(game.black_player_id)

    match = await match_repo.by_id(game.match_id)

    moves = await move_repo.get_by_game(game_id)
    # Exclude the synthetic START row (move_number 0, player_id None).
    total_moves = len([m for m in moves if m.player_id is not None])

    result = game.result.value if game.result else "DRAW"

    if result == "WHITE":
        winner, loser = white, black
        winner_time_used_ms = (
            game.time_control_minutes * 60 * 1000 - (game.white_time_ms or 0)
        )
    elif result == "BLACK":
        winner, loser = black, white
        winner_time_used_ms = (
            game.time_control_minutes * 60 * 1000 - (game.black_time_ms or 0)
        )
    else:
        winner, loser = None, None
        winner_time_used_ms = None

    return GameSummaryOut(
        game_id=game.id,
        result=result,
        end_reason=game.end_reason,
        winner_username=winner.username if winner else None,
        loser_username=loser.username if loser else None,
        total_moves=total_moves,
        winner_time_used_ms=winner_time_used_ms,
        stake=float(match.amount) if match else 0.0,
        currency=match.currency if match else "TON",
        time_control_minutes=game.time_control_minutes,
    )
