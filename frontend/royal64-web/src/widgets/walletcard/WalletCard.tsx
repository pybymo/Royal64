import "./WalletCard.scss";

import { Card, Stack, Text, Button } from "@/shared/ui";

type Props = {

    balance?: number;

};

export function WalletCard({

    balance = 0

}: Props) {

    return (

        <Card>

            <Stack gap={10}>

                <Text variant="small">

                    Wallet Balance

                </Text>

                <Text variant="h1">

                    {balance.toFixed(2)} TON

                </Text>

                <Button>

                    Deposit

                </Button>

            </Stack>

        </Card>

    );

}