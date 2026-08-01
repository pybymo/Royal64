import { useQuery } from "@tanstack/react-query";

import { Badge, Card, Loader, Stack, Text } from "@/shared/ui";
import { getMyMatches } from "@/features/history/history-service";

const OUTCOME_LABEL: Record<string, string> = {
    WON: "Won",
    LOST: "Lost",
    DRAW: "Draw",
    PENDING: "In progress",
};

const OUTCOME_VARIANT: Record<string, "success" | "danger" | "muted" | "warning"> = {
    WON: "success",
    LOST: "danger",
    DRAW: "muted",
    PENDING: "warning",
};

export function HistoryPage() {

    const { data, isLoading, isError } = useQuery({
        queryKey: ["matches", "mine"],
        queryFn: getMyMatches,
    });

    return (

        <Stack gap={16}>

            <Text variant="h2">
                History
            </Text>

            {isLoading && (
                <Card>
                    <Stack gap={8}>
                        <Loader />
                        <Text variant="small">Loading your matches...</Text>
                    </Stack>
                </Card>
            )}

            {isError && (
                <Card>
                    <Text variant="small">
                        Couldn't load your match history. Try again shortly.
                    </Text>
                </Card>
            )}

            {!isLoading && !isError && data?.length === 0 && (
                <Card>
                    <Text variant="small">
                        No matches yet — head to the lobby to play your first one.
                    </Text>
                </Card>
            )}

            {data?.map((match) => (

                <Card key={match.id}>
                    <Stack gap={6}>
                        <Text variant="small">
                            vs {match.opponent_username ? `@${match.opponent_username}` : "opponent"}
                        </Text>
                        <Text variant="small" mono>
                            {match.amount} {match.currency}
                        </Text>
                        <Badge
                            text={OUTCOME_LABEL[match.outcome] ?? match.outcome}
                            variant={OUTCOME_VARIANT[match.outcome] ?? "default"}
                        />
                    </Stack>
                </Card>
            ))}

        </Stack>

    );

}
