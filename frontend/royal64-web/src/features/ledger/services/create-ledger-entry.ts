import type { LedgerEntry, LedgerEntryType } from "@/entities/ledger";

export function createLedgerEntry(

    walletId: number,

    amount: number,

    type: LedgerEntryType

): LedgerEntry {

    return {

        id: Date.now(),

        walletId,

        transactionId: 0,

        type,

        amount,

        balanceBefore: 0,

        balanceAfter: 0,

        description: "",

        createdAt: new Date().toISOString(),

    };

}