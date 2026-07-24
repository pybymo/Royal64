import { useEffect } from "react";

import { fetchOffers } from "../api/offer-service";

import { useOfferStore } from "../model/offer-store";

export function useOffers() {

    const offers = useOfferStore((s) => s.offers);

    const setOffers = useOfferStore((s) => s.setOffers);

    useEffect(() => {

        fetchOffers().then(setOffers);

    }, [setOffers]);

    return {

        offers,

    };

}