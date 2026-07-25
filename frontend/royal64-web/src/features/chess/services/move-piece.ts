import { useBoardStore } from "@/features/chess";

import {

    isInCheck,

    isCheckmate,

} from "@/features/chess/engine";

export function movePiece(

    fromRow: number,

    fromCol: number,

    toRow: number,

    toCol: number

) {

    const state =

        useBoardStore.getState();

    const board =

        state.board.map(

            (r) => r.split("")

        );

    const movingPiece =

        board[fromRow][fromCol];

    board[toRow][toCol] =
        movingPiece;

    board[fromRow][fromCol] = ".";

    const updatedBoard =

        board.map(

            (r) => r.join("")

        );

    state.setBoard(

        updatedBoard

    );

    const movingWhite =

        movingPiece ===

        movingPiece.toUpperCase();

    if (

        isInCheck(

            updatedBoard,

            !movingWhite

        )

    ) {

        console.warn(

            "CHECK"

        );

    }

    if (

        isCheckmate(

            updatedBoard,

            !movingWhite

        )

    ) {

        console.warn(

            "CHECKMATE"

        );

    }

    state.clearSelection();

    state.nextTurn();

}