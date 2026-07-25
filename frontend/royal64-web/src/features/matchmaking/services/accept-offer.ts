import { OfferService } from "./offer-service";

import { EscrowService } from "@/features/escrow";

import { createMatch } from "./create-match";

import { lockFunds } from "@/features/escrow";

import type { Offer } from "@/entities/offer";

export function acceptOfferFlow(

    offer: Offer

) {

    const acceptedOffer =

        new OfferService().accept(offer);

    const escrow =

        new EscrowService().create(acceptedOffer);

    const match =

        createMatch(escrow);

    const ledger =

        lockFunds(escrow);

    return {

        offer: acceptedOffer,

        escrow,

        match,

        ledger,

    };

}