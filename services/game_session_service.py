from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class GameSession:

    game_id: UUID

    white_id: UUID

    black_id: UUID

    current_fen: str

    turn: str

    white_time: int

    black_time: int

    started_at: datetime

    last_move_at: datetime

    move_number: int = 0

    finished: bool = False


class GameSessionService:

    def __init__(self):

        self.sessions: dict[UUID, GameSession] = {}

        # game_id -> {"white": asyncio.Task, "black": asyncio.Task}
        # for the pending 60s-grace-period timers. Lives here rather
        # than on GameSession itself since asyncio.Task isn't really
        # "game state" — it's connection-handling plumbing — but it
        # needs the same shared-across-connections lifetime.
        self.pending_disconnects: dict[UUID, dict[str, object]] = {}

    def create(

        self,

        game,

        fen: str,

        minutes: int,

    ):

        session = GameSession(

            game_id=game.id,

            white_id=game.white_player_id,

            black_id=game.black_player_id,

            current_fen=fen,

            turn="white",

            white_time=minutes * 60,

            black_time=minutes * 60,

            started_at=datetime.utcnow(),

            last_move_at=datetime.utcnow(),

        )

        self.sessions[game.id] = session

        return session

    def get(

        self,

        game_id,

    ):

        return self.sessions.get(game_id)

    def remove(

        self,

        game_id,

    ):

        self.sessions.pop(game_id, None)

        pending = self.pending_disconnects.pop(game_id, None)

        if pending:
            for task in pending.values():
                task.cancel()

    def set_pending_disconnect(self, game_id, color: str, task) -> None:

        self.pending_disconnects.setdefault(game_id, {})[color] = task

    def pop_pending_disconnect(self, game_id, color: str):

        bucket = self.pending_disconnects.get(game_id)

        if not bucket:
            return None

        return bucket.pop(color, None)

    def update_fen(

        self,

        game_id,

        fen,

    ):

        session = self.sessions[game_id]

        session.current_fen = fen

        session.move_number += 1

        session.turn = (

            "black"

            if session.turn == "white"

            else "white"

        )

        session.last_move_at = datetime.utcnow()

    def finish(

        self,

        game_id,

    ):

        self.sessions[game_id].finished = True

        pending = self.pending_disconnects.pop(game_id, None)

        if pending:
            for task in pending.values():
                task.cancel()


# Module-level singleton — in-memory game state needs to be shared
# across every websocket connection handling a given game within this
# process. This does NOT survive a restart and does NOT work across
# multiple app workers/instances — a Redis-backed session store is the
# natural next step once this needs to run on more than one process
# (same scaling conversation as the "1M users" architecture question).
game_sessions = GameSessionService()