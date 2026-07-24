import { Card, Stack, Text } from "@/shared/ui";

export function OnlinePlayers() {
    return (
        <Card>
            <Stack gap={10}>
                <Text variant="h2">Players Online</Text>

                <Text>0</Text>
            </Stack>
        </Card>
    );
}