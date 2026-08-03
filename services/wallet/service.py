"""
Wallet connect / ton_proof verification.

Security model, in order:

  1. The frontend asks us for a one-time, short-lived challenge nonce
     (`generate_challenge`) tied to the *already Telegram-authenticated*
     user. It is stored server-side in Redis with a TTL and is consumed
     exactly once.

  2. The frontend passes that nonce to TonConnect UI as the `tonProof`
     payload and opens the wallet picker. The wallet signs a message
     that binds: a fixed prefix, the wallet's own address, our domain,
     a timestamp, and the nonce.

  3. `connect()` independently rebuilds that exact message, resolves the
     wallet's *real* public key from chain state (never from anything
     the client sent), and verifies the Ed25519 signature against it.
     Only if every check passes do we record the address as verified
     and attach it to the user.

We deliberately do NOT trust the client-supplied `public_key` or
`wallet_state_init` fields for key material — only for the address the
proof claims to be about. The public key is always re-derived from
TonAPI's on-chain `get_public_key` getter, which means an attacker
cannot spoof a signature by fabricating stateInit / publicKey values.
This does mean the connected wallet must be a deployed contract on
chain (i.e. has sent or received at least one transaction) — brand
new, never-used wallets are rejected with a clear message rather than
trusting client-supplied state data for something this security
sensitive. Parsing `walletStateInit` locally to also support
undeployed wallets is a reasonable v2 addition, but should be done
with a well-tested cell/BOC library and its own test vectors before
being trusted for a money-moving flow.
"""

import secrets
import time
from hashlib import sha256
from uuid import UUID

import httpx
from nacl.exceptions import BadSignatureError
from nacl.signing import VerifyKey
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.exceptions import (
    ChallengeNotFoundError,
    InvalidSignatureError,
    ProofDomainMismatchError,
    ProofExpiredError,
    TonApiUnavailableError,
    WalletAlreadyLinkedError,
    WalletNotDeployedError,
)
from database.models.user import User
from database.models.wallet import Wallet
from repositories.wallet_repository import WalletRepository
from schemas.wallet import WalletConnectRequest
from services.redis_service import redis

_CHALLENGE_KEY = "wallet:challenge:{user_id}"
_TON_PROOF_PREFIX = b"ton-proof-item-v2/"
_TON_CONNECT_PREFIX = b"\xff\xff" + b"ton-connect"

# Accepted (our-network-setting -> allowed `network` values in the proof).
# "-239" mainnet, "-1" and "-3" are both seen in the wild for testnet
# depending on client SDK version.
_NETWORK_IDS = {
    "mainnet": {"-239"},
    "testnet": {"-1", "-3"},
}


class WalletService:

    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = WalletRepository(session)

    # ------------------------------------------------------------------
    # Step 1: issue a one-time challenge
    # ------------------------------------------------------------------

    async def generate_challenge(self, user_id: UUID) -> str:

        nonce = secrets.token_urlsafe(32)

        await redis.set(
            _CHALLENGE_KEY.format(user_id=user_id),
            nonce,
            ex=settings.WALLET_CHALLENGE_TTL_SECONDS,
        )

        return nonce

    # ------------------------------------------------------------------
    # Step 2: verify the signed proof and link the wallet
    # ------------------------------------------------------------------

    async def connect(
        self,
        user: User,
        payload: WalletConnectRequest,
    ) -> Wallet:

        self._check_network(payload.network)
        self._check_domain(payload.proof.domain.value, payload.proof.domain.lengthBytes)
        self._check_freshness(payload.proof.timestamp)

        await self._consume_challenge(user.id, payload.proof.payload)

        public_key = await self._resolve_public_key(payload.address)

        digest = self._build_digest(
            address=payload.address,
            domain=payload.proof.domain.value,
            timestamp=payload.proof.timestamp,
            proof_payload=payload.proof.payload,
        )

        self._verify_signature(
            public_key=public_key,
            digest=digest,
            signature_b64=payload.proof.signature,
        )

        return await self._upsert_wallet(user, payload)

    # ------------------------------------------------------------------
    # Checks
    # ------------------------------------------------------------------

    def _check_network(self, network: str) -> None:

        allowed = _NETWORK_IDS.get(settings.TON_NETWORK, set())

        if network not in allowed:

            if settings.TON_NETWORK == "testnet" and network == "-239":
                raise ProofDomainMismatchError(
                    "That's a mainnet wallet with real funds, but this app is "
                    "running on TON testnet right now. Switch TON Keeper to "
                    "testnet mode and connect a testnet wallet instead — "
                    "don't use a real-funds wallet against an unaudited "
                    "test contract."
                )

            if settings.TON_NETWORK == "mainnet" and network in ("-1", "-3"):
                raise ProofDomainMismatchError(
                    "That's a testnet wallet, but this app expects a mainnet "
                    "TON wallet. Switch TON Keeper out of testnet mode."
                )

            raise ProofDomainMismatchError(
                f"Unexpected wallet network ({network}) for this app's "
                f"configuration ({settings.TON_NETWORK})."
            )

    def _check_domain(self, domain_value: str, length_bytes: int) -> None:

        if domain_value != settings.APP_DOMAIN:
            raise ProofDomainMismatchError(
                f"proof domain {domain_value!r} != {settings.APP_DOMAIN!r}"
            )

        if length_bytes != len(domain_value.encode("utf-8")):
            raise ProofDomainMismatchError("domain lengthBytes mismatch")

    def _check_freshness(self, ts: int) -> None:

        now = int(time.time())

        if abs(now - ts) > settings.WALLET_PROOF_MAX_AGE_SECONDS:
            raise ProofExpiredError(f"proof timestamp {ts} outside accepted window")

    async def _consume_challenge(self, user_id: UUID, proof_payload: str) -> None:

        key = _CHALLENGE_KEY.format(user_id=user_id)

        # Atomic get-and-delete: the nonce can be redeemed exactly once,
        # closing the replay window even if this handler is invoked
        # twice concurrently with the same proof.
        stored = await redis.getdel(key)

        if stored is None or not secrets.compare_digest(stored, proof_payload):
            raise ChallengeNotFoundError(
                "no matching challenge for this user (expired, already used, or forged payload)"
            )

    # ------------------------------------------------------------------
    # Public key resolution — always from chain state, never from the client
    # ------------------------------------------------------------------

    async def _resolve_public_key(self, address: str) -> bytes:

        url = f"{settings.TON_API_BASE_URL}/v2/accounts/{address}/publickey"
        headers = {}

        if settings.TON_API_KEY:
            headers["Authorization"] = f"Bearer {settings.TON_API_KEY}"

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url, headers=headers)

        except httpx.HTTPError as exc:
            # Network error, timeout, DNS failure, etc. — TonAPI being
            # unreachable is *our* dependency failing, not a bad request.
            raise TonApiUnavailableError(f"TonAPI request failed: {exc}") from exc

        if response.status_code == 404:
            faucet_hint = (
                " On testnet, get some test TON from @testgiver_ton_bot on "
                "Telegram — receiving that deploys the wallet."
                if settings.TON_NETWORK == "testnet"
                else ""
            )
            raise WalletNotDeployedError(
                "This wallet has no on-chain activity yet — send or receive "
                "at least one transaction before connecting it." + faucet_hint
            )

        if response.status_code != 200:
            # Any other non-2xx (5xx, 429, unexpected 4xx) is treated as
            # an upstream problem rather than guessed at — fail closed
            # and graceful (503), never crash the request.
            raise TonApiUnavailableError(
                f"TonAPI returned {response.status_code} resolving public key"
            )

        try:
            data = response.json()
            hex_key = data.get("public_key")

        except ValueError as exc:
            raise TonApiUnavailableError("TonAPI returned a non-JSON response") from exc

        if not hex_key:
            raise TonApiUnavailableError("TonAPI response had no public_key field")

        try:
            return bytes.fromhex(hex_key)

        except ValueError as exc:
            raise TonApiUnavailableError("malformed public_key from TonAPI") from exc

    # ------------------------------------------------------------------
    # Message construction — mirrors the TON Connect ton_proof spec
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_address(address: str) -> tuple[int, bytes]:

        workchain_str, hash_hex_or_b64 = address.split(":", 1)
        workchain = int(workchain_str)

        raw = hash_hex_or_b64.strip()

        if len(raw) == 64:
            addr_hash = bytes.fromhex(raw)
        else:
            import base64
            addr_hash = base64.b64decode(raw + "=" * (-len(raw) % 4))

        if len(addr_hash) != 32:
            raise ProofDomainMismatchError("malformed address hash")

        return workchain, addr_hash

    def _build_digest(
        self,
        *,
        address: str,
        domain: str,
        timestamp: int,
        proof_payload: str,
    ) -> bytes:

        workchain, addr_hash = self._parse_address(address)

        wc_bytes = workchain.to_bytes(4, byteorder="big", signed=True)
        domain_bytes = domain.encode("utf-8")
        domain_len_bytes = len(domain_bytes).to_bytes(4, byteorder="little", signed=False)
        ts_bytes = timestamp.to_bytes(8, byteorder="little", signed=False)
        payload_bytes = proof_payload.encode("utf-8")

        message = (
            _TON_PROOF_PREFIX
            + wc_bytes
            + addr_hash
            + domain_len_bytes
            + domain_bytes
            + ts_bytes
            + payload_bytes
        )

        inner = sha256(message).digest()

        return sha256(_TON_CONNECT_PREFIX + inner).digest()

    @staticmethod
    def _verify_signature(
        *,
        public_key: bytes,
        digest: bytes,
        signature_b64: str,
    ) -> None:

        import base64

        try:
            signature = base64.b64decode(signature_b64)
            VerifyKey(public_key).verify(digest, signature)

        except (BadSignatureError, ValueError, TypeError) as exc:
            raise InvalidSignatureError("ton_proof signature verification failed") from exc

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    async def _upsert_wallet(
        self,
        user: User,
        payload: WalletConnectRequest,
    ) -> Wallet:

        existing = await self.repo.get_by_address(payload.address)

        if existing is not None and str(existing.user_id) != str(user.id):
            raise WalletAlreadyLinkedError(
                "this wallet address is already verified for a different account"
            )

        if existing is not None:
            # Re-proving ownership of an address you already have on file
            # is fine and idempotent. It never touches is_default — which
            # wallet is primary only ever changes via set_default().
            existing.is_verified = True
            return await self.repo.save(existing)

        user_wallets = await self.repo.get_by_user_id(user.id)
        is_first_wallet = len(user_wallets) == 0

        wallet = Wallet(
            user_id=user.id,
            address=payload.address,
            network="TON",
            # Only the very first wallet a user ever verifies becomes
            # default automatically. Every wallet after that is added as
            # non-default — promoting a different wallet to primary is a
            # separate, explicit action (see set_default), never a side
            # effect of connecting one more wallet.
            is_default=is_first_wallet,
            is_verified=True,
        )

        try:
            return await self.repo.create(wallet)

        except IntegrityError as exc:
            # Two concurrent requests raced to claim the same address —
            # the DB's unique constraint on `address` is the final
            # backstop behind the application-level check above.
            await self.session.rollback()
            raise WalletAlreadyLinkedError(
                "this wallet address was just claimed by another account"
            ) from exc

    async def set_default(
        self,
        user: User,
        wallet_id,
    ) -> Wallet:
        """
        The only sanctioned way to change which wallet is primary.
        Requires the wallet to already be verified and owned by this
        user — no new ton_proof is needed since ownership was already
        established when it was first connected.
        """

        wallet = await self.repo.get_by_id(wallet_id)

        if wallet is None or str(wallet.user_id) != str(user.id):
            raise WalletAlreadyLinkedError("wallet not found for this account")

        if not wallet.is_verified:
            raise WalletAlreadyLinkedError("wallet is not verified")

        await self.repo.clear_default_for_user(user.id)

        wallet.is_default = True

        return await self.repo.save(wallet)
