from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base
from database.mixins import TimestampMixin, UUIDMixin


class Wallet(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "wallets"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    address: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        nullable=False,
    )

    network: Mapped[str] = mapped_column(
        String(16),
        default="TON",
        nullable=False,
    )

    is_default: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    user = relationship(
    "User",
    back_populates="wallets",
    )