import { lockWallet } from "@/features/wallet";

import { createLedgerEntry } from "@/features/ledger";

import type { Escrow } from "@/entities/escrow";

export function lockFunds(escrow: Escrow) {

    lockWallet(escrow.amountPerPlayer);

    return [

        createLedgerEntry(

            escrow.playerOneWalletId,

            -escrow.amountPerPlayer,

            "lock"

        ),

        createLedgerEntry(

            escrow.playerTwoWalletId,

            -escrow.amountPerPlayer,

            "lock"

        ),

    ];

}