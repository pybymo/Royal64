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
                    Available Balance
                </Text>

                <Text>
                    {wallet.availableBalance} TON
                </Text>

                <Text>
                    Locked Balance
                </Text>

                <Text>
                    {wallet.lockedBalance} TON
                </Text>

                <Text>
                    Pending Balance
                </Text>

                <Text>
                    {wallet.pendingBalance} TON
                </Text>

                <Text>
                    Total Balance
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