import "./WalletCard.scss";

import { Card, Stack, Text, Button } from "@/shared/ui";

import { useWallet } from "@/features/wallet";

export function WalletCard() {

    const { wallet } = useWallet();

    return (

        <Card>

            <Stack gap={20}>

                <Text variant="h2">

                    Wallet

                </Text>

                <Text>

                    Available

                </Text>

                <Text>

                    {wallet.availableBalance.toFixed(2)} TON

                </Text>

                <Text>

                    Locked

                </Text>

                <Text>

                    {wallet.lockedBalance.toFixed(2)} TON

                </Text>

                <Text>

                    Total

                </Text>

                <Text>

                    {wallet.totalBalance.toFixed(2)} TON

                </Text>

                <Button>

                    Deposit

                </Button>

            </Stack>

        </Card>

    );

}