"""
Minimal Redis-backed fixed-window rate limiter for sensitive endpoints.

Not meant to replace an edge/API-gateway limiter in production (put one
in front of this too), but the app must not rely solely on
infrastructure it doesn't control for its most sensitive routes.
"""

from fastapi import HTTPException, Request, status

from services.redis_service import redis


def rate_limiter(key_prefix: str, limit: int, window_seconds: int):
    """
    Returns a FastAPI dependency that allows at most `limit` calls per
    `window_seconds` per (key_prefix, client IP). IP-based so it also
    throttles pre-auth abuse (e.g. hammering /wallet/challenge with
    invalid or no session tokens), not just already-authenticated
    callers.
    """

    async def _dependency(request: Request) -> None:

        identity = request.client.host if request.client else "unknown"

        key = f"ratelimit:{key_prefix}:{identity}"

        current = await redis.incr(key)

        if current == 1:
            await redis.expire(key, window_seconds)

        if current > limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests — please slow down and try again shortly.",
            )

    return _dependency
