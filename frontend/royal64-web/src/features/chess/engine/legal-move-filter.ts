import type { Square } from "@/features/chess/services/legal-moves";

import { simulateMove } from "./simulate-move";
import { isInCheck } from "./is-in-check";

function isWhite(piece: string) {

    return piece === piece.toUpperCase();

}

export function filterLegalMoves(
    board: string[],
    row: number,
    col: number,
    moves: Square[]
): Square[] {

    const piece = board[row][col];

    const white = isWhite(piece);

    return moves.filter((move) => {

        const simulated = simulateMove(
            board,
            row,
            col,
            move.row,
            move.col
        );

        return !isInCheck(
            simulated,
            white
        );

    });

}