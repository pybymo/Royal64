from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base
from database.mixins import TimestampMixin, UUIDMixin


class AntiCheatLog(Base, UUIDMixin, TimestampMixin):
    """
    One row per (game, player) analysis. This is the audit trail an
    admin reviews — it never takes automatic action on its own (no
    auto-ban, no auto-forfeit); see docs/ANTICHEAT.md for why.
    """

    __tablename__ = "anti_cheat_logs"

    game_id: Mapped[UUID] = mapped_column(ForeignKey("games.id"), nullable=False)
    player_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)

    acpl: Mapped[float] = mapped_column(Float, nullable=False)
    avg_move_time_ms: Mapped[float] = mapped_column(Float, nullable=False)
    timing_cv: Mapped[float] = mapped_column(Float, nullable=False)

    flagged: Mapped[bool] = mapped_column(Boolean, default=False)
    reason: Mapped[str | None] = mapped_column(String(255))

    trust_score_before: Mapped[float] = mapped_column(Float, nullable=False)
    trust_score_after: Mapped[float] = mapped_column(Float, nullable=False)
