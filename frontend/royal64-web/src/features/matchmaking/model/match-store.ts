import { create } from "zustand";

import type { Match } from "@/entities/match";

interface MatchStore {

    matches: Match[];

    add(match: Match): void;

}

export const useMatchStore = create<MatchStore>((set) => ({

    matches: [],

    add(match) {

        set((state) => ({

            matches: [...state.matches, match],

        }));

    },

}));