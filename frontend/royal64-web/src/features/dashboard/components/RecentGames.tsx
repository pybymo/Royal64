import { Card, Stack, Text } from "@/shared/ui";

export function RecentGames() {
    return (
        <Card>
            <Stack gap={10}>
                <Text variant="h2">Recent Games</Text>

                <Text>No games yet.</Text>
            </Stack>
        </Card>
    );
}