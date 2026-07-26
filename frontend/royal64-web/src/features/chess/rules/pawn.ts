import type {
    Square,
} from "@/features/chess/services/legal-moves";

import {
    enPassantMoves,
} from "./en-passant";

export function pawnMoves(

    board: string[],

    row: number,

    col: number

): Square[] {

    const moves: Square[] = [];

    const piece = board[row][col];

    const white =
        piece === piece.toUpperCase();

    const direction =
        white ? -1 : 1;

    const startRow =
        white ? 6 : 1;

    const oneStep =
        row + direction;

    if (

        oneStep >= 0 &&
        oneStep < 8 &&
        board[oneStep][col] === "."

    ) {

        moves.push({

            row: oneStep,

            col,

        });

        const twoStep =
            row + direction * 2;

        if (

            row === startRow &&
            board[twoStep][col] === "."

        ) {

            moves.push({

                row: twoStep,

                col,

            });

        }

    }

    const attackOffsets = [

        -1,
        1,

    ];

    attackOffsets.forEach(

        (offset) => {

            const attackRow =
                row + direction;

            const attackCol =
                col + offset;

            if (

                attackRow < 0 ||
                attackRow > 7 ||
                attackCol < 0 ||
                attackCol > 7

            ) {

                return;

            }

            const target =
                board[attackRow][attackCol];

            if (

                target === "."

            ) {

                return;

            }

            const enemy =

                white

                    ? target === target.toLowerCase()

                    : target === target.toUpperCase();

            if (

                enemy

            ) {

                moves.push({

                    row: attackRow,

                    col: attackCol,

                });

            }

        }

    );

    moves.push(

        ...enPassantMoves(

            board,

            row,

            col

        )

    );

    return moves;

}