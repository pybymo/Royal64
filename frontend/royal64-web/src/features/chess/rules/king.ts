import type {

    Square,

} from "@/features/chess/services/legal-moves";

import {

    castlingMoves,

} from "./castling";

export function kingMoves(

    board: string[],

    row: number,

    col: number

): Square[] {

    const moves: Square[] = [];

    for (

        let dr = -1;

        dr <= 1;

        dr++

    ) {

        for (

            let dc = -1;

            dc <= 1;

            dc++

        ) {

            if (

                dr === 0 &&
                dc === 0

            )

                continue;

            const r = row + dr;
            const c = col + dc;

            if (

                r >= 0 &&
                r < 8 &&
                c >= 0 &&
                c < 8

            ) {

                moves.push({

                    row: r,

                    col: c,

                });

            }

        }

    }

    moves.push(

        ...castlingMoves(

            board,

            row,

            col

        )

    );

    return moves;

}