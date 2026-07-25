import { Stack } from "@/shared/ui";

import { OfferCard } from "./OfferCard";

import { useOffers } from "@/features/matchmaking";

export function OfferList() {

    const { data: offers = [] } = useOffers();

    return (

        <Stack gap={12}>

            {offers.map((offer) => (

                <OfferCard
                    key={offer.id}
                    offer={offer}
                />

            ))}

        </Stack>

    );

}