import type { Match } from "@/entities/match";
import type { Escrow } from "@/entities/escrow";

export function createMatch(

    escrow: Escrow

): Match {

    return {

        id: Date.now(),

        playerOneId: escrow.playerOneWalletId,

        playerTwoId: escrow.playerTwoWalletId,

        escrowId: escrow.id,

        status: "waiting",

        bestOf: 1,

        currentGame: 1,

        createdAt: new Date().toISOString(),

    };

}