import { useBoardStore } from "@/features/chess";

import { isInCheck } from "@/features/chess/engine";

export function movePiece(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
) {

    const state = useBoardStore.getState();

    const board = state.board.map(
        (row) => row.split("")
    );

    const movingPiece = board[fromRow][fromCol];

    board[toRow][toCol] = movingPiece;
    board[fromRow][fromCol] = ".";

    const updatedBoard = board.map(
        (row) => row.join("")
    );

    state.setBoard(updatedBoard);

    const movingWhite =
        movingPiece === movingPiece.toUpperCase();

    if (
        isInCheck(
            updatedBoard,
            movingWhite
        )
    ) {

        console.warn("CHECK");

    }

    state.clearSelection();

    state.nextTurn();

}