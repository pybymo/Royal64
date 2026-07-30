from enum import Enum


class MatchType(str, Enum):
    BO1 = "BO1"
    BO3 = "BO3"


class MatchStatus(str, Enum):
    WAITING = "WAITING"
    RUNNING = "RUNNING"
    FINISHED = "FINISHED"
    CANCELLED = "CANCELLED"


class OfferStatus(str, Enum):
    OPEN = "OPEN"
    ACCEPTED = "ACCEPTED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class EscrowStatus(str, Enum):
    """Mirrors the on-chain contract's Match.status — this is our
    off-chain cache/audit trail of that state, never the source of
    truth for who gets paid."""

    WAITING = "WAITING"
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
    CANCELLED = "CANCELLED"