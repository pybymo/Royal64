import "./StatsCard.scss";

import { Card, Stack, Text } from "@/shared/ui";

type Props = {

    title: string;

    value: string;

};

export function StatsCard({

    title,

    value

}: Props) {

    return (

        <Card>

            <Stack gap={6}>

                <Text variant="small">

                    {title}

                </Text>

                <Text variant="h2">

                    {value}

                </Text>

            </Stack>

        </Card>

    );

}