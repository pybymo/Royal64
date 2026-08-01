import { useEffect, useState } from "react";

import { Button, Card, Loader, Stack, Text } from "@/shared/ui";
import { useAuthStore } from "@/features/auth/auth-store";
import { getGameSummary, type GameSummary } from "./winCard-service";
import { buildWinCardSvg, winCardToPngBlob } from "@/shared/share/winCardImage";
import { shareOrDownloadImage } from "@/shared/share/shareImage";

type Props = {
    gameId: string;
};

export function WinCard({ gameId }: Props) {

    const user = useAuthStore((s) => s.user);

    const [summary, setSummary] = useState<GameSummary | null>(null);
    const [svg, setSvg] = useState<string | null>(null);
    const [sharing, setSharing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        let cancelled = false;

        getGameSummary(gameId)
            .then((data) => {

                if (cancelled) {
                    return;
                }

                setSummary(data);
                setSvg(buildWinCardSvg(data, user?.username ?? null));
            })
            .catch(() => {

                if (!cancelled) {
                    setError("Couldn't load the win card yet.");
                }
            });

        return () => {
            cancelled = true;
        };

    }, [gameId, user?.username]);

    async function handleShare() {

        if (!svg) {
            return;
        }

        setSharing(true);
        setError(null);

        try {
            const blob = await winCardToPngBlob(svg);

            await shareOrDownloadImage(
                blob,
                "royal64-result.png",
                "My result on Royal64 ♟️"
            );

        } catch {
            setError("Couldn't generate the share image.");

        } finally {
            setSharing(false);
        }
    }

    if (error) {
        return (
            <Card>
                <Text variant="small">{error}</Text>
            </Card>
        );
    }

    if (!summary || !svg) {
        return (
            <Card>
                <Stack gap={8}>
                    <Loader />
                    <Text variant="small">Preparing your result card...</Text>
                </Stack>
            </Card>
        );
    }

    return (

        <Card>
            <Stack gap={12}>

                <div
                    style={{
                        width: "100%",
                        aspectRatio: "9 / 16",
                        borderRadius: 12,
                        overflow: "hidden",
                    }}
                    // The SVG is built entirely from our own template plus
                    // server-supplied plain stats (usernames, numbers) that
                    // are XML-escaped in buildWinCardSvg — nothing here
                    // comes from unsanitized free-form user text.
                    dangerouslySetInnerHTML={{ __html: svg }}
                />

                <Button onClick={handleShare} disabled={sharing}>
                    {sharing ? "Preparing..." : "Share result"}
                </Button>

            </Stack>
        </Card>

    );
}
