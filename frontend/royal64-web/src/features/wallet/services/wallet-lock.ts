import { useWalletStore } from "@/features/wallet";

export function lockWallet(amount: number) {

    useWalletStore.getState().lock(amount);

}

export function unlockWallet(amount: number) {

    useWalletStore.getState().unlock(amount);

}