"""
Orchestrates the off-chain side of an escrow match: creates the
off-chain audit record, asks chain-writer to send the on-chain
CreateMatch/DeclareResult messages, and keeps the local Payment row in
sync with what the contract reports.

This service never touches funds directly and never holds the oracle
key — that lives only in chain-writer (see docs/ESCROW.md for why the
split exists). If chain-writer is unreachable, callers get a clear
503-mapped error, never a crash — a chess match's *outcome* can still
be recorded even if the payout call needs to be retried.
"""

import time
from uuid import UUID, uuid4

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.enums import EscrowStatus
from core.exceptions import ChainWriterUnavailableError
from database.models.payment import Payment
from repositories.payment_repository import PaymentRepository


class PaymentService:

    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = PaymentRepository(session)

    def _headers(self) -> dict:
        return {"x-internal-api-key": settings.CHAIN_WRITER_API_KEY}

    async def create_escrow(
        self,
        *,
        match_id: UUID,
        player_a_address: str,
        player_b_address: str,
        stake: float,
    ) -> Payment:

        onchain_match_id = uuid4().int & 0xFFFFFFFFFFFFFFF  # fits uint64
        now = int(time.time())

        body = {
            "matchId": onchain_match_id,
            "playerA": player_a_address,
            "playerB": player_b_address,
            "stakeNanoTon": str(int(stake * 1_000_000_000)),
            "depositDeadline": now + settings.ESCROW_DEPOSIT_WINDOW_SECONDS,
            "resolveDeadline": now
            + settings.ESCROW_DEPOSIT_WINDOW_SECONDS
            + settings.ESCROW_RESOLVE_WINDOW_SECONDS,
        }

        async with httpx.AsyncClient(timeout=15) as client:
            try:
                response = await client.post(
                    f"{settings.CHAIN_WRITER_URL}/matches",
                    json=body,
                    headers=self._headers(),
                )

            except httpx.HTTPError as exc:
                raise ChainWriterUnavailableError(
                    f"chain-writer unreachable: {exc}"
                ) from exc

        if response.status_code >= 500:
            raise ChainWriterUnavailableError(
                f"chain-writer returned {response.status_code}"
            )

        if response.status_code >= 400:
            raise ChainWriterUnavailableError(
                f"chain-writer rejected create_escrow: {response.text}"
            )

        payment = Payment(
            match_id=match_id,
            onchain_match_id=onchain_match_id,
            escrow_address=settings.ESCROW_ADDRESS,
            stake=stake,
            status=EscrowStatus.WAITING,
        )

        return await self.repo.create(payment)

    async def resolve(
        self,
        *,
        match_id: UUID,
        winner_id: UUID | None,
        winner_address: str | None,
    ) -> Payment:

        payment = await self.repo.get_by_match_id(match_id)

        if payment is None:
            raise ChainWriterUnavailableError(f"no escrow record for match {match_id}")

        async with httpx.AsyncClient(timeout=15) as client:
            try:
                response = await client.post(
                    f"{settings.CHAIN_WRITER_URL}/matches/{payment.onchain_match_id}/resolve",
                    json={"winner": winner_address},
                    headers=self._headers(),
                )

            except httpx.HTTPError as exc:
                raise ChainWriterUnavailableError(
                    f"chain-writer unreachable: {exc}"
                ) from exc

        if response.status_code >= 400:
            raise ChainWriterUnavailableError(
                f"chain-writer rejected resolve: {response.text}"
            )

        payment.status = EscrowStatus.RESOLVED
        payment.winner_id = winner_id

        return await self.repo.save(payment)
