import type { LedgerEntry } from "@/entities/ledger";

export class LedgerService {

    deposit(
        walletId: number,
        transactionId: number,
        amount: number,
        currentBalance: number
    ): LedgerEntry {

        return {
            id: Date.now(),
            walletId,
            transactionId,
            type: "deposit",
            amount,
            balanceBefore: currentBalance,
            balanceAfter: currentBalance + amount,
            description: "Deposit",
            createdAt: new Date().toISOString(),
        };

    }

}