from uuid import UUID

from sqlalchemy import ForeignKey, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base
from database.mixins import TimestampMixin, UUIDMixin


class Fingerprint(Base, UUIDMixin, TimestampMixin):
    """
    A player's running behavioral baseline — one row per user, updated
    after every analyzed game (see services/anticheat/service.py).
    Deliberately NOT treated as fixed: it's recomputed as a rolling
    average so a player's fingerprint can drift with their real skill
    over time, per the MVP notes on not freezing it at calibration.
    """

    __tablename__ = "fingerprints"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        unique=True,
    )

    games_analyzed: Mapped[int] = mapped_column(Integer, default=0)

    avg_acpl: Mapped[float] = mapped_column(Float, default=0.0)
    acpl_stddev: Mapped[float] = mapped_column(Float, default=0.0)

    avg_move_time_ms: Mapped[float] = mapped_column(Float, default=0.0)
    move_time_stddev_ms: Mapped[float] = mapped_column(Float, default=0.0)
