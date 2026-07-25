import { create } from "zustand";

import type { Match } from "@/entities/match";

interface MatchStore {

    current?: Match;

    matches: Match[];

    setCurrent(match: Match): void;

    add(match: Match): void;

    finish(winnerId: number): void;

}

export const useMatchStore = create<MatchStore>((set) => ({

    matches: [],

    current: undefined,

    add(match) {

        set((state) => ({

            matches: [...state.matches, match],

        }));

    },

    setCurrent(match) {

        set({

            current: match,

        });

    },

    finish(winnerId) {

        set((state) => {

            if (!state.current)

                return state;

            return {

                current: {

                    ...state.current,

                    winnerId,

                    status: "finished",

                    finishedAt: new Date().toISOString(),

                },

            };

        });

    },

}));