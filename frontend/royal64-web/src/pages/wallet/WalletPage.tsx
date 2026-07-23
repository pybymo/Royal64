import { Card, Stack, Text } from "@/shared/ui";

import { useWallet } from "@/features/wallet/use-wallet";

export function WalletPage() {

    const { wallet } = useWallet();

    return (

        <Card>

            <Stack gap={20}>

                <Text>

                    Wallet

                </Text>

                <Text>

                    {wallet.balance} TON

                </Text>

                <Text>

                    Locked :

                    {" "}

                    {wallet.locked}

                </Text>

            </Stack>

        </Card>

    );

}