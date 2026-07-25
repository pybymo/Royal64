import {
    dispatchMoves,
    filterLegalMoves,
} from "@/features/chess/engine";

export interface Square {

    row: number;

    col: number;

}

export function getLegalMoves(
    board: string[],
    row: number,
    col: number
): Square[] {

    const moves = dispatchMoves(
        board,
        row,
        col
    );

    return filterLegalMoves(
        board,
        row,
        col,
        moves
    );

}