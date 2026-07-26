import type {

    Square,

} from "@/features/chess/services/legal-moves";

import {

    useBoardStore,

} from "@/features/chess";

export function enPassantMoves(

    board: string[],

    row: number,

    col: number

): Square[] {

    const moves: Square[] = [];

    const last =

        useBoardStore

            .getState()

            .lastMove;

    if (

        !last

    )

        return moves;

    const piece =

        board[row][col];

    const white =

        piece === piece.toUpperCase();

    if (

        last.piece.toLowerCase() !== "p"

    )

        return moves;

    if (

        Math.abs(

            last.fromRow -

            last.toRow

        ) !== 2

    )

        return moves;

    if (

        last.toRow !== row

    )

        return moves;

    if (

        Math.abs(

            last.toCol -

            col

        ) !== 1

    )

        return moves;

    moves.push({

        row:

            white

                ? row - 1

                : row + 1,

        col:

            last.toCol,

    });

    return moves;

}