export type Currency = "TON";

export interface Wallet {

    id: number;

    ownerId: number;

    currency: Currency;

    address?: string;

    totalBalance: number;

    availableBalance: number;

    lockedBalance: number;

    pendingBalance: number;

    createdAt: string;

    updatedAt: string;

}