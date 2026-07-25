import { useMemo } from "react";

import { useWalletStore } from "@/features/wallet";
import { useLedgerStore } from "@/features/ledger";

import { projectWallet } from "@/features/wallet";

export function useWallet() {

    const wallet = useWalletStore(

        (state) => state.wallet

    );

    const entries = useLedgerStore(

        (state) => state.entries

    );

    const projected = useMemo(

        () =>

            projectWallet(

                wallet,

                entries

            ),

        [wallet, entries]

    );

    return {

        wallet: projected,

    };

}