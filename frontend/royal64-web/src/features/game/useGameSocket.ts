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

export function useGameSocket(gameId: string) {

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

    useEffect(() => {

        if (!token) {
            return;
        }

        const ws = new WebSocket(gameSocketUrl(gameId, token));
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);

        ws.onclose = () => setConnected(false);

        ws.onerror = () => setError("Connection error");

        ws.onmessage = (event) => {

            const msg = JSON.parse(event.data);

            if (msg.type === "you") {

                setMyColor(msg.color);

            } else if (msg.type === "state") {

                setState({
                    fen: msg.fen,
                    turn: msg.turn,
                    whiteTimeMs: msg.white_time_ms,
                    blackTimeMs: msg.black_time_ms,
                    lastMove: msg.last_move,
                });

            } else if (msg.type === "game_over") {

                setGameOver({ result: msg.result, reason: msg.reason });

            } else if (msg.type === "next_game") {

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

        return () => {
            ws.close();
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
