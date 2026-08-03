import { useCallback, useEffect, useRef, useState } from "react";

import { useSessionStore } from "@/features/auth/session-store";
import { gameSocketUrl } from "./game-service";

interface GameState {
    fen: string;
    turn: "white" | "black";
    whiteTimeMs: number;
    blackTimeMs: number;
    lastMove: { uci: string; san: string } | null;
}

interface GameOverInfo {
    result: "WHITE" | "BLACK" | "DRAW";
    reason: string;
}

interface NextGameInfo {
    gameId: string;
    gameNumber: number;
}

interface OpponentDisconnectInfo {
    color: "white" | "black";
    graceSeconds: number;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 1500;

export function useGameSocket(gameId: string | undefined) {

    const token = useSessionStore((s) => s.session?.accessToken);

    const [state, setState] = useState<GameState | null>(null);
    const [myColor, setMyColor] = useState<"white" | "black" | null>(null);
    const [gameOver, setGameOver] = useState<GameOverInfo | null>(null);
    const [nextGame, setNextGame] = useState<NextGameInfo | null>(null);
    const [opponentDisconnect, setOpponentDisconnect] =
        useState<OpponentDisconnectInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttempt = useRef(0);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const gotStateRef = useRef(false);
    const finishedRef = useRef(false);

    useEffect(() => {

        // gameId can be transiently undefined for a render or two right
        // after a route change (e.g. navigating here from accepting an
        // offer, or the Bo3 auto-advance to the next game) — connecting
        // with a bad URL then never retrying was very likely why the
        // game screen sometimes silently failed to load, requiring a
        // manual navigate-away-and-back to get a fresh mount.
        if (!token || !gameId) {
            return;
        }

        let cancelled = false;

        function connect() {

            if (cancelled) {
                return;
            }

            const ws = new WebSocket(gameSocketUrl(gameId!, token!));
            wsRef.current = ws;

            ws.onopen = () => {
                setConnected(true);
                reconnectAttempt.current = 0;
            };

            ws.onclose = () => {

                setConnected(false);

                if (cancelled || finishedRef.current) {
                    return;
                }

                if (reconnectAttempt.current >= MAX_RECONNECT_ATTEMPTS) {
                    setError(
                        "Lost connection to the game and couldn't reconnect. " +
                        "Try leaving and reopening it."
                    );
                    return;
                }

                reconnectAttempt.current += 1;

                reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
            };

            ws.onerror = () => {
                // onclose fires right after this and drives the actual
                // reconnect — this only sets a transient message so a
                // one-off blip doesn't get reported as fatal before the
                // retry has even had a chance to run.
                if (!gotStateRef.current) {
                    setError("Connecting...");
                }
            };

            ws.onmessage = (event) => {

                const msg = JSON.parse(event.data);

                if (msg.type === "you") {

                    setMyColor(msg.color);

                } else if (msg.type === "state") {

                    gotStateRef.current = true;
                    setError(null);

                    setState({
                        fen: msg.fen,
                        turn: msg.turn,
                        whiteTimeMs: msg.white_time_ms,
                        blackTimeMs: msg.black_time_ms,
                        lastMove: msg.last_move,
                    });

                } else if (msg.type === "game_over") {

                    finishedRef.current = true;
                    setGameOver({ result: msg.result, reason: msg.reason });

                } else if (msg.type === "next_game") {

                    finishedRef.current = true;
                    setNextGame({ gameId: msg.game_id, gameNumber: msg.game_number });

                } else if (msg.type === "disconnected") {

                    if (!msg.final) {
                        setOpponentDisconnect({
                            color: msg.color,
                            graceSeconds: msg.grace_seconds,
                        });
                    }

                } else if (msg.type === "reconnected") {

                    setOpponentDisconnect(null);

                } else if (msg.type === "error") {

                    setError(msg.message);
                }
            };
        }

        connect();

        return () => {
            cancelled = true;

            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
            }

            wsRef.current?.close();
            wsRef.current = null;
        };

    }, [gameId, token]);

    const sendMove = useCallback((uci: string) => {

        setError(null);

        wsRef.current?.send(JSON.stringify({ type: "move", uci }));

    }, []);

    const resign = useCallback(() => {

        wsRef.current?.send(JSON.stringify({ type: "resign" }));

    }, []);

    return {
        state,
        myColor,
        gameOver,
        nextGame,
        opponentDisconnect,
        error,
        connected,
        sendMove,
        resign,
    };
}
