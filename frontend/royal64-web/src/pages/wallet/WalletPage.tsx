import { Badge, Card, Stack, Text, Button } from "@/shared/ui";

import { useWallet } from "@/features/wallet/use-wallet";

export function WalletPage() {

    const { wallet, connecting, error, connect, disconnect } = useWallet();

    return (

        <Card>

            <Stack gap={20}>

                <Text variant="h2">
                    Wallet
                </Text>

                <Text variant="h1" mono>
                    {wallet.balance.toFixed(2)} TON
                </Text>

                <Text variant="small" mono>
                    Locked in escrow: {wallet.locked.toFixed(2)} TON
                </Text>

                {wallet.address ? (

                    <Stack gap={10}>

                        <Badge
                            text={wallet.isVerified ? "Verified" : "Pending"}
                            variant={wallet.isVerified ? "success" : "warning"}
                        />

                        <Text variant="small" mono>
                            {wallet.address}
                        </Text>

                        <Button variant="secondary" onClick={disconnect}>
                            Disconnect
                        </Button>

                    </Stack>

                ) : (

                    <Button onClick={connect} disabled={connecting}>
                        {connecting ? "Connecting..." : "Connect Wallet"}
                    </Button>

                )}

                {error && (
                    <Card>
                        <Text variant="small">
                            {error}
                        </Text>
                    </Card>
                )}

            </Stack>

        </Card>

    );

}
