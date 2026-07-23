from uuid import UUID

from pydantic import BaseModel

from core.enums import MatchType


class MatchOfferCreate(BaseModel):

    wallet_id: UUID

    stake: float

    match_type: MatchType

    time_control: int


class MatchOfferRead(BaseModel):

    id: UUID

    owner_id: UUID

    wallet_id: UUID

    stake: float

    match_type: MatchType

    time_control: int

    status: str