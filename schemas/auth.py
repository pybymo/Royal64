from pydantic import BaseModel

from schemas.user import UserRead


class TelegramAuthRequest(BaseModel):
    """
    Raw `initData` string from Telegram.WebApp.initData in the Mini App
    frontend — untrusted until validate() in services/auth/service.py
    checks its HMAC signature against the bot token.
    """

    init_data: str


class AuthResponse(BaseModel):
    access_token: str
    user: UserRead
