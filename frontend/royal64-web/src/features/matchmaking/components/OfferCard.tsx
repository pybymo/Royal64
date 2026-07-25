import { Card, Stack, Text, Button } from "@/shared/ui";

import type { Offer } from "@/entities/offer";

import { useAcceptOffer } from "@/features/matchmaking";

interface Props {

    offer: Offer;

}

export function OfferCard({

    offer,

}: Props) {

    const { accept } = useAcceptOffer();

    return (

        <Card>

            <Stack gap={10}>

                <Text variant="h2">

                    Offer #{offer.id}

                </Text>

                <Text>

                    Stake: {offer.stake} {offer.currency}

                </Text>

                <Text>

                    {offer.status}

                </Text>

                <Text>

                    {offer.isPrivate

                        ? "Private"

                        : "Public"}

                </Text>

                <Button

                    onClick={() =>

                        accept(offer)

                    }

                >

                    Accept Offer

                </Button>

            </Stack>

        </Card>

    );

}