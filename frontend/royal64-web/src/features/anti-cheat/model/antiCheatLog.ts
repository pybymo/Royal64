export type AntiCheatAction =
    | "none"
    | "warning"
    | "flagged"
    | "temporaryBan"
    | "permanentBan";

export interface AntiCheatLog {

    id: number;

    userId: number;

    gameId: number;

    trustScoreBefore: number;

    trustScoreAfter: number;

    engineSimilarity: number;

    action: AntiCheatAction;

    reason: string;

    createdAt: string;

}