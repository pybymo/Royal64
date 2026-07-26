import { useBoardStore } from "@/features/chess";

import {

    usePromotionStore,

    type PromotionPiece,

} from "@/features/chess/promotion";

import {

    isInCheck,

    isCheckmate,

} from "@/features/chess/engine";

export function completePromotion(

    piece: PromotionPiece

) {

    const promotion =

        usePromotionStore.getState();

    const boardStore =

        useBoardStore.getState();

    const board =

        boardStore.board.map(

            (r) => r.split("")

        );

    board[

        promotion.row

    ][

        promotion.col

    ] = promotion.white

        ? piece.toUpperCase()

        : piece;

    const updatedBoard =

        board.map(

            (r) => r.join("")

        );

    boardStore.setBoard(

        updatedBoard

    );

    if (

        isInCheck(

            updatedBoard,

            !promotion.white

        )

    ) {

        console.warn(

            "CHECK"

        );

    }

    if (

        isCheckmate(

            updatedBoard,

            !promotion.white

        )

    ) {

        console.warn(

            "CHECKMATE"

        );

    }

    promotion.hide();

    boardStore.clearSelection();

    boardStore.nextTurn();

}