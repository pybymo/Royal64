import type { Escrow } from "@/entities/escrow";
import type { Match } from "@/entities/match";
import type { Offer } from "@/entities/offer";

export class EscrowService {

    create(offer: Offer): Escrow {

        return {

            id: Date.now(),

            matchId: 0,

            playerOneWalletId: offer.creatorId,

            playerTwoWalletId: offer.opponentId ?? 0,

            amountPerPlayer: offer.stake,

            totalAmount: offer.stake * 2,

            status: "created",

            createdAt: new Date().toISOString(),

            updatedAt: new Date().toISOString(),

        };

    }

    attachMatch(

        escrow: Escrow,

        match: Match

    ): Escrow {

        return {

            ...escrow,

            matchId: match.id,

            updatedAt: new Date().toISOString(),

        };

    }

}