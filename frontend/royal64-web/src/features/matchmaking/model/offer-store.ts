import { create } from "zustand";

import type { MatchOffer } from "@/shared/types/offer";

interface OfferStore {

    offers: MatchOffer[];

    setOffers(offers: MatchOffer[]): void;

}

export const useOfferStore = create<OfferStore>((set) => ({

    offers: [],

    setOffers(offers) {

        set({

            offers,

        });

    },

}));