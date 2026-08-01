from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from database.models.game import GameResult, GameStatus


class GameOut(BaseModel):
    id: UUID
    match_id: UUID
    game_number: int
    status: GameStatus
    result: GameResult | None
    time_control_minutes: int
    white_time_ms: int | None
    black_time_ms: int | None
    fen: str
    created_at: datetime

    model_config = {"from_attributes": True}
