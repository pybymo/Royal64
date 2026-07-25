import {

    resolvePiece,

} from "./piece-resolver";

import {

    pawnMoves,

    rookMoves,

    knightMoves,

    bishopMoves,

    queenMoves,

    kingMoves,

} from "@/features/chess/rules";

export function dispatchMoves(

    board: string[],

    row: number,

    col: number

) {

    const piece =

        board[row][col];

    switch (

        resolvePiece(piece)

    ) {

        case "pawn":

            return pawnMoves(

                board,

                row,

                col

            );

        case "knight":

            return knightMoves(

                board,

                row,

                col

            );

        case "rook":

            return rookMoves(
                board,
                row,
                col
            );

        case "bishop":

            return bishopMoves(
                board,
                row,
                col
            );

        case "queen":

            return queenMoves(
                board,
                row,
                col
            );

        case "king":

            return kingMoves(
                board,
                row,
                col
            );

        default:

            return [];

    }

}