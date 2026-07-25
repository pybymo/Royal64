export type EscrowStatus =
    | "created"
    | "funded"
    | "released"
    | "cancelled";

export interface Escrow {

    id: number;

    matchId: number;

    playerOneWalletId: number;

    playerTwoWalletId: number;

    amountPerPlayer: number;

    totalAmount: number;

    status: EscrowStatus;

    createdAt: string;

    updatedAt: string;

}