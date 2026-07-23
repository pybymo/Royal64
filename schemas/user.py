from uuid import UUID

from pydantic import BaseModel


class UserCreate(BaseModel):

    telegram_id: int

    username: str | None = None

    first_name: str | None = None

    last_name: str | None = None

    language: str = "en"


class UserRead(BaseModel):

    id: UUID

    telegram_id: int

    username: str | None

    first_name: str | None

    last_name: str | None

    language: str

    trust_score: float

    calibration_games_completed: int

    wins: int

    losses: int

    draws: int

    free_games: int

    paid_games: int

    is_admin: bool

    is_banned: bool

    model_config = {
        "from_attributes": True
    }