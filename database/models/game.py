from enum import Enum
from uuid import UUID

from sqlalchemy import Boolean
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey
from sqlalchemy import Integer

from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from database.base import Base
from database.mixins import TimestampMixin
from database.mixins import UUIDMixin


class GameStatus(str, Enum):
    WAITING = "WAITING"
    PLAYING = "PLAYING"
    FINISHED = "FINISHED"


class GameResult(str, Enum):
    WHITE = "WHITE"
    BLACK = "BLACK"
    DRAW = "DRAW"


class Game(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "games"

    match_id: Mapped[UUID] = mapped_column(
        ForeignKey("matches.id"),
        nullable=False,
    )

    game_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    status: Mapped[GameStatus] = mapped_column(
        SQLEnum(GameStatus),
        default=GameStatus.WAITING,
    )

    result: Mapped[GameResult | None] = mapped_column(
        SQLEnum(GameResult),
    )

    time_control_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    white_time_ms: Mapped[int] = mapped_column(
        Integer,
    )

    black_time_ms: Mapped[int] = mapped_column(
        Integer,
    )

    active_white: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    disconnect_white: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    disconnect_black: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    fen: Mapped[str] = mapped_column(
        default="startpos",
    )