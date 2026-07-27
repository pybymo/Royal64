import { dispatchMoves } from "./move-dispatcher";
import { filterLegalMoves } from "./legal-move-filter";
import { isInCheck } from "./is-in-check";

function isWhite(piece: string) {
    return piece === piece.toUpperCase();
}


export function isCheckmate(
    board: string[],
    white: boolean
): boolean {


    // اگر شاه کیش نیست، مات نیست
    if (
        !isInCheck(
            board,
            white
        )
    ) {
        return false;
    }


    for (
        let row = 0;
        row < 8;
        row++
    ) {

        for (
            let col = 0;
            col < 8;
            col++
        ) {


            const piece =
                board[row][col];


            if (
                piece === "."
            )
                continue;


            if (
                isWhite(piece) !== white
            )
                continue;



            const pseudoMoves =
                dispatchMoves(
                    board,
                    row,
                    col
                );


            const legalMoves =
                filterLegalMoves(
                    board,
                    row,
                    col,
                    pseudoMoves
                );


            if (
                legalMoves.length > 0
            ) {

                return false;

            }

        }

    }


    return true;

}