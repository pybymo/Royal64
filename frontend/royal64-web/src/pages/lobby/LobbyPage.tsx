import { useState } from "react";

import { Button, Card, Stack, Text, Loader } from "@/shared/ui";
import { useLobby } from "@/features/lobby/useLobby";

export function LobbyPage() {

    const {
        offers,
        loading,
        error,
        createOffer,
        creating,
        acceptOffer,
        accepting,
    } = useLobby();

    const [stake, setStake] = useState("1");
    const [timeControl, setTimeControl] = useState("5");

    return (

        <Stack gap={16}>

            <Card>
                <Stack gap={12}>

                    <Text variant="h2">
                        Create offer
                    </Text>

                    <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={stake}
                        onChange={(e) => setStake(e.target.value)}
                        placeholder="Stake (TON)"
                    />

                    <input
                        type="number"
                        min="1"
                        value={timeControl}
                        onChange={(e) => setTimeControl(e.target.value)}
                        placeholder="Minutes per player"
                    />

                    <Button
                        disabled={creating}
                        onClick={() =>
                            createOffer({
                                stake: Number(stake),
                                match_type: "BO1",
                                time_control: Number(timeControl),
                            })
                        }
                    >
                        {creating ? "Creating..." : "Create Offer"}
                    </Button>

                </Stack>
            </Card>

            <Card>
                <Stack gap={12}>

                    <Text variant="h2">
                        Open offers
                    </Text>

                    {loading && (
                        <Stack gap={8}>
                            <Loader />
                            <Text variant="small">Loading offers...</Text>
                        </Stack>
                    )}

                    {!loading && offers.length === 0 && (
                        <Text variant="small">
                            No open offers right now — create one above.
                        </Text>
                    )}

                    {offers.map((offer) => (

                        <Card key={offer.id}>
                            <Stack gap={8}>
                                <Text variant="small" mono>
                                    {offer.stake} TON · {offer.match_type} ·{" "}
                                    {offer.time_control} min
                                </Text>
                                <Button
                                    disabled={accepting}
                                    onClick={() => acceptOffer(offer.id)}
                                >
                                    {accepting ? "Accepting..." : "Accept"}
                                </Button>
                            </Stack>
                        </Card>
                    ))}

                </Stack>
            </Card>

            {error && (
                <Card>
                    <Text variant="small">{error}</Text>
                </Card>
            )}

        </Stack>

    );

}
