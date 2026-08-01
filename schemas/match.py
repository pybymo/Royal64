from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from database.models.match import MatchStatus


class MatchOut(BaseModel):
    id: UUID
    offer_id: UUID
    white_player_id: UUID
    black_player_id: UUID
    amount: float
    currency: str
    games_required: int
    status: MatchStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class MatchHistoryEntry(BaseModel):
    id: UUID
    opponent_username: str | None
    amount: float
    currency: str
    status: MatchStatus
    outcome: str  # "WON" | "LOST" | "DRAW" | "PENDING"
    created_at: datetime
