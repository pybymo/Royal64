from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    BOT_TOKEN: str = ""
    DATABASE_URL: str = ""
    REDIS_URL: str = ""

    TON_API_KEY: str = ""
    ENV: str = "development"


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()