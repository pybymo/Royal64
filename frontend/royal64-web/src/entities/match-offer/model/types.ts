import type { Currency } from "@/entities/wallet";

export type MatchOfferStatus =
    | "open"
    | "accepted"
    | "cancelled"
    | "expired";

export interface MatchOffer {

    id: number;

    creatorId: number;

    opponentId?: number;

    stake: number;

    currency: Currency;

    status: MatchOfferStatus;

    isPrivate: boolean;

    inviteCode?: string;

    expiresAt: string;

    createdAt: string;

}