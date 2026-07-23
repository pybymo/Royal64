from sqlalchemy import Enum
from sqlalchemy import Float
from sqlalchemy import ForeignKey
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from core.enums import MatchType
from core.enums import OfferStatus
from database.base import Base
from database.mixins import TimestampMixin
from database.mixins import UUIDMixin


class MatchOffer(Base, UUIDMixin, TimestampMixin):

    __tablename__ = "match_offers"

    owner_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    wallet_id: Mapped[str] = mapped_column(
        ForeignKey("wallets.id"),
        nullable=False,
    )

    stake: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    match_type: Mapped[MatchType] = mapped_column(
        Enum(MatchType),
        nullable=False,
        default=MatchType.BO1,
    )

    time_control: Mapped[int] = mapped_column(
        nullable=False,
    )

    status: Mapped[OfferStatus] = mapped_column(
        Enum(OfferStatus),
        default=OfferStatus.OPEN,
        nullable=False,
    )

    note: Mapped[str | None] = mapped_column(
        String(200),
    )