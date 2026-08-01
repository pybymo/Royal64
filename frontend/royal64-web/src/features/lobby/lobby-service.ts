import { api } from "@/shared/api/http";

export interface Offer {
    id: string;
    owner_id: string;
    stake: number;
    match_type: "BO1" | "BO3";
    time_control: number;
    status: string;
    note: string | null;
    created_at: string;
}

export interface CreateOfferInput {
    stake: number;
    match_type: "BO1" | "BO3";
    time_control: number;
    note?: string;
}

export interface MatchOut {
    id: string;
    offer_id: string;
    white_player_id: string;
    black_player_id: string;
    amount: number;
    currency: string;
    games_required: number;
    status: string;
    created_at: string;
}

export async function listOffers(): Promise<Offer[]> {
    return api<Offer[]>("/offers");
}

export async function createOffer(input: CreateOfferInput): Promise<Offer> {
    return api<Offer>("/offers", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export async function acceptOffer(offerId: string): Promise<MatchOut> {
    return api<MatchOut>(`/offers/${offerId}/accept`, {
        method: "POST",
    });
}
