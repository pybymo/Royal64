from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # extra="ignore": an unrecognized key in .env should never crash
    # the whole app at startup — this exact class of failure (a field
    # got renamed/removed in code but .env still has the old key, or
    # vice versa) is easy to hit and shouldn't be fatal.
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    BOT_TOKEN: str = ""
    DATABASE_URL: str = ""
    REDIS_URL: str = ""

    ENV: str = "development"

    # --- Mini App ---
    # The frontend's public URL. Telegram will only populate
    # Telegram.WebApp.initData when the page is opened THROUGH this
    # mechanism (chat menu button / web_app keyboard button) — opening
    # the same URL in a normal browser tab will always show empty
    # initData, which is expected, not a bug.
    WEBAPP_URL: str = ""

    # Comma-separated list of origins allowed to call this API from a
    # browser (CORS). The frontend dev server and its origin differ
    # from the backend's (different port, or a whole different ngrok
    # domain when testing from a phone) — without this, every request
    # from the browser gets silently blocked by CORS, not by anything
    # this app's own logic rejected.
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

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

    # --- Anti-cheat ---
    STOCKFISH_PATH: str = ""  # override auto-detection if needed
    ANTICHEAT_ENGINE_DEPTH: int = 16

    # Below this many calibration games, a player has no reliable
    # fingerprint yet — analysis still runs but nothing gets flagged
    # off a sample too small to mean anything.
    ANTICHEAT_MIN_GAMES_FOR_BASELINE: int = 3

    # A single game's average centipawn loss below this is suspicious
    # on its own regardless of history (near-engine-perfect play).
    ANTICHEAT_ACPL_HARD_FLAG_THRESHOLD: int = 15

    # How many standard deviations a game's ACPL must sit below a
    # player's own established baseline to be flagged as a deviation
    # (as opposed to them just being a strong player generally).
    ANTICHEAT_ACPL_DEVIATION_SIGMA: float = 2.5

    # Move-timing consistency: real humans vary; a suspiciously low
    # coefficient of variation in per-move time suggests automation.
    ANTICHEAT_TIMING_CV_FLAG_THRESHOLD: float = 0.12

    # --- Disconnect handling ---
    # Per the MVP: a disconnected player gets this long to reconnect
    # before losing on time; each player gets a limited number of such
    # grace periods before the next disconnect is an immediate loss.
    DISCONNECT_GRACE_SECONDS: int = 60
    MAX_DISCONNECTS_PER_PLAYER: int = 3


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
