import { Card, Stack, Text, Button } from "@/shared/ui";

import type { Offer } from "@/entities/offer";

interface Props {

    offer: Offer;

}

export function OfferCard({ offer }: Props) {

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

                    Status: {offer.status}

                </Text>

                <Text>

                    {offer.isPrivate ? "Private Match" : "Public Match"}

                </Text>

                <Button>

                    Accept

                </Button>

            </Stack>

        </Card>

    );

}