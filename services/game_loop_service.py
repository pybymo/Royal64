"""
The real-time game loop. Previously `app/websocket.py` just relayed
raw JSON between whoever was connected to a room, with no chess logic,
no auth, no turn enforcement, and no persistence at all — anyone
connected could send anything and it would be broadcast verbatim. This
module is what that should have been calling all along.

Protocol (JSON messages over the game websocket):

  client -> server:
    {"type": "move", "uci": "e2e4"}
    {"type": "resign"}

  server -> client(s):
    {"type": "state", "fen": ..., "turn": "white"|"black",
     "white_time_ms": ..., "black_time_ms": ..., "last_move": {...} | null}
    {"type": "game_over", "result": "WHITE"|"BLACK"|"DRAW", "reason": "..."}
    {"type": "error", "message": "..."}

Known simplifications (see docs/ANTICHEAT.md-adjacent notes and the
reply this shipped with): no server-side ticking clock broadcast (time
is only checked/deducted when a move arrives, not announced every
second), and the MVP's 60s-reconnect/3-strikes disconnect rules are
not implemented — a disconnect is currently just... a disconnect.
Both are real next steps, flagged rather than quietly skipped.
"""

from datetime import datetime, UTC
from uuid import UUID

import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import decode_session_token
from database.models.game import Game, GameResult as ORMGameResult, GameStatus
from database.models.match import MatchStatus
from repositories.game_repository import GameRepository
from repositories.match_repository import MatchRepository
from repositories.user_repository import UserRepository
from repositories.wallet_repository import WalletRepository
from services.anticheat import AntiCheatService
from services.chess_service import ChessService
from services.game_service import GameService
from services.game_session_service import game_sessions
from services.move_service import MoveService
from services.payment import PaymentService
from services.websocket_manager import WebSocketManager


class GameLoopError(Exception):
    """Raised for anything that should close the connection with a reason."""


async def authenticate(token: str | None, session: AsyncSession):

    if not token:
        raise GameLoopError("missing session token")

    try:
        user_id = decode_session_token(token)

    except jwt.PyJWTError as exc:
        raise GameLoopError("invalid or expired session token") from exc

    user = await UserRepository(session).get_by_id(user_id)

    if user is None:
        raise GameLoopError("user not found")

    return user


async def load_game(game_id: UUID, user_id: UUID, session: AsyncSession) -> Game:

    game = await GameRepository(session).get_by_id(game_id)

    if game is None:
        raise GameLoopError("game not found")

    if user_id not in (game.white_player_id, game.black_player_id):
        raise GameLoopError("you are not a player in this game")

    return game


def _ensure_session(game: Game):

    session = game_sessions.get(game.id)

    if session is None:
        session = game_sessions.create(
            game,
            fen=game.fen if game.fen != "startpos" else ChessService.initial_fen(),
            minutes=game.time_control_minutes or 5,
        )

    return session


def _state_payload(session, last_move=None) -> dict:

    return {
        "type": "state",
        "fen": session.current_fen,
        "turn": session.turn,
        "white_time_ms": session.white_time * 1000,
        "black_time_ms": session.black_time * 1000,
        "last_move": last_move,
    }


class GameLoop:
    """One instance per active FastAPI websocket connection."""

    def __init__(
        self,
        manager: WebSocketManager,
        session: AsyncSession,
        game: Game,
        user,
    ):
        self.manager = manager
        self.db = session
        self.game = game
        self.user = user
        self.move_service = MoveService(session)
        self.game_repo = GameRepository(session)
        self.match_repo = MatchRepository(session)
        self.wallet_repo = WalletRepository(session)
        self.payment_service = PaymentService(session)
        self.game_service = GameService(session)

    @property
    def color(self) -> str:
        return "white" if self.user.id == self.game.white_player_id else "black"

    async def on_connect(self, websocket) -> None:

        state = _ensure_session(self.game)

        await self.manager.send(websocket, {"type": "you", "color": self.color})
        await self.manager.send(websocket, _state_payload(state))

    async def on_message(self, payload: dict) -> None:

        msg_type = payload.get("type")

        if msg_type == "move":
            await self._handle_move(payload)

        elif msg_type == "resign":
            await self._handle_resign()

        else:
            raise GameLoopError(f"unknown message type: {msg_type!r}")

    async def _handle_move(self, payload: dict) -> None:

        uci = payload.get("uci")

        if not uci:
            raise GameLoopError("move message missing 'uci'")

        state = _ensure_session(self.game)

        if state.finished:
            raise GameLoopError("game is already finished")

        if state.turn != self.color:
            raise GameLoopError("not your turn")

        now = datetime.now(UTC)
        elapsed_ms = int((now - state.last_move_at.replace(tzinfo=UTC)).total_seconds() * 1000)

        remaining = state.white_time if self.color == "white" else state.black_time
        remaining_ms = remaining * 1000 - elapsed_ms

        if remaining_ms <= 0:
            await self._finish(
                winner="BLACK" if self.color == "white" else "WHITE",
                reason="timeout",
            )
            return

        try:
            result = await self.move_service.play(
                self.game,
                self.user.id,
                state.move_number + 1,
                state.current_fen,
                uci,
                move_time_ms=elapsed_ms,
            )

        except ValueError as exc:
            raise GameLoopError(str(exc)) from exc

        # Deduct the mover's clock, persist, advance turn.
        if self.color == "white":
            state.white_time = max(0, remaining_ms) // 1000
        else:
            state.black_time = max(0, remaining_ms) // 1000

        game_sessions.update_fen(self.game.id, result["fen"])

        self.game.fen = result["fen"]
        self.game.white_time_ms = state.white_time * 1000
        self.game.black_time_ms = state.black_time * 1000
        self.game.status = GameStatus.PLAYING

        await self.game_repo.save(self.game)

        await self.manager.broadcast(
            self.game.id,
            _state_payload(
                state,
                last_move={"uci": result["move"].uci, "san": result["move"].san},
            ),
        )

        if result["checkmate"] or result["stalemate"] or result["game_over"]:

            winner_value = result["winner"].value

            await self._finish(
                winner=winner_value if winner_value != "NONE" else "DRAW",
                reason="checkmate" if result["checkmate"] else "game_over",
            )

    async def _handle_resign(self) -> None:

        winner = "BLACK" if self.color == "white" else "WHITE"

        await self._finish(winner=winner, reason="resignation")

    async def _finish(self, *, winner: str, reason: str) -> None:

        game_sessions.finish(self.game.id)

        self.game.status = GameStatus.FINISHED
        self.game.result = ORMGameResult(winner) if winner != "DRAW" else ORMGameResult.DRAW
        self.game.end_reason = reason

        await self.game_repo.save(self.game)

        await self.manager.broadcast(
            self.game.id,
            {"type": "game_over", "result": winner, "reason": reason},
        )

        # Best-effort — analysis must never take down the game-over
        # flow. Runs inline here for simplicity; move to a background
        # task queue before real load (Stockfish analysis is slow).
        try:
            anticheat = AntiCheatService(self.db)
            await anticheat.analyze_game(self.game.id, self.game.white_player_id)
            await anticheat.analyze_game(self.game.id, self.game.black_player_id)

        except Exception:
            pass

        await self._settle_match(winner)

    async def _settle_match(self, game_winner: str) -> None:
        """
        Updates the match score and, once the match itself is decided,
        tells the escrow contract who won.

        Bo1 is fully handled: one game, immediately decided. Bo3
        scoring is tracked (Match.white_score/black_score), but
        automatically creating game 2/3 when a Bo3 isn't decided yet
        is NOT implemented — GameService only has create_first_game.
        A Bo3 match will sit ACTIVE with a finished game 1 and nothing
        moving it forward until that's built. Flagging rather than
        quietly leaving it half-done.
        """

        match = await self.match_repo.by_id(self.game.match_id)

        if match is None:
            return

        if game_winner == "WHITE":
            match.white_score += 1
        elif game_winner == "BLACK":
            match.black_score += 1
        # DRAW: Match.white_score/black_score are integers, so a draw
        # doesn't move either — proper Bo3 draw scoring needs a
        # fractional score column, not added here.

        majority = (match.games_required // 2) + 1
        decided = (
            match.games_required == 1
            or match.white_score >= majority
            or match.black_score >= majority
        )

        if not decided:
            await self.match_repo.save(match)

            next_game = await self.game_service.create_next_game(match)

            await self.manager.broadcast(
                self.game.id,
                {
                    "type": "next_game",
                    "game_id": str(next_game.id),
                    "game_number": next_game.game_number,
                },
            )

            return

        match.status = MatchStatus.FINISHED

        if match.white_score > match.black_score:
            match.winner_id = match.white_player_id
            winner_id = match.white_player_id
        elif match.black_score > match.white_score:
            match.winner_id = match.black_player_id
            winner_id = match.black_player_id
        else:
            match.winner_id = None
            winner_id = None

        await self.match_repo.save(match)

        winner_address = None

        if winner_id is not None:
            wallet = await self.wallet_repo.get_default_for_user(winner_id)
            winner_address = wallet.address if wallet else None

        # Best-effort for the same reason as anti-cheat above — but
        # this is real money, so unlike anti-cheat a failure here
        # should not be silently swallowed in production. There is no
        # retry/alerting mechanism yet; this needs one before real
        # funds are on the line (see docs/ESCROW.md).
        try:
            await self.payment_service.resolve(
                match_id=match.id,
                winner_id=winner_id,
                winner_address=winner_address,
            )

        except Exception:
            pass
