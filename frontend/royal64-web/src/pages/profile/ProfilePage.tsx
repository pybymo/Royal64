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

    return (

        <Stack gap={16}>

            <Card>
                <Stack gap={12}>

                    <Text variant="h2">
                        {user.username ? `@${user.username}` : "Player"}
                    </Text>

                    <Text variant="small">
                        {user.firstName} {user.lastName ?? ""}
                    </Text>

                    <Text variant="small">
                        Trust score: {user.trustScore.toFixed(0)}
                    </Text>

                    <Text variant="small">
                        Wins {user.wins} · Losses {user.losses} · Draws {user.draws}
                    </Text>

                </Stack>
            </Card>

            <Link to="/history">
                <Button>
                    Match history
                </Button>
            </Link>

        </Stack>

    );

}
