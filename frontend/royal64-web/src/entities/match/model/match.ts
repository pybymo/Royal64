export type MatchStatus =
    | "waiting"
    | "funding"
    | "ready"
    | "playing"
    | "finished"
    | "cancelled";

export interface Match {

    id: number;

    playerOneId: number;

    playerTwoId: number;

    escrowId: number;

    winnerId?: number;

    status: MatchStatus;

    bestOf: 1 | 3;

    currentGame: number;

    createdAt: string;

    startedAt?: string;

    finishedAt?: string;

}