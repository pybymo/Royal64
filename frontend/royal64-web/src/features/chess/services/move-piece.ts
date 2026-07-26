import { useBoardStore } from "@/features/chess";

import {

    isInCheck,

    isCheckmate,

} from "@/features/chess/engine";

import {

    needsPromotion,

    usePromotionStore,

} from "@/features/chess/promotion";

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

    const white =

        movingPiece ===

        movingPiece.toUpperCase();

    board[toRow][toCol] =

        movingPiece;

    board[fromRow][fromCol] =

        ".";

    if (

        movingPiece.toLowerCase() === "k"

    ) {

        if (

            fromCol === 4 &&
            toCol === 6

        ) {

            board[fromRow][5] =

                board[fromRow][7];

            board[fromRow][7] =

                ".";

        }

        if (

            fromCol === 4 &&
            toCol === 2

        ) {

            board[fromRow][3] =

                board[fromRow][0];

            board[fromRow][0] =

                ".";

        }

    }

    const updatedBoard =

        board.map(

            (r) => r.join("")

        );

    state.setBoard(

        updatedBoard

    );

    if (

        movingPiece.toLowerCase() === "k"

    ) {

        if (

            white

        ) {

            state.whiteKingMoved = true;

        } else {

            state.blackKingMoved = true;

        }

    }

    if (

        movingPiece.toLowerCase() === "r"

    ) {

        if (

            white

        ) {

            if (

                fromCol === 0

            ) {

                state.whiteLeftRookMoved = true;

            }

            if (

                fromCol === 7

            ) {

                state.whiteRightRookMoved = true;

            }

        } else {

            if (

                fromCol === 0

            ) {

                state.blackLeftRookMoved = true;

            }

            if (

                fromCol === 7

            ) {

                state.blackRightRookMoved = true;

            }

        }

    }

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

    }

    if (

        isInCheck(

            updatedBoard,

            !white

        )

    ) {

        console.warn(

            "CHECK"

        );

    }

    if (

        isCheckmate(

            updatedBoard,

            !white

        )

    ) {

        console.warn(

            "CHECKMATE"

        );

    }

    state.clearSelection();

    state.nextTurn();

}