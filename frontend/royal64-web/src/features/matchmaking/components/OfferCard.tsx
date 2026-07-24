import { Card, Stack, Text, Button } from "@/shared/ui";

import type { MatchOffer } from "@/shared/types/offer";

interface Props {

    offer: MatchOffer;

}

export function OfferCard({ offer }: Props) {

    return (

        <Card>

            <Stack gap={10}>

                <Text variant="h2">

                    {offer.creatorName}

                </Text>

                <Text>

                    Stake: {offer.stake} {offer.currency}

                </Text>

                <Text>

                    Time Control: {offer.timeControl}

                </Text>

                <Text>

                    {offer.rated ? "Rated" : "Casual"}

                </Text>

                <Button>

                    Accept

                </Button>

            </Stack>

        </Card>

    );

}