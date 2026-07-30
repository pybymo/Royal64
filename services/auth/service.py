"""
Authenticates the Mini App frontend using Telegram's own WebApp
`initData` signature scheme, then issues our own session JWT (see
core/security.py) for everything after that — the frontend never sees
or handles the bot token.

Validation follows Telegram's documented algorithm exactly:
https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

    data_check_string = every "key=value" pair from initData except
                         `hash`, sorted alphabetically by key, joined
                         with "\n"
    secret_key = HMAC_SHA256(key="WebAppData", msg=bot_token)
    expected   = HMAC_SHA256(key=secret_key, msg=data_check_string)

If `expected` (hex) doesn't match the `hash` field, the payload was not
signed by Telegram for our bot and must be rejected outright — there is
no partial-trust fallback here.
"""

import hashlib
import hmac
import json
import time
from urllib.parse import parse_qsl

from core.config import settings
from core.exceptions import Royal64Error
from core.security import create_session_token
from schemas.user import UserCreate
from services.user_service import UserService

# How old an initData payload's auth_date may be before we refuse it.
# Telegram re-issues initData every time the Mini App is (re)opened, so
# this only needs to cover "don't accept a replayed payload from days
# ago" — it is not meant to be a tight window.
MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60


class TelegramAuthError(Royal64Error):
    """initData failed signature verification, was too old, or was malformed."""


class AuthService:

    def __init__(self, session):
        self.session = session
        self.user_service = UserService(session)

    def _verify_init_data(self, init_data: str) -> dict:

        pairs = parse_qsl(init_data, keep_blank_values=True, strict_parsing=False)

        data = dict(pairs)
        received_hash = data.pop("hash", None)

        if not received_hash:
            raise TelegramAuthError("initData missing hash")

        data_check_string = "\n".join(
            f"{key}={value}" for key, value in sorted(data.items())
        )

        secret_key = hmac.new(
            key=b"WebAppData",
            msg=settings.BOT_TOKEN.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).digest()

        expected_hash = hmac.new(
            key=secret_key,
            msg=data_check_string.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected_hash, received_hash):
            raise TelegramAuthError("initData signature verification failed")

        auth_date = data.get("auth_date")

        if not auth_date or not auth_date.isdigit():
            raise TelegramAuthError("initData missing/invalid auth_date")

        age = int(time.time()) - int(auth_date)

        if age > MAX_INIT_DATA_AGE_SECONDS or age < -60:
            # small negative tolerance for clock skew only
            raise TelegramAuthError("initData is expired")

        return data

    async def authenticate(self, init_data: str):

        data = self._verify_init_data(init_data)

        try:
            user_json = json.loads(data["user"])

        except (KeyError, json.JSONDecodeError) as exc:
            raise TelegramAuthError("initData missing/invalid user field") from exc

        user = await self.user_service.register(
            UserCreate(
                telegram_id=user_json["id"],
                username=user_json.get("username"),
                first_name=user_json.get("first_name"),
                last_name=user_json.get("last_name"),
                language=user_json.get("language_code", "en"),
            )
        )

        token = create_session_token(user.id)

        return token, user
