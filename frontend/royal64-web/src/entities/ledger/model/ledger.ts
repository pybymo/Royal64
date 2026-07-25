export type LedgerEntryType =
    | "deposit"
    | "withdraw"
    | "lock"
    | "unlock"
    | "prize"
    | "fee"
    | "refund";

export interface LedgerEntry {

    id: number;

    walletId: number;

    transactionId: number;

    type: LedgerEntryType;

    amount: number;

    balanceBefore: number;

    balanceAfter: number;

    description: string;

    createdAt: string;

}