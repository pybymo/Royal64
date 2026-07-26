import type {
    Square,
} from "@/features/chess/services/legal-moves";

import {
    pawnAttacks,
    knightMoves,
    bishopMoves,
    rookMoves,
    queenMoves,
} from "@/features/chess/rules";


function kingAttacks(
    row: number,
    col: number
): Square[] {

    const attacks: Square[] = [];

    for (const [dr, dc] of [
        [-1,-1],
        [-1,0],
        [-1,1],
        [0,-1],
        [0,1],
        [1,-1],
        [1,0],
        [1,1],
    ]) {

        const r = row + dr;
        const c = col + dc;

        if (
            r >= 0 &&
            r < 8 &&
            c >= 0 &&
            c < 8
        ) {

            attacks.push({
                row:r,
                col:c,
            });

        }
    }

    return attacks;
}


export function attackMoves(
    board:string[],
    row:number,
    col:number
):Square[] {

    const piece = board[row][col];

    switch(piece.toLowerCase()) {

        case "p":
            return pawnAttacks(board,row,col);

        case "n":
            return knightMoves(board,row,col);

        case "b":
            return bishopMoves(board,row,col);

        case "r":
            return rookMoves(board,row,col);

        case "q":
            return queenMoves(board,row,col);

        case "k":
            return kingAttacks(row,col);

        default:
            return [];

    }

}