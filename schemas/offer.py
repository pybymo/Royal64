from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel

from core.enums import MatchType, OfferStatus

Currency = Literal["TON", "USDT"]


class OfferCreate(BaseModel):
    stake: float
    currency: Currency = "TON"
    match_type: MatchType = MatchType.BO1
    time_control: int  # minutes per player
    note: str | None = None


class OfferOut(BaseModel):
    id: UUID
    owner_id: UUID
    stake: float
    currency: Currency
    match_type: MatchType
    time_control: int
    status: OfferStatus
    note: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
