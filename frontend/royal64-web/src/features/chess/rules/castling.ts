import type {

    Square,

} from "@/features/chess/services/legal-moves";

import { useBoardStore } from "@/features/chess";

import {

    buildAttackMap,

} from "@/features/chess/engine";

function attacked(

    attacks: Square[],

    row: number,

    col: number

) {

    return attacks.some(

        (s) =>

            s.row === row &&
            s.col === col

    );

}

export function castlingMoves(

    board: string[],

    row: number,

    col: number

): Square[] {

    const moves: Square[] = [];

    const piece = board[row][col];

    if (

        piece.toLowerCase() !== "k"

    )

        return moves;

    const state =

        useBoardStore.getState();

    const white =

        piece === piece.toUpperCase();

    const attacks =

        buildAttackMap(board);

    if (

        attacked(attacks, row, 4)

    )

        return moves;

    if (white) {

        if (

            !state.whiteKingMoved &&

            !state.whiteRightRookMoved &&

            board[row][5] === "." &&

            board[row][6] === "." &&

            board[row][7] === "R" &&

            !attacked(attacks, row, 5) &&

            !attacked(attacks, row, 6)

        ) {

            moves.push({

                row,

                col: 6,

            });

        }

        if (

            !state.whiteKingMoved &&

            !state.whiteLeftRookMoved &&

            board[row][1] === "." &&

            board[row][2] === "." &&

            board[row][3] === "." &&

            board[row][0] === "R" &&

            !attacked(attacks, row, 3) &&

            !attacked(attacks, row, 2)

        ) {

            moves.push({

                row,

                col: 2,

            });

        }

    } else {

        if (

            !state.blackKingMoved &&

            !state.blackRightRookMoved &&

            board[row][5] === "." &&

            board[row][6] === "." &&

            board[row][7] === "r" &&

            !attacked(attacks, row, 5) &&

            !attacked(attacks, row, 6)

        ) {

            moves.push({

                row,

                col: 6,

            });

        }

        if (

            !state.blackKingMoved &&

            !state.blackLeftRookMoved &&

            board[row][1] === "." &&

            board[row][2] === "." &&

            board[row][3] === "." &&

            board[row][0] === "r" &&

            !attacked(attacks, row, 3) &&

            !attacked(attacks, row, 2)

        ) {

            moves.push({

                row,

                col: 2,

            });

        }

    }

    return moves;

}