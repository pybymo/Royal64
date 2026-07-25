import { create } from "zustand";

import type { Escrow } from "@/entities/escrow";

interface EscrowStore {

    escrows: Escrow[];

    add(escrow: Escrow): void;

}

export const useEscrowStore = create<EscrowStore>((set) => ({

    escrows: [],

    add(escrow) {

        set((state) => ({

            escrows: [...state.escrows, escrow],

        }));

    },

}));