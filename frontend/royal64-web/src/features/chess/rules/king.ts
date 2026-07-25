import type { Square } from "@/features/chess/services/legal-moves";

function isWhite(piece: string) {

    return piece === piece.toUpperCase();

}

export function kingMoves(
    board: string[],
    row: number,
    col: number
): Square[] {

    const piece = board[row][col];

    if (piece.toLowerCase() !== "k") {

        return [];

    }

    const white = isWhite(piece);

    const moves: Square[] = [];

    const offsets = [

        [-1, -1],
        [-1, 0],
        [-1, 1],

        [0, -1],
        [0, 1],

        [1, -1],
        [1, 0],
        [1, 1],

    ];

    offsets.forEach(([dr, dc]) => {

        const r = row + dr;
        const c = col + dc;

        if (

            r < 0 ||
            r > 7 ||
            c < 0 ||
            c > 7

        ) {

            return;

        }

        const target = board[r][c];

        if (

            target === "." ||
            isWhite(target) !== white

        ) {

            moves.push({

                row: r,

                col: c,

            });

        }

    });

    return moves;

}