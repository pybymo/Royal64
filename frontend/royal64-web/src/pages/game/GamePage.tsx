import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";

import { Button, BoardThemePicker, Card, PromotionPicker, Stack, Text, Loader } from "@/shared/ui";
import { useGameSocket } from "@/features/game/useGameSocket";
import { WinCard } from "@/features/game/WinCard";
import { useBoardThemeStore } from "@/features/game/board-theme-store";
import { BOARD_THEMES, buildSquareStyles } from "@/shared/theme/boardThemes";
import { playMoveSound } from "@/shared/audio/moveSounds";
import { isPromotionMove } from "@/shared/chess/fen";

function formatClock(ms: number): string {

    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function GamePage() {

    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();

    const { state, myColor, gameOver, nextGame, error, connected, sendMove, resign } =
        useGameSocket(gameId!);

    const boardTheme = useBoardThemeStore((s) => s.theme);
    const setBoardTheme = useBoardThemeStore((s) => s.setTheme);

    const [pendingPromotion, setPendingPromotion] =
        useState<{ from: string; to: string } | null>(null);

    const lastMoveUci = useRef<string | null>(null);

    useEffect(() => {

        if (nextGame) {
            navigate(`/game/${nextGame.gameId}`);
        }

    }, [nextGame, navigate]);

    // Plays the theme's move sound whenever a new move actually lands
    // — this fires for both players' moves (the server broadcasts
    // state to both sides), not just the one the local player made.
    useEffect(() => {

        const uci = state?.lastMove?.uci;

        if (uci && uci !== lastMoveUci.current) {
            lastMoveUci.current = uci;
            playMoveSound(boardTheme);
        }

    }, [state?.lastMove, boardTheme]);

    if (!state) {

        return (
            <Card>
                <Stack gap={12}>
                    {!connected && <Loader />}
                    <Text variant="small">
                        {connected ? "Loading game..." : "Connecting..."}
                    </Text>
                    {error && <Text variant="small">{error}</Text>}
                </Stack>
            </Card>
        );
    }

    const theme = BOARD_THEMES[boardTheme];

    return (

        <Stack gap={16}>

            <Card>
                <Stack gap={4}>
                    <Text variant="small" mono>
                        White: {formatClock(state.whiteTimeMs)}
                    </Text>
                    <Text variant="small" mono>
                        Black: {formatClock(state.blackTimeMs)}
                    </Text>
                    <Text variant="small">
                        Turn: {state.turn}
                        {!connected && "  ·  reconnecting..."}
                    </Text>
                </Stack>
            </Card>

            <BoardThemePicker value={boardTheme} onChange={setBoardTheme} />

            <div style={theme.boardWrapperStyle}>

                <Chessboard
                    options={{
                        position: state.fen,
                        squareStyles: buildSquareStyles(theme),
                        // Flips the board for the black player instead of
                        // making both sides stare at it from White's
                        // perspective — myColor comes from a dedicated
                        // "you" message the server sends on connect,
                        // since the broadcast game state is identical
                        // for both players and can't carry per-recipient
                        // info itself.
                        boardOrientation: myColor ?? "white",
                        onPieceDrop: ({ sourceSquare, targetSquare }) => {

                            if (!targetSquare) {
                                return false;
                            }

                            if (isPromotionMove(state.fen, sourceSquare, targetSquare)) {

                                setPendingPromotion({
                                    from: sourceSquare,
                                    to: targetSquare,
                                });

                                // Let the piece visually land — the actual
                                // move is only sent once a piece is chosen
                                // below. If it turns out illegal/not your
                                // turn, the server's error response is the
                                // real check either way.
                                return true;
                            }

                            // Server is the source of truth for legality and
                            // turn order — this just fires the intent. If
                            // it's illegal or out of turn, the server sends
                            // back {"type": "error", ...} and the board
                            // simply doesn't update (still shows state.fen).
                            sendMove(`${sourceSquare}${targetSquare}`);

                            return true;
                        },
                    }}
                />

            </div>

            {pendingPromotion && (

                <PromotionPicker
                    onSelect={(piece) => {

                        sendMove(`${pendingPromotion.from}${pendingPromotion.to}${piece}`);

                        setPendingPromotion(null);
                    }}
                />
            )}

            {error && (
                <Card>
                    <Text variant="small">{error}</Text>
                </Card>
            )}

            {gameOver ? (

                <Stack gap={12}>

                    <Card>
                        <Stack gap={8}>
                            <Text variant="h3">
                                Game over — {gameOver.result} ({gameOver.reason})
                            </Text>
                        </Stack>
                    </Card>

                    <WinCard gameId={gameId!} />

                </Stack>

            ) : (

                <Button onClick={resign}>
                    Resign
                </Button>
            )}

        </Stack>

    );

}
