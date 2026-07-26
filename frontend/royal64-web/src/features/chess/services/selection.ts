import {
    useBoardStore,
} from "@/features/chess";

import {
    legalMoves,
} from "./legal-moves";

export function selectSquare(

    row: number,

    col: number

) {

    const state =

        useBoardStore.getState();

    state.select(

        row,

        col

    );

    const moves =

        legalMoves(

            state.board,

            row,

            col

        );

    return moves.filter(

        (

            square: {

                row: number;

                col: number;

            }

        ) =>

            square.row >= 0 &&
            square.row < 8 &&
            square.col >= 0 &&
            square.col < 8

    );

}