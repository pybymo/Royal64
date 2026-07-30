import { useWalletStore } from "./wallet-store";
import { useConnectWallet } from "./useConnectWallet";

export function useWallet() {

    const wallet = useWalletStore((s) => s.wallet);
    const connecting = useWalletStore((s) => s.connecting);
    const error = useWalletStore((s) => s.error);

    const { connect, disconnect } = useConnectWallet();

    return {
        wallet,
        connecting,
        error,
        connect,
        disconnect,
    };
}
