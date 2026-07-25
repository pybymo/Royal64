import type { Square } from "@/features/chess/services/legal-moves";

function isWhite(piece: string) {

    return piece === piece.toUpperCase();

}

export function rookMoves(
    board: string[],
    row: number,
    col: number
): Square[] {

    const piece = board[row][col];

    if (piece.toLowerCase() !== "r") {

        return [];

    }

    const white = isWhite(piece);

    const moves: Square[] = [];

    const directions = [

        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],

    ];

    directions.forEach(([dr, dc]) => {

        let r = row + dr;
        let c = col + dc;

        while (

            r >= 0 &&
            r < 8 &&
            c >= 0 &&
            c < 8

        ) {

            const target = board[r][c];

            if (target === ".") {

                moves.push({

                    row: r,

                    col: c,

                });

            } else {

                if (

                    isWhite(target) !== white

                ) {

                    moves.push({

                        row: r,

                        col: c,

                    });

                }

                break;

            }

            r += dr;
            c += dc;

        }

    });

    return moves;

}