import {

    dispatchMoves,

} from "./move-dispatcher";

import type {

    Square,

} from "@/features/chess/services/legal-moves";

export function buildAttackMap(

    board: string[]

): Square[] {

    const attacks: Square[] = [];

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

            )

                continue;

            attacks.push(

                ...dispatchMoves(

                    board,

                    row,

                    col

                )

            );

        }

    }

    return attacks;

}