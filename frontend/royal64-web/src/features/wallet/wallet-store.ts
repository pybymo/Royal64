import { create } from "zustand";

import type { Wallet } from "@/shared/types/wallet";

interface WalletStore {

    wallet: Wallet;

    connecting: boolean;

    error: string | null;

    setBalance(value: number): void;

    setConnecting(value: boolean): void;

    setError(message: string | null): void;

    setConnected(address: string, verified: boolean): void;

    disconnect(): void;
}

const initialWallet: Wallet = {

    balance: 10.35,

    locked: 0,

    currency: "TON",

    address: null,

    isVerified: false,
};

export const useWalletStore = create<WalletStore>((set) => ({

    wallet: initialWallet,

    connecting: false,

    error: null,

    setBalance(value) {

        set((state) => ({
            wallet: {
                ...state.wallet,
                balance: value,
            },
        }));
    },

    setConnecting(value) {

        set({ connecting: value });
    },

    setError(message) {

        set({ error: message });
    },

    setConnected(address, verified) {

        set((state) => ({
            wallet: {
                ...state.wallet,
                address,
                isVerified: verified,
            },
            connecting: false,
            error: null,
        }));
    },

    disconnect() {

        set((state) => ({
            wallet: {
                ...state.wallet,
                address: null,
                isVerified: false,
            },
        }));
    },
}));
