import type { Currency } from "@/entities/wallet";

export type MatchStatus =
    | "waiting"
    | "active"
    | "finished"
    | "cancelled"
    | "expired";

export interface Match {

    id: number;

    whitePlayerId: number;

    blackPlayerId: number;

    winnerId?: number;

    stake: number;

    currency: Currency;

    status: MatchStatus;

    createdAt: string;

    startedAt?: string;

    endedAt?: string;

}