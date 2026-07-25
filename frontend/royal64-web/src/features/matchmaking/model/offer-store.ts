import { create } from "zustand";

import type { Offer } from "@/entities/offer";

interface OfferStore {

    offers: Offer[];

    setOffers(offers: Offer[]): void;

    removeOffer(id: number): void;

}

export const useOfferStore = create<OfferStore>((set) => ({

    offers: [],

    setOffers(offers) {

        set({ offers });

    },

    removeOffer(id) {

        set((state) => ({

            offers: state.offers.filter(

                (offer) => offer.id !== id

            ),

        }));

    },

}));