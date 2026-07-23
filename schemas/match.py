from uuid import UUID

from pydantic import BaseModel


class MatchAccept(BaseModel):
    offer_id: UUID


class MatchResponse(BaseModel):
    id: UUID
    offer_id: UUID
    owner_id: UUID
    accepter_id: UUID
    stake: float
    match_type: str
    status: str