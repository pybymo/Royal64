export type MatchStatus =
    | "waiting"
    | "playing"
    | "finished"
    | "cancelled";

export type MatchType =
    | "bo1"
    | "bo3";

export interface Match {

    id: number;

    whitePlayerId: number;

    blackPlayerId: number;

    stake: number;

    currency: "TON";

    matchType: MatchType;

    timeControl: string;

    status: MatchStatus;

    winnerId?: number;

    createdAt: string;

    startedAt?: string;

    finishedAt?: string;

}