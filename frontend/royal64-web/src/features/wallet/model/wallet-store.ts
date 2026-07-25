import { create } from "zustand";

import type { Wallet } from "@/entities/wallet";

interface WalletStore {

    wallet: Wallet;

    setWallet(wallet: Wallet): void;

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

    setWallet(wallet) {

        set({

            wallet,

        });

    },

}));