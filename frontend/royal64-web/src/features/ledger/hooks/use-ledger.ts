import { useLedgerStore } from "@/features/ledger";

export function useLedger() {

    const entries = useLedgerStore(

        (state) => state.entries

    );

    return {

        entries,

    };

}