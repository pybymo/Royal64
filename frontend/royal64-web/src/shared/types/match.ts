export type MatchStatus =
    | "waiting"
    | "playing"
    | "finished"
    | "cancelled";

export interface Match {

    id: number;

    whitePlayerId: number;

    blackPlayerId: number;

    stake: number;

    currency: "TON";

    status: MatchStatus;

    createdAt: string;

}