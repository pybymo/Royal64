from uuid import UUID

from sqlalchemy import BigInteger, Enum as SQLEnum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from core.enums import EscrowStatus
from database.base import Base
from database.mixins import TimestampMixin, UUIDMixin


class Payment(Base, UUIDMixin, TimestampMixin):
    """
    Off-chain record of an on-chain escrow match. This table is a
    cache/audit trail for the app to query quickly — the escrow
    contract's own state (see contracts/escrow/escrow.tact) is always
    the source of truth for who actually gets paid. Nothing here moves
    money; services/payment/service.py only reads/writes this table
    and asks chain-writer to talk to the chain.
    """

    __tablename__ = "payments"

    match_id: Mapped[UUID] = mapped_column(
        ForeignKey("matches.id"),
        nullable=False,
        unique=True,
    )

    # The uint64 match id used on-chain — distinct from our internal
    # UUID above, since the contract addresses matches by a compact int.
    onchain_match_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        unique=True,
    )

    escrow_address: Mapped[str] = mapped_column(String(72), nullable=False)

    stake: Mapped[float] = mapped_column(Numeric(18, 8), nullable=False)

    status: Mapped[EscrowStatus] = mapped_column(
        SQLEnum(EscrowStatus),
        default=EscrowStatus.WAITING,
        nullable=False,
    )

    create_tx_hash: Mapped[str | None] = mapped_column(String(64))
    resolve_tx_hash: Mapped[str | None] = mapped_column(String(64))

    winner_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"))
