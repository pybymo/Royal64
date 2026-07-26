import type {
    Square,
} from "@/features/chess/services/legal-moves";

import {
    pawnMoves,
    rookMoves,
    bishopMoves,
    knightMoves,
    queenMoves,
    kingMoves,
} from "@/features/chess/rules";

type MoveGenerator = (

    board: string[],

    row: number,

    col: number

) => Square[];

const generators: Record<
    string,
    MoveGenerator
> = {

    p: pawnMoves,
    r: rookMoves,
    n: knightMoves,
    b: bishopMoves,
    q: queenMoves,
    k: kingMoves,

};

export function dispatchMoves(

    board: string[],

    row: number,

    col: number

): Square[] {

    const piece =
        board[row][col];

    if (
        piece === "."
    ) {

        return [];

    }

    const generator =
        generators[
            piece.toLowerCase()
        ];

    if (
        !generator
    ) {

        return [];

    }

    return generator(

        board,

        row,

        col

    );

}