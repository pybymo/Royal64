import {
    dispatchMoves,
} from "@/features/chess/engine";

export interface Square {

    row: number;

    col: number;

}

export function legalMoves(

    board: string[],

    row: number,

    col: number

): Square[] {

    return dispatchMoves(

        board,

        row,

        col

    );

}