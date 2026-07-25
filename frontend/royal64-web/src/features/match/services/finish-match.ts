import { useMatchStore } from "@/features/match";

export function finishMatch(

    winnerId: number

) {

    useMatchStore

        .getState()

        .finish(winnerId);

}