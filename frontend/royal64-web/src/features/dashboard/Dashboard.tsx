import { Link } from "react-router-dom";

import { Card, Stack, Text, Button, Loader } from "@/shared/ui";

import { WalletCard } from "@/widgets/walletcard";
import { StatsCard } from "@/widgets/statscard";

import { useAuthStore } from "@/features/auth/auth-store";
import { useWalletStore } from "@/features/wallet/wallet-store";

import { usePing } from "./hooks";

export function Dashboard() {

    const ping = usePing();
    const user = useAuthStore((s) => s.user);
    const wallet = useWalletStore((s) => s.wallet);

    return (

        <Stack gap={24}>

            <Card>
                <Text variant="h2">
                    {user?.username ? `@${user.username}` : "Player"}
                </Text>
            </Card>

            <WalletCard balance={wallet.balance} />

            <StatsCard title="Wins" value={String(user?.wins ?? 0)} />
            <StatsCard title="Losses" value={String(user?.losses ?? 0)} />
            <StatsCard title="Draws" value={String(user?.draws ?? 0)} />
            <StatsCard
                title="Trust score"
                value={user ? user.trustScore.toFixed(0) : "-"}
            />

            <Card>
                <Stack gap={8}>
                    {ping.isLoading && <Loader />}
                    <Text>
                        Backend :
                        {
                            ping.isSuccess
                                ? " Connected"
                                : ping.isLoading
                                    ? " Checking..."
                                    : " Unreachable"
                        }
                    </Text>
                </Stack>
            </Card>

            <Link to="/lobby">
                <Button>
                    Find a match
                </Button>
            </Link>

        </Stack>
    );
}
