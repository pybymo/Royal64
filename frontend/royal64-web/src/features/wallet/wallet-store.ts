import { create } from "zustand";

import type { Wallet } from "@/shared/types/wallet";

interface WalletStore {

    wallet: Wallet;

    setBalance(value: number): void;

}

export const useWalletStore = create<WalletStore>((set) => ({

    wallet: {

        balance: 10.35,

        locked: 0,

        currency: "TON",

    },

    setBalance(value) {

        set((state) => ({

            wallet: {

                ...state.wallet,

                balance: value,

            },

        }));

    },

}));