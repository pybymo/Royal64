import { Card, Stack, Text, Button } from "@/shared/ui";

import { useWallet } from "@/features/wallet/use-wallet";

export function WalletPage() {

    const { wallet, connecting, error, connect, disconnect } = useWallet();

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

                {wallet.address ? (

                    <Stack gap={8}>

                        <Text variant="small">
                            {wallet.isVerified ? "Verified" : "Pending"}
                            {" · "}
                            {wallet.address}
                        </Text>

                        <Button onClick={disconnect}>
                            Disconnect
                        </Button>

                    </Stack>

                ) : (

                    <Button onClick={connect} disabled={connecting}>
                        {connecting ? "Connecting..." : "Connect Wallet"}
                    </Button>

                )}

                {error && (
                    <Text variant="small">
                        {error}
                    </Text>
                )}

            </Stack>

        </Card>

    );

}
