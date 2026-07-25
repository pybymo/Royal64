import type { Square } from "@/features/chess/services/legal-moves";

export function isLegalMove(

    moves: Square[],

    row: number,

    col: number

) {

    return moves.some(

        (m) =>

            m.row === row &&

            m.col === col

    );

}