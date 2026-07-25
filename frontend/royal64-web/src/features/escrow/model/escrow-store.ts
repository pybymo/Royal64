import { create } from "zustand";

import type { Escrow } from "@/entities/escrow";

interface EscrowStore {

    escrows: Escrow[];

    setEscrows(escrows: Escrow[]): void;

}

export const useEscrowStore = create<EscrowStore>((set) => ({

    escrows: [],

    setEscrows(escrows) {

        set({

            escrows,

        });

    },

}));