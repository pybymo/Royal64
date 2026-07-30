from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    BOT_TOKEN: str = ""
    DATABASE_URL: str = ""
    REDIS_URL: str = ""

    ENV: str = "development"

    # --- Auth / session ---
    # Session tokens issued after a wallet is verified. Generate with:
    #   python -c "import secrets; print(secrets.token_urlsafe(64))"
    SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    SESSION_TTL_MINUTES: int = 60 * 24 * 7  # 7 days

    # --- TON / TON Connect ---
    TON_NETWORK: str = "testnet"  # "mainnet" | "testnet"
    TON_API_KEY: str = ""
    TON_API_BASE_URL: str = "https://tonapi.io"

    # Domain the frontend serves the TonConnect manifest from. The ton_proof
    # signature is bound to this exact domain — it MUST match what the
    # wallet app displayed to the user, or verification must be rejected.
    APP_DOMAIN: str = "royal64.app"
    TONCONNECT_MANIFEST_URL: str = "https://royal64.app/tonconnect-manifest.json"

    # How long a wallet-connect challenge (nonce) stays valid before it
    # must be discarded. Keep this short — it bounds the replay window.
    WALLET_CHALLENGE_TTL_SECONDS: int = 300

    # How old a signed ton_proof timestamp is allowed to be at verification
    # time, independent of the challenge TTL above (defense in depth).
    WALLET_PROOF_MAX_AGE_SECONDS: int = 300

    # --- Escrow / chain-writer ---
    # chain-writer is an internal-only service (see services/chain-writer/)
    # — never expose it publicly. This backend is just one more caller
    # of it, authenticated with a shared secret.
    CHAIN_WRITER_URL: str = "http://127.0.0.1:8090"
    CHAIN_WRITER_API_KEY: str = ""
    ESCROW_ADDRESS: str = ""
    ESCROW_FEE_BPS: int = 300  # must match FEE_BPS in escrow.tact
    ESCROW_DEPOSIT_WINDOW_SECONDS: int = 15 * 60
    ESCROW_RESOLVE_WINDOW_SECONDS: int = 6 * 60 * 60


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
