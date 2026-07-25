import { useWalletStore } from "@/features/wallet";
import { useLedgerStore } from "@/features/ledger";
import { buildWalletProjection } from "@/features/wallet";

export function useWallet() {

    const wallet = useWalletStore((s) => s.wallet);

    const entries = useLedgerStore((s) => s.entries);

    return {

        wallet: buildWalletProjection(wallet, entries),

    };

}