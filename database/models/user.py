from sqlalchemy import BigInteger, Boolean, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base
from database.mixins import TimestampMixin, UUIDMixin


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    telegram_id: Mapped[int] = mapped_column(
        BigInteger,
        unique=True,
        nullable=False,
        index=True,
    )

    username: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    first_name: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    last_name: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    language: Mapped[str] = mapped_column(
        String(8),
        default="en",
        nullable=False,
    )

    country: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True,
    )

    timezone: Mapped[str] = mapped_column(
        String(64),
        default="UTC",
        nullable=False,
    )

    trust_score: Mapped[float] = mapped_column(
        Float,
        default=100.0,
        nullable=False,
    )

    calibration_games_completed: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    fingerprint_status: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    wins: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    losses: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    draws: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    free_games: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    paid_games: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    is_admin: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_banned: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    last_seen: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    wallets = relationship(
        "Wallet",
        back_populates="user",
        cascade="all, delete-orphan",
    )