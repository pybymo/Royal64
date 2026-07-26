import type {
    Square,
} from "@/features/chess/services/legal-moves";

import {
    useBoardStore,
} from "@/features/chess";


import {
    buildAttackMap,
} from "@/features/chess/engine";


function isAttacked(
    attacks: Square[],
    row: number,
    col: number
): boolean {

    return attacks.some(
        (square) =>
            square.row === row &&
            square.col === col
    );

}



export function castlingMoves(

    board: string[],

    row: number,

    col: number

): Square[] {


    const moves: Square[] = [];


    const piece =
        board[row][col];


    if (
        piece.toLowerCase() !== "k"
    ) {

        return moves;

    }



    const state =
        useBoardStore.getState();



    const white =
        piece === piece.toUpperCase();



    /*
        برای سفید:
        باید حملات سیاه را چک کنیم

        برای سیاه:
        باید حملات سفید را چک کنیم
    */

    const enemyAttacks =
        buildAttackMap(
            board,
            !white
        );



    // پادشاه الان در کیش است
    if (
        isAttacked(
            enemyAttacks,
            row,
            col
        )
    ) {

        return moves;

    }



    /*
        WHITE KING SIDE
        e1 -> g1
    */

    if (white) {


        if (

            !state.whiteKingMoved &&

            !state.whiteRightRookMoved &&

            board[7][7] === "R" &&

            board[7][5] === "." &&

            board[7][6] === "." &&


            !isAttacked(
                enemyAttacks,
                7,
                5
            ) &&

            !isAttacked(
                enemyAttacks,
                7,
                6
            )

        ) {

            moves.push({

                row: 7,

                col: 6,

            });

        }



        /*
            WHITE QUEEN SIDE
            e1 -> c1
        */

        if (

            !state.whiteKingMoved &&

            !state.whiteLeftRookMoved &&

            board[7][0] === "R" &&

            board[7][1] === "." &&
            board[7][2] === "." &&
            board[7][3] === "." &&


            !isAttacked(
                enemyAttacks,
                7,
                3
            ) &&

            !isAttacked(
                enemyAttacks,
                7,
                2
            )

        ) {

            moves.push({

                row: 7,

                col: 2,

            });

        }



    } else {



        /*
            BLACK KING SIDE
            e8 -> g8
        */


        if (

            !state.blackKingMoved &&

            !state.blackRightRookMoved &&

            board[0][7] === "r" &&

            board[0][5] === "." &&

            board[0][6] === "." &&


            !isAttacked(
                enemyAttacks,
                0,
                5
            ) &&

            !isAttacked(
                enemyAttacks,
                0,
                6
            )

        ) {

            moves.push({

                row: 0,

                col: 6,

            });

        }



        /*
            BLACK QUEEN SIDE
            e8 -> c8
        */

        if (

            !state.blackKingMoved &&

            !state.blackLeftRookMoved &&

            board[0][0] === "r" &&

            board[0][1] === "." &&
            board[0][2] === "." &&
            board[0][3] === "." &&


            !isAttacked(
                enemyAttacks,
                0,
                3
            ) &&

            !isAttacked(
                enemyAttacks,
                0,
                2
            )

        ) {

            moves.push({

                row: 0,

                col: 2,

            });

        }

    }



    return moves;

}