import type { Square } from "@/features/chess/services/legal-moves";

import {

    bishopMoves,

} from "./bishop";

import {

    rookMoves,

} from "./rook";

export function queenMoves(
    board: string[],
    row: number,
    col: number
): Square[] {

    return [

        ...bishopMoves(
            board,
            row,
            col
        ),

        ...rookMoves(
            board,
            row,
            col
        ),

    ];

}