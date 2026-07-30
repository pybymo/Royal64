class Royal64Error(Exception):
    """Base class for all application-level errors."""


class WalletError(Royal64Error):
    """Base class for wallet-connect related errors."""


class ChallengeNotFoundError(WalletError):
    """The challenge (nonce) is missing, already used, or expired."""


class ProofExpiredError(WalletError):
    """The signed ton_proof timestamp is outside the accepted freshness window."""


class ProofDomainMismatchError(WalletError):
    """The proof was signed for a different domain than this app's."""


class InvalidSignatureError(WalletError):
    """Ed25519 signature verification failed."""


class PublicKeyResolutionError(WalletError):
    """Base class for public-key resolution failures."""


class TonApiUnavailableError(PublicKeyResolutionError):
    """TonAPI could not be reached or returned an unexpected error — this
    is our dependency being unavailable, not the caller's fault. Map to
    503, never let it bubble up as a raw 500/crash."""


class WalletNotDeployedError(PublicKeyResolutionError):
    """TonAPI reached fine, but this address has no on-chain state yet
    (never sent/received a transaction), so no public key exists to
    verify against. This is a caller-facing 400."""


class WalletAlreadyLinkedError(WalletError):
    """This wallet address is already verified and linked to another user."""


class EscrowError(Royal64Error):
    """Base class for escrow/chain-writer related errors."""


class ChainWriterUnavailableError(EscrowError):
    """chain-writer could not be reached or returned an unexpected
    error. Our dependency failing, not the caller's fault — map to 503."""


class PlayerWalletNotVerifiedError(EscrowError):
    """A player in this match has no verified default TON wallet, so
    there is nowhere for their share of the escrow to be paid out to.
    A paid match must not be created without this — refusing here is
    what keeps the "server never holds funds" guarantee true."""
