import {

    legalMoves,

} from "@/features/chess/services";

import {

    filterLegalMoves,

} from "./legal-move-filter";

import {

    isInCheck,

} from "./is-in-check";

function isWhite(

    piece: string

) {

    return piece === piece.toUpperCase();

}

export function isStalemate(

    board: string[],

    whiteToMove: boolean

): boolean {

    if (

        isInCheck(

            board,

            whiteToMove

        )

    ) {

        return false;

    }

    for (

        let row = 0;

        row < 8;

        row++

    ) {

        for (

            let col = 0;

            col < 8;

            col++

        ) {

            const piece =

                board[row][col];

            if (

                piece === "."

            ) {

                continue;

            }

            if (

                isWhite(piece) !==

                whiteToMove

            ) {

                continue;

            }

            const moves =

                legalMoves(

                    board,

                    row,

                    col

                );

            const legal =

                filterLegalMoves(

                    board,

                    row,

                    col,

                    moves

                );

            if (

                legal.length > 0

            ) {

                return false;

            }

        }

    }

    return true;

}