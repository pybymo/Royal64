import { useBoardStore } from "@/features/chess";

import {
    boardToFen,
} from "@/features/chess/services";

import {
    isCheckmate,
    isInCheck,
    isInsufficientMaterial,
    isStalemate,
} from "@/features/chess/engine";

import {

    isThreefoldRepetition,

} from "@/features/chess/engine";

import {
    needsPromotion,
    usePromotionStore,
} from "@/features/chess/promotion";

import {

    isFiftyMoveRule,

} from "@/features/chess/engine";

export function movePiece(

    fromRow: number,

    fromCol: number,

    toRow: number,

    toCol: number

) {

    const state = useBoardStore.getState();

    const board = state.board.map(

        (r) => r.split("")

    );

    const movingPiece =

        board[fromRow][fromCol];

    const white =

        movingPiece ===

        movingPiece.toUpperCase();

    /*
     * EN PASSANT
     */

    if (

        movingPiece.toLowerCase() === "p" &&
        fromCol !== toCol &&
        board[toRow][toCol] === "."

    ) {

        board[fromRow][toCol] = ".";

    }

    /*
     * NORMAL MOVE
     */

    board[toRow][toCol] = movingPiece;

    board[fromRow][fromCol] = ".";

    /*
     * CASTLING
     */

    if (

        movingPiece.toLowerCase() === "k"

    ) {

        if (

            fromCol === 4 &&
            toCol === 6

        ) {

            board[fromRow][5] = board[fromRow][7];
            board[fromRow][7] = ".";

        }

        if (

            fromCol === 4 &&
            toCol === 2

        ) {

            board[fromRow][3] = board[fromRow][0];
            board[fromRow][0] = ".";

        }

    }

    const updatedBoard =

        board.map(

            (r) => r.join("")

        );

    state.setBoard(

        updatedBoard

    );

    state.addPosition(
        boardToFen(
            updatedBoard,
            !white
        )
    );

    /*
     * LAST MOVE
     */

    state.setLastMove({

        fromRow,

        fromCol,

        toRow,

        toCol,

        piece: movingPiece,

    });

    /*
     * KING FLAGS
     */

    if (

        movingPiece.toLowerCase() === "k"

    ) {

        if (white) {

            state.whiteKingMoved = true;

        } else {

            state.blackKingMoved = true;

        }

    }

    /*
     * ROOK FLAGS
     */

    if (

        movingPiece.toLowerCase() === "r"

    ) {

        if (white) {

            if (fromCol === 0)

                state.whiteLeftRookMoved = true;

            if (fromCol === 7)

                state.whiteRightRookMoved = true;

        } else {

            if (fromCol === 0)

                state.blackLeftRookMoved = true;

            if (fromCol === 7)

                state.blackRightRookMoved = true;

        }

    }

    /*
    * HALF MOVE CLOCK
    */

    if (

        movingPiece.toLowerCase() === "p" ||

        board[toRow][toCol] !== "."

    ) {

        state.resetHalfMove();

    }

    else {

        state.incrementHalfMove();

    }

    /*
     * PROMOTION
     */

    if (

        needsPromotion(

            movingPiece,

            toRow

        )

    ) {

        usePromotionStore

            .getState()

            .show(

                toRow,

                toCol,

                white

            );

        return;

    }

    /*
     * CHECK
     */

    if (

        isInCheck(

            updatedBoard,

            !white

        )

    ) {

        console.warn("CHECK");

    }

    /*
     * CHECKMATE
     */

    if (

        isCheckmate(

            updatedBoard,

            !white

        )

    ) {

        console.warn("CHECKMATE");

        return;

    }

    /*
     * STALEMATE
     */

    /*
    * THREEFOLD REPETITION
    */

    /*
    * FIFTY MOVE RULE
    */

    if (

        isFiftyMoveRule(

            state.halfMoveClock

        )

    ) {

        console.warn(

            "DRAW - FIFTY MOVE RULE"

        );

        return;

    }

    if (

        isThreefoldRepetition(

            state.history

        )

    ) {

        console.warn(

            "DRAW - THREEFOLD"

        );

        return;

    }

    if (

        isStalemate(

            updatedBoard,

            !white

        )

    ) {

        console.warn("STALEMATE");

        return;

    }

    /*
    * INSUFFICIENT MATERIAL
    */

    if (

        isInsufficientMaterial(

            updatedBoard

        )

    ) {

        console.warn(

            "DRAW - INSUFFICIENT MATERIAL"

        );

        return;

    }

    /*
     * END TURN
     */

    state.clearSelection();

    state.nextTurn();

}