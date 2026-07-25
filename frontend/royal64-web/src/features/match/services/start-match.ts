import { useMatchStore } from "@/features/match";

import type { Match } from "@/entities/match";

export function startMatch(

    match: Match

) {

    useMatchStore.getState().setCurrent({

        ...match,

        status: "playing",

        startedAt: new Date().toISOString(),

    });

}