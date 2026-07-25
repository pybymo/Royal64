import { create } from "zustand";

import type { LedgerEntry } from "@/entities/ledger";

interface LedgerStore {

    entries: LedgerEntry[];

    add(entry: LedgerEntry): void;

    setEntries(entries: LedgerEntry[]): void;

}

export const useLedgerStore = create<LedgerStore>((set) => ({

    entries: [],

    add(entry) {

        set((state) => ({

            entries: [...state.entries, entry],

        }));

    },

    setEntries(entries) {

        set({

            entries,

        });

    },

}));