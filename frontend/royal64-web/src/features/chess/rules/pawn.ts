import type { Square } from "@/features/chess/services/legal-moves";

function isWhite(piece: string) {

    return piece === piece.toUpperCase();

}

export function pawnMoves(
    board: string[],
    row: number,
    col: number
): Square[] {

    const piece = board[row][col];

    if (piece.toLowerCase() !== "p") {

        return [];

    }

    const moves: Square[] = [];

    const white = isWhite(piece);

    const direction = white ? -1 : 1;

    const startRow = white ? 6 : 1;

    const nextRow = row + direction;

    if (
        nextRow >= 0 &&
        nextRow < 8 &&
        board[nextRow][col] === "."
    ) {

        moves.push({
            row: nextRow,
            col,
        });

        const twoRows = row + direction * 2;

        if (
            row === startRow &&
            board[twoRows][col] === "."
        ) {

            moves.push({
                row: twoRows,
                col,
            });

        }

    }

    const captures = [-1, 1];

    captures.forEach((offset) => {

        const r = row + direction;
        const c = col + offset;

        if (
            r < 0 ||
            r > 7 ||
            c < 0 ||
            c > 7
        ) {

            return;

        }

        const target = board[r][c];

        if (target === ".") {

            return;

        }

        if (white !== isWhite(target)) {

            moves.push({
                row: r,
                col: c,
            });

        }

    });

    return moves;

}