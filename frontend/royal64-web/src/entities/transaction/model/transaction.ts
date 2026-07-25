import type { Currency } from "@/entities/wallet";

export type TransactionType =
    | "deposit"
    | "withdraw"
    | "entryFee"
    | "prize"
    | "refund"
    | "commission"
    | "bonus";

export type TransactionStatus =
    | "pending"
    | "completed"
    | "failed";

export interface Transaction {

    id: number;

    walletId: number;

    type: TransactionType;

    status: TransactionStatus;

    amount: number;

    currency: Currency;

    description?: string;

    createdAt: string;

    updatedAt: string;

}