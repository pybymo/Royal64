import { useBoardStore } from "@/features/chess";

import { movePiece } from "./move-piece";
import { getLegalMoves } from "./legal-moves";

export function selectSquare(
    row: number,
    col: number
) {

    const state =
        useBoardStore.getState();

    if (state.selected) {

        const legal = getLegalMoves(
            state.board,
            state.selected.row,
            state.selected.col
        );

        const allowed = legal.some(

            (square) =>

                square.row === row &&
                square.col === col

        );

        if (allowed) {

            movePiece(
                state.selected.row,
                state.selected.col,
                row,
                col
            );

            return;

        }

        state.clearSelection();

        return;

    }

    if (
        state.board[row][col] !== "."
    ) {

        state.select(
            row,
            col
        );

    }

}