"""
Session tokens issued to a client after its wallet has been verified
via TON Connect (see services/wallet/service.py). This is a normal
JWT session cookie/header — it has nothing to do with the wallet's
own Ed25519 keypair.
"""

from datetime import datetime, timedelta, UTC
from uuid import UUID

import jwt

from core.config import settings


ALGORITHM = settings.JWT_ALGORITHM


def create_session_token(user_id: UUID) -> str:

    now = datetime.now(UTC)

    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=settings.SESSION_TTL_MINUTES),
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_session_token(token: str) -> UUID:
    """
    Raises jwt.PyJWTError (ExpiredSignatureError, InvalidTokenError, ...)
    on any invalid/expired/tampered token. Callers should catch that and
    return 401 — never swallow it silently.
    """

    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[ALGORITHM],
    )

    return UUID(payload["sub"])
