import { useState } from "react";

import { Badge, Button, Card, Stack, Text, Loader } from "@/shared/ui";
import { useLobby } from "@/features/lobby/useLobby";

const STAKE_PRESETS = [0, 1, 5, 10];

export function LobbyPage() {

    const {
        offers,
        loading,
        error,
        createOffer,
        creating,
        acceptOffer,
        accepting,
        playBot,
        startingBot,
    } = useLobby();

    const [stake, setStake] = useState("1");
    const [timeControl, setTimeControl] = useState("5");

    return (

        <Stack gap={20}>

            <Text variant="h2" display>
                Find a Match
            </Text>

            <Card
                style={{
                    background: "var(--gradient-gold)",
                    boxShadow: "var(--shadow-gold)",
                }}
            >
                <Stack gap={10}>
                    <div style={{ color: "#1A1305", fontWeight: 800, fontSize: 17 }}>
                        No one around right now?
                    </div>
                    <div style={{ color: "#3A2C0A", fontSize: 13 }}>
                        Play a free practice game against the house bot —
                        instant start, no wallet needed.
                    </div>
                    <button
                        type="button"
                        disabled={startingBot}
                        onClick={() => playBot(Number(timeControl) || 5)}
                        style={{
                            marginTop: 4,
                            padding: "12px 0",
                            borderRadius: "var(--radius-md)",
                            background: "#1A1305",
                            color: "var(--gold-bright)",
                            fontWeight: 700,
                            fontSize: 14,
                        }}
                    >
                        {startingBot ? "Starting..." : "▶ Play vs Bot"}
                    </button>
                </Stack>
            </Card>

            <Card>
                <Stack gap={14}>

                    <Text variant="h3">
                        Create Table
                    </Text>

                    <div style={{ display: "flex", gap: 8 }}>
                        {STAKE_PRESETS.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setStake(String(preset))}
                                style={{
                                    flex: 1,
                                    padding: "10px 0",
                                    borderRadius: "var(--radius-sm)",
                                    background: Number(stake) === preset
                                        ? "var(--gradient-gold)"
                                        : "var(--surface-2)",
                                    color: Number(stake) === preset
                                        ? "#1A1305"
                                        : "var(--text)",
                                    fontWeight: 700,
                                    fontSize: 14,
                                }}
                            >
                                {preset === 0 ? "Free" : `${preset} TON`}
                            </button>
                        ))}
                    </div>

                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={stake}
                        onChange={(e) => setStake(e.target.value)}
                        placeholder="Custom stake (TON, 0 = free)"
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
                        {creating ? "Creating..." : Number(stake) === 0 ? "Create Free Table" : "Create Table"}
                    </Button>

                </Stack>
            </Card>

            <Text variant="h3">
                Open Tables
            </Text>

            {loading && (
                <Card>
                    <Stack gap={8}>
                        <Loader />
                        <Text variant="small">Loading tables...</Text>
                    </Stack>
                </Card>
            )}

            {!loading && offers.length === 0 && (
                <Card>
                    <Text variant="small">
                        No open tables right now — create one above, or play the bot while you wait.
                    </Text>
                </Card>
            )}

            {offers.map((offer) => (

                <Card key={offer.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                        <Stack gap={6}>
                            <Text variant="h3" mono>
                                {offer.stake === 0 ? "Free" : `${offer.stake} TON`}
                            </Text>
                            <div style={{ display: "flex", gap: 6 }}>
                                <Badge text={offer.match_type} />
                                <Badge text={`${offer.time_control} min`} variant="muted" />
                            </div>
                        </Stack>

                        <Button
                            disabled={accepting}
                            onClick={() => acceptOffer(offer.id)}
                        >
                            {accepting ? "..." : "Join"}
                        </Button>

                    </div>
                </Card>
            ))}

            {error && (
                <Card>
                    <Text variant="small">{error}</Text>
                </Card>
            )}

        </Stack>

    );

}
