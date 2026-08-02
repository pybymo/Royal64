import { Link } from "react-router-dom";

import { Button, Card, Stack, Text } from "@/shared/ui";
import { useAuthStore } from "@/features/auth/auth-store";

export function ProfilePage() {

    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);
    const error = useAuthStore((s) => s.error);

    if (loading) {
        return (
            <Card>
                <Text variant="small">Loading profile...</Text>
            </Card>
        );
    }

    if (!user) {
        return (
            <Card>
                <Text variant="small">
                    {error ?? "Not signed in."}
                </Text>
            </Card>
        );
    }

    const initial = user.username ? user.username[0].toUpperCase() : "?";
    const totalGames = user.wins + user.losses + user.draws;
    const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;

    return (

        <Stack gap={20}>

            <Card>
                <Stack gap={16}>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>

                        <div
                            style={{
                                width: 84,
                                height: 84,
                                borderRadius: 999,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "var(--surface-2)",
                                border: "3px solid var(--gold)",
                                boxShadow: "var(--shadow-gold)",
                                fontFamily: "var(--font-display)",
                                fontWeight: 800,
                                fontSize: 30,
                                color: "var(--gold-bright)",
                            }}
                        >
                            {initial}
                        </div>

                        <Text variant="h2">
                            {user.username ? `@${user.username}` : "Player"}
                        </Text>

                        <Text variant="small">
                            {user.firstName} {user.lastName ?? ""}
                        </Text>

                    </div>

                    <div
                        style={{
                            background: "var(--surface-2)",
                            borderRadius: "var(--radius-md)",
                            padding: "14px 16px",
                            textAlign: "center",
                        }}
                    >
                        <Text variant="small">Trust Score</Text>
                        <Text variant="h1" mono>{user.trustScore.toFixed(0)}</Text>
                    </div>

                </Stack>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>

                <Card>
                    <Stack gap={4}>
                        <Text variant="small">Wins</Text>
                        <Text variant="h3" mono>{user.wins}</Text>
                    </Stack>
                </Card>

                <Card>
                    <Stack gap={4}>
                        <Text variant="small">Losses</Text>
                        <Text variant="h3" mono>{user.losses}</Text>
                    </Stack>
                </Card>

                <Card>
                    <Stack gap={4}>
                        <Text variant="small">Win Rate</Text>
                        <Text variant="h3" mono>{winRate}%</Text>
                    </Stack>
                </Card>

            </div>

            <Link to="/history">
                <Button variant="secondary" style={{ width: "100%" }}>
                    Match History
                </Button>
            </Link>

            <Link to="/settings">
                <Button variant="secondary" style={{ width: "100%" }}>
                    ⚙ Settings
                </Button>
            </Link>

        </Stack>

    );

}
