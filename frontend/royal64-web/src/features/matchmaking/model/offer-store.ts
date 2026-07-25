import { create } from "zustand";

import type { Offer } from "@/entities/offer";

interface OfferStore {

    offers: Offer[];

    setOffers(offers: Offer[]): void;

}

export const useOfferStore = create<OfferStore>((set) => ({

    offers: [],

    setOffers(offers) {

        set({

            offers,

        });

    },

}));