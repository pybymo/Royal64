import { Link } from "react-router-dom";

import { Card, Stack, Text, Button } from "@/shared/ui";

import { WalletCard } from "@/widgets/walletcard";
import { StatsCard } from "@/widgets/statscard";

import { useAuthStore } from "@/features/auth/auth-store";
import { useWalletStore } from "@/features/wallet/wallet-store";

export function Dashboard() {

    const user = useAuthStore((s) => s.user);
    const wallet = useWalletStore((s) => s.wallet);

    const initial = user?.username ? user.username[0].toUpperCase() : "?";

    return (

        <Stack gap={20}>

            <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

                    <div
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--surface-2)",
                            border: "2px solid var(--gold)",
                            boxShadow: "0 0 16px var(--gold-glow)",
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: 20,
                            color: "var(--gold-bright)",
                            flexShrink: 0,
                        }}
                    >
                        {initial}
                    </div>

                    <Stack gap={4}>
                        <Text variant="h3">
                            {user?.username ? `@${user.username}` : "Player"}
                        </Text>
                        <Text variant="small" mono>
                            Trust score {user ? user.trustScore.toFixed(0) : "-"}
                        </Text>
                    </Stack>

                </div>
            </Card>

            <Link to="/lobby" style={{ display: "block" }}>
                <div
                    className="slide-up"
                    style={{
                        background: "var(--gradient-gold)",
                        borderRadius: "var(--radius-lg)",
                        padding: "28px 24px",
                        boxShadow: "var(--shadow-gold)",
                        textAlign: "center",
                    }}
                >
                    <Text variant="small">
                        <span style={{ color: "#3A2C0A", fontWeight: 700 }}>
                            FIND A MATCH
                        </span>
                    </Text>
                    <div
                        className="display"
                        style={{
                            fontSize: 26,
                            fontWeight: 900,
                            color: "#1A1305",
                            marginTop: 6,
                        }}
                    >
                        QUICK PLAY
                    </div>
                </div>
            </Link>

            <WalletCard balance={wallet.balance} />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                }}
            >
                <StatsCard title="Wins" value={String(user?.wins ?? 0)} />
                <StatsCard title="Losses" value={String(user?.losses ?? 0)} />
                <StatsCard title="Draws" value={String(user?.draws ?? 0)} />
            </div>

            <Link to="/history">
                <Button variant="secondary" style={{ width: "100%" }}>
                    Match History
                </Button>
            </Link>

        </Stack>
    );
}
