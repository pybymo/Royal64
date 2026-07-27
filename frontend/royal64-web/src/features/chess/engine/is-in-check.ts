import { buildAttackMap } from "./attack-map";

function isWhite(piece: string) {
    return piece === piece.toUpperCase();
}

export function isInCheck(
    board: string[],
    white: boolean
): boolean {

    let kingRow = -1;
    let kingCol = -1;

    for (let r = 0; r < 8; r++) {

        for (let c = 0; c < 8; c++) {

            const piece = board[r][c];

            if (piece === ".")
                continue;

            if (
                piece.toLowerCase() === "k" &&
                isWhite(piece) === white
            ) {
                kingRow = r;
                kingCol = c;
            }
        }
    }


    if (kingRow === -1)
        return false;


    const attacks =
        buildAttackMap(
            board,
            !white
        );


    return attacks.some(
        square =>
            square.row === kingRow &&
            square.col === kingCol
    );
}