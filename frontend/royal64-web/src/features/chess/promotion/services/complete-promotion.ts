import { useBoardStore } from "@/features/chess";

import {

    usePromotionStore,

    type PromotionPiece,

} from "@/features/chess/promotion";

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

    boardStore.setBoard(

        board.map(

            (r) => r.join("")

        )

    );

    promotion.hide();

}