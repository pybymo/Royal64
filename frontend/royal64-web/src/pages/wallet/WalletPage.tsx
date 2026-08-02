import { Badge, Card, Stack, Text, Button } from "@/shared/ui";

import { useWallet } from "@/features/wallet/use-wallet";

export function WalletPage() {

    const { wallet, connecting, error, connect, disconnect } = useWallet();

    return (

        <Stack gap={20}>

            <Text variant="h2" display>
                Wallet
            </Text>

            <div
                style={{
                    background: "var(--gradient-gold)",
                    borderRadius: "var(--radius-lg)",
                    padding: "26px 22px",
                    boxShadow: "var(--shadow-gold)",
                }}
            >
                <div style={{ color: "#3A2C0A", fontWeight: 700, fontSize: 13 }}>
                    TOTAL BALANCE
                </div>

                <div
                    className="mono"
                    style={{
                        fontSize: 36,
                        fontWeight: 800,
                        color: "#1A1305",
                        marginTop: 6,
                    }}
                >
                    {wallet.balance.toFixed(2)} TON
                </div>

                <div className="mono" style={{ color: "#4A3A10", fontSize: 13, marginTop: 4 }}>
                    {wallet.locked.toFixed(2)} TON locked in active escrow
                </div>
            </div>

            <Card>
                <Stack gap={14}>

                    <Text variant="h3">
                        TON Connect
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

                </Stack>
            </Card>

            {error && (
                <Card>
                    <Text variant="small">
                        {error}
                    </Text>
                </Card>
            )}

        </Stack>

    );

}
