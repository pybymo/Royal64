import { Stack } from "@/shared/ui";

import { useOffers } from "../hooks/use-offers";

import { OfferCard } from "./OfferCard";

export function OfferList() {

    const { offers } = useOffers();

    return (

        <Stack gap={15}>

            {offers.map((offer) => (

                <OfferCard

                    key={offer.id}

                    offer={offer}

                />

            ))}

        </Stack>

    );

}