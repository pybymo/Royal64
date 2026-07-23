from enum import Enum
from uuid import UUID

from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import Numeric
from sqlalchemy import String

from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from database.base import Base
from database.mixins import TimestampMixin
from database.mixins import UUIDMixin


class MatchStatus(str, Enum):
    WAITING = "WAITING"
    ACTIVE = "ACTIVE"
    FINISHED = "FINISHED"
    CANCELLED = "CANCELLED"


class Match(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "matches"

    offer_id: Mapped[UUID] = mapped_column(
        ForeignKey("match_offers.id"),
        nullable=False,
    )

    white_player_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    black_player_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    winner_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id"),
    )

    amount: Mapped[float] = mapped_column(
        Numeric(18, 8),
        nullable=False,
    )

    currency: Mapped[str] = mapped_column(
        String(10),
        default="TON",
    )

    games_required: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    white_score: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    black_score: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    status: Mapped[MatchStatus] = mapped_column(
        SQLEnum(MatchStatus),
        default=MatchStatus.WAITING,
        nullable=False,
    )

    escrow_contract: Mapped[str | None] = mapped_column(
        String(128),
    )