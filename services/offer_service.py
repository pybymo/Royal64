from uuid import uuid4

from core.exceptions import EscrowError, PlayerWalletNotVerifiedError
from database.models.match import MatchStatus
from database.models.match_offer import MatchOffer
from services.match_service import MatchService
from services.game_service import GameService
from services.payment import PaymentService

from repositories.offer_repository import OfferRepository
from repositories.user_repository import UserRepository
from repositories.wallet_repository import WalletRepository


class OfferService:

    def __init__(
        self,

        session,

    ):

        self.session = session

        self.repo = OfferRepository(session)

        self.match_service = MatchService(session)

        self.game_service = GameService(session)

        self.payment_service = PaymentService(session)

        self.user_repo = UserRepository(session)

        self.wallet_repo = WalletRepository(session)

    async def create(self, owner, data):
        """
        Free offers (stake=0) skip the wallet requirement entirely —
        there's no payout to have anywhere to send. Paid offers still
        need one, same reasoning as always: nowhere for winnings to go
        is not a state a paid match should ever be created in.
        """

        is_free = data.stake == 0

        wallet = None

        if not is_free:

            wallet = await self.wallet_repo.get_default_for_user(owner.id)

            if wallet is None or not wallet.is_verified:
                raise PlayerWalletNotVerifiedError(
                    "connect and verify a wallet before creating a paid offer"
                )

        offer = MatchOffer(
            id=uuid4(),
            owner_id=owner.id,
            wallet_id=wallet.id if wallet else None,
            stake=data.stake,
            currency=data.currency,
            match_type=data.match_type,
            time_control=data.time_control,
            note=data.note,
        )

        return await self.repo.save(offer)

    async def list_open(self):

        return await self.repo.list_open()

    async def accept(
        self,

        offer,

        accepter,

    ):

        is_free = offer.stake == 0

        owner_wallet = None
        accepter_wallet = None

        # Resolve payout destinations *before* touching anything else.
        # A paid match must never be created for a player who has
        # nowhere verified for their winnings to go — that would put
        # the server back in the position of being the thing holding
        # (or losing) their share, which is exactly what escrow exists
        # to avoid. Fail fast, before any state changes. None of this
        # applies to a free game — there's no payout to route.
        if not is_free:

            owner_wallet = await self.wallet_repo.get_default_for_user(offer.owner_id)
            accepter_wallet = await self.wallet_repo.get_default_for_user(accepter.id)

            if owner_wallet is None or not owner_wallet.is_verified:
                raise PlayerWalletNotVerifiedError(
                    "the offer creator has no verified wallet to receive payouts"
                )

            if accepter_wallet is None or not accepter_wallet.is_verified:
                raise PlayerWalletNotVerifiedError(
                    "you need a verified wallet connected before accepting a paid match"
                )

        offer.status = "ACCEPTED"

        await self.repo.save(offer)

        match = await self.match_service.create(
            offer,

            accepter,

        )

        if not is_free:

            # Escrow must exist before the game is playable — if chain-writer
            # can't be reached, the whole accept fails rather than starting
            # a "paid" match with no on-chain guarantee behind it. Once
            # chain-writer is actually deployed against a live contract
            # (see services/chain-writer/README.md), this call succeeds;
            # until then this is the expected failure point, not a bug.
            try:
                await self.payment_service.create_escrow(
                    match_id=match.id,
                    player_a_address=owner_wallet.address,
                    player_b_address=accepter_wallet.address,
                    stake=float(offer.stake),
                )

            except EscrowError:
                # NOTE: match/offer were already committed by the calls
                # above (each repository commits its own write rather than
                # sharing one transaction) — a plain session.rollback()
                # here would be a no-op. Explicitly compensate instead, so
                # a match never sits around ACTIVE/ACCEPTED with no escrow
                # behind it.
                match.status = MatchStatus.CANCELLED
                offer.status = "CANCELLED"

                await self.match_service.repo.save(match)
                await self.repo.save(offer)

                raise

        await self.game_service.create_first_game(
            match,
        )

        return match
