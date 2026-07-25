import { create } from "zustand";

import type { LedgerEntry } from "@/entities/ledger";

interface LedgerStore {
    entries: LedgerEntry[];
    setEntries(entries: LedgerEntry[]): void;
}

export const useLedgerStore = create<LedgerStore>((set) => ({
    entries: [],
    setEntries(entries) {
        set({ entries });
    },
}));