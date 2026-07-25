import type { Offer } from "@/entities/offer";

export class OfferService {

    accept(offer: Offer): Offer {

        return {

            ...offer,

            status: "accepted",

        };

    }

}