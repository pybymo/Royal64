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

                <Stack gap={6}>

                    <Text variant="small">

                        Available Balance

                    </Text>

                    <Text>

                        {wallet.availableBalance.toFixed(2)} TON

                    </Text>

                </Stack>

                <Stack gap={6}>

                    <Text variant="small">

                        Locked Balance

                    </Text>

                    <Text>

                        {wallet.lockedBalance.toFixed(2)} TON

                    </Text>

                </Stack>

                <Stack gap={6}>

                    <Text variant="small">

                        Total Balance

                    </Text>

                    <Text variant="h2">

                        {wallet.totalBalance.toFixed(2)} TON

                    </Text>

                </Stack>

                <Button>

                    Deposit

                </Button>

            </Stack>

        </Card>

    );

}