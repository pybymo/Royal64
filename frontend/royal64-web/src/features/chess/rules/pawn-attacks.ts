import type { Square } from "@/features/chess/services/legal-moves";

function isWhite(piece: string) {

    return piece === piece.toUpperCase();

}

export function pawnAttacks(
    board: string[],
    row: number,
    col: number
): Square[] {

    const piece = board[row][col];

    if (piece.toLowerCase() !== "p") {

        return [];

    }

    const white = isWhite(piece);

    const direction = white ? -1 : 1;

    const attacks: Square[] = [];

    [-1, 1].forEach((offset) => {

        const r = row + direction;
        const c = col + offset;

        if (
            r >= 0 &&
            r < 8 &&
            c >= 0 &&
            c < 8
        ) {

            attacks.push({
                row: r,
                col: c,
            });

        }

    });

    return attacks;

}