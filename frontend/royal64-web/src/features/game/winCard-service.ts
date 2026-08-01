import { api } from "@/shared/api/http";

export interface GameSummary {
    game_id: string;
    result: "WHITE" | "BLACK" | "DRAW";
    end_reason: string | null;
    winner_username: string | null;
    loser_username: string | null;
    total_moves: number;
    winner_time_used_ms: number | null;
    stake: number;
    currency: string;
    time_control_minutes: number;
}

export async function getGameSummary(gameId: string): Promise<GameSummary> {
    return api<GameSummary>(`/games/${gameId}/summary`);
}
