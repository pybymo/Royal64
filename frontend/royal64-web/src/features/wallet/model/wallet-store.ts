import { create } from "zustand";

import type { Wallet } from "@/entities/wallet";

interface WalletStore {

    wallet: Wallet;

    setAvailableBalance(value: number): void;

    setLockedBalance(value: number): void;

}

export const useWalletStore = create<WalletStore>((set) => ({

    wallet: {

        id: 1,

        ownerId: 1,

        currency: "TON",

        address: undefined,

        totalBalance: 10.35,

        availableBalance: 10.35,

        lockedBalance: 0,

        createdAt: new Date().toISOString(),

        updatedAt: new Date().toISOString(),

    },

    setAvailableBalance(value) {

        set((state) => ({

            wallet: {

                ...state.wallet,

                availableBalance: value,

                totalBalance:

                    value +

                    state.wallet.lockedBalance,

                updatedAt: new Date().toISOString(),

            },

        }));

    },

    setLockedBalance(value) {

        set((state) => ({

            wallet: {

                ...state.wallet,

                lockedBalance: value,

                totalBalance:

                    state.wallet.availableBalance +

                    value,

                updatedAt: new Date().toISOString(),

            },

        }));

    },

}));