from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class WalletChallengeOut(BaseModel):
    """
    A one-time nonce the frontend must embed in the TonConnect
    `tonProof` request as the payload. Single use, short TTL.
    """

    payload: str
    expires_in: int


class TonProofDomain(BaseModel):
    lengthBytes: int
    value: str


class TonProof(BaseModel):
    timestamp: int
    domain: TonProofDomain
    signature: str
    payload: str


class WalletConnectRequest(BaseModel):
    """
    Body sent by the frontend right after TonConnect UI reports a
    successful `tonProof` connection. Every field here is untrusted
    client input and must be independently verified server-side.
    """

    address: str = Field(..., description="Raw address, e.g. 0:abcd...")
    network: str = Field(..., description='"-239" mainnet, "-1" testnet')
    public_key: str | None = Field(
        default=None,
        description="Hex public key reported by the wallet, if provided. "
        "Never trusted on its own — always cross-checked.",
    )
    wallet_state_init: str = Field(..., description="Base64 BOC")
    proof: TonProof

    @field_validator("address")
    @classmethod
    def _address_not_empty(cls, v: str) -> str:
        if not v or ":" not in v:
            raise ValueError("malformed TON address")
        return v


class WalletOut(BaseModel):
    id: UUID
    address: str
    network: str
    is_default: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}



