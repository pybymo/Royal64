import { api, API_URL } from "@/shared/api/http";

export interface Game {
    id: string;
    match_id: string;
    game_number: number;
    status: "WAITING" | "PLAYING" | "FINISHED";
    result: "WHITE" | "BLACK" | "DRAW" | null;
    time_control_minutes: number;
    white_time_ms: number | null;
    black_time_ms: number | null;
    fen: string;
    created_at: string;
}

export async function getCurrentGame(matchId: string): Promise<Game> {
    return api<Game>(`/matches/${matchId}/current-game`);
}

export async function getGame(gameId: string): Promise<Game> {
    return api<Game>(`/games/${gameId}`);
}

export function gameSocketUrl(gameId: string, token: string): string {

    const wsBase = API_URL.replace(/^http/, "ws");

    return `${wsBase}/ws/game/${gameId}?token=${encodeURIComponent(token)}`;
}
