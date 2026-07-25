import type { Currency } from "@/entities/wallet";

export type OfferStatus =
    | "open"
    | "accepted"
    | "cancelled"
    | "expired";

export interface Offer {

    id: number;

    creatorId: number;

    opponentId?: number;

    stake: number;

    currency: Currency;

    status: OfferStatus;

    isPrivate: boolean;

    inviteCode?: string;

    expiresAt: string;

    createdAt: string;

}