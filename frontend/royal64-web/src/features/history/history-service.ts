import { api } from "@/shared/api/http";

export interface MatchHistoryEntry {
    id: string;
    opponent_username: string | null;
    amount: number;
    currency: string;
    status: string;
    outcome: "WON" | "LOST" | "DRAW" | "PENDING";
    created_at: string;
}

export async function getMyMatches(): Promise<MatchHistoryEntry[]> {
    return api<MatchHistoryEntry[]>("/matches/mine");
}
