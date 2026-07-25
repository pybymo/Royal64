import type { Offer } from "@/entities/offer";

import { acceptOfferFlow } from "@/features/matchmaking";

import { useOfferStore } from "@/features/matchmaking";
import { useEscrowStore } from "@/features/escrow";
import { useLedgerStore } from "@/features/ledger";
import { useMatchStore } from "@/features/match";

import { startMatch } from "@/features/match";

export function useAcceptOffer() {

    function accept(

        offer: Offer

    ) {

        const result = acceptOfferFlow(offer);

        useOfferStore.getState().removeOffer(

            offer.id

        );

        useEscrowStore.getState().add(

            result.escrow

        );

        useMatchStore.getState().add(

            result.match

        );

        result.ledger.forEach(

            (entry) =>

                useLedgerStore

                    .getState()

                    .add(entry)

        );

        startMatch(result.match);

    }

    return {

        accept,

    };

}