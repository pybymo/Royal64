export interface MatchOffer {
    id: number;

    creatorId: number;

    creatorName: string;

    stake: number;

    currency: "TON";

    timeControl: string;

    rated: boolean;

    createdAt: string;
}