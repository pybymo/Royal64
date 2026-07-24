import { Card, Stack, Text } from "@/shared/ui";

export function ActiveOffers() {
    return (
        <Card>
            <Stack gap={10}>
                <Text variant="h2">Open Offers</Text>

                <Text>No active offers.</Text>
            </Stack>
        </Card>
    );
}