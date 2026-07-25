export interface Escrow {

    id: number;

    matchId: number;

    amount: number;

    currency: "TON";

    participants: number[];

    createdAt: string;

}