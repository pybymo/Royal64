import type { LedgerEntry } from "@/entities/ledger";
import type { Wallet } from "@/entities/wallet";

export function projectWallet(

    wallet: Wallet,

    entries: LedgerEntry[]

): Wallet {

    let available = wallet.totalBalance;
    let locked = 0;

    for (const entry of entries) {

        switch (entry.type) {

            case "deposit":

                available += entry.amount;

                break;

            case "withdraw":

                available += entry.amount;

                break;

            case "lock":

                available += entry.amount;
                locked -= entry.amount;

                break;

            case "unlock":

                available += entry.amount;
                locked -= entry.amount;

                break;

            case "refund":

                available += entry.amount;

                break;

            case "prize":

                available += entry.amount;

                break;

            case "fee":

                available += entry.amount;

                break;

        }

    }

    return {

        ...wallet,

        availableBalance: available,

        lockedBalance: locked,

        totalBalance: available + locked,

    };

}