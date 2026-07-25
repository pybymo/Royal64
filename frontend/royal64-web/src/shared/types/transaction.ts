export type TransactionType =
    | "deposit"
    | "withdraw"
    | "stake_lock"
    | "stake_release"
    | "prize"
    | "fee";

export interface Transaction {

    id: number;

    walletId: number;

    amount: number;

    currency: "TON";

    type: TransactionType;

    createdAt: string;

    reference?: string;

}