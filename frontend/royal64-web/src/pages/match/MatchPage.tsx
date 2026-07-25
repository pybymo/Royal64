import { Stack, Text } from "@/shared/ui";

import { useCurrentMatch } from "@/features/match";
import { ChessBoard } from "@/features/chess";

import { useBoard } from "@/features/chess";

export function MatchPage() {

    const { match } = useCurrentMatch();

    const { turn } = useBoard();

    if (!match) {

        return (

            <Stack gap={20}>

                <Text variant="h2">

                    Match

                </Text>

                <Text>

                    No Match

                </Text>

            </Stack>

        );

    }

    return (

        <Stack gap={20}>

            <Text variant="h2">

                Match #{match.id}

            </Text>

            <Text>

                Status: {match.status}

            </Text>

            <Text>

                BO{match.bestOf}

            </Text>

            <Text>

                Game {match.currentGame}

            </Text>

            <Text>

                Turn

            </Text>

            <Text>

                {turn === "white" ? "White" : "Black"}

            </Text>

            <ChessBoard />

        </Stack>

    );

}