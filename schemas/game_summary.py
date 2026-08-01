from uuid import UUID

from pydantic import BaseModel


class GameSummaryOut(BaseModel):
    game_id: UUID
    result: str  # "WHITE" | "BLACK" | "DRAW"
    end_reason: str | None

    winner_username: str | None
    loser_username: str | None

    total_moves: int
    winner_time_used_ms: int | None

    stake: float
    currency: str

    time_control_minutes: int
