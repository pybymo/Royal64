import type { LedgerEntry } from "@/entities/ledger";
import type { Wallet } from "@/entities/wallet";

export function buildWalletProjection(
    wallet: Wallet,
    entries: LedgerEntry[]
): Wallet {

    const total = entries.reduce(
        (sum, e) => sum + e.amount,
        0
    );

    return {
        ...wallet,
        totalBalance: total,
        availableBalance: total,
    };

}