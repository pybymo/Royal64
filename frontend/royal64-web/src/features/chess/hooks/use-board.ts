import { useBoardStore } from "@/features/chess";

export function useBoard() {

    const board =

        useBoardStore(

            (s) => s.board

        );

    const selected =

        useBoardStore(

            (s) => s.selected

        );

    const turn =

        useBoardStore(

            (s) => s.turn

        );

    return {

        board,

        selected,

        turn,

    };

}