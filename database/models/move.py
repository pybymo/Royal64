from uuid import UUID

from sqlalchemy import Boolean
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String

from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from database.base import Base
from database.mixins import TimestampMixin
from database.mixins import UUIDMixin


class Move(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "moves"

    game_id: Mapped[UUID] = mapped_column(
        ForeignKey("games.id"),
        nullable=False,
    )

    player_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    move_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    san: Mapped[str] = mapped_column(
        String(32),
    )

    uci: Mapped[str] = mapped_column(
        String(8),
    )

    fen_after: Mapped[str] = mapped_column(
        String(128),
    )

    move_time_ms: Mapped[int] = mapped_column(
        Integer,
    )

    is_check: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    is_checkmate: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )