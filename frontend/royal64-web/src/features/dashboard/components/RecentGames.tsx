import { useCurrentMatch } from "@/features/match";

import { Text } from "@/shared/ui";

export function RecentGames() {

    const { match } = useCurrentMatch();

    if (!match)

        return <Text>No Active Match</Text>;

    return (

        <Text>

            Active Match #{match.id}

        </Text>

    );

}