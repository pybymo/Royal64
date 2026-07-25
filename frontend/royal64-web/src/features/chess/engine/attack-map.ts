import type { Square } from "@/features/chess/services/legal-moves";

import {

    pawnAttacks,

    knightMoves,

    bishopMoves,

    rookMoves,

    queenMoves,

    kingMoves,

} from "@/features/chess/rules";

export function buildAttackMap(
    board: string[]
): Square[] {

    const attacks: Square[] = [];

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece = board[row][col];

            if (piece === ".") {

                continue;

            }

            switch (piece.toLowerCase()) {

                case "p":

                    attacks.push(
                        ...pawnAttacks(board, row, col)
                    );

                    break;

                case "n":

                    attacks.push(
                        ...knightMoves(board, row, col)
                    );

                    break;

                case "b":

                    attacks.push(
                        ...bishopMoves(board, row, col)
                    );

                    break;

                case "r":

                    attacks.push(
                        ...rookMoves(board, row, col)
                    );

                    break;

                case "q":

                    attacks.push(
                        ...queenMoves(board, row, col)
                    );

                    break;

                case "k":

                    attacks.push(
                        ...kingMoves(board, row, col)
                    );

                    break;

            }

        }

    }

    return attacks;

}