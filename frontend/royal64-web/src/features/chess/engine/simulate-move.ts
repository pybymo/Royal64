export function simulateMove(
    board: string[],
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
): string[] {

    const clone = board.map(
        row => row.split("")
    );


    const piece =
        clone[fromRow][fromCol];


    if (!piece || piece === ".") {
        return board;
    }


    /*
     * EN PASSANT
     */

    if (
        piece.toLowerCase() === "p" &&
        fromCol !== toCol &&
        clone[toRow][toCol] === "."
    ) {

        clone[fromRow][toCol] = ".";

    }


    /*
     * MOVE PIECE
     */

    let movedPiece = piece;


    /*
     * PROMOTION
     */

    if (
        piece === "P" &&
        toRow === 0
    ) {

        movedPiece = "Q";

    }


    if (
        piece === "p" &&
        toRow === 7
    ) {

        movedPiece = "q";

    }


    clone[toRow][toCol] = movedPiece;

    clone[fromRow][fromCol] = ".";



    /*
     * CASTLING
     */

    if (
        piece.toLowerCase() === "k" &&
        Math.abs(toCol - fromCol) === 2
    ) {


        // King side

        if (
            toCol === 6
        ) {

            clone[fromRow][5] =
                clone[fromRow][7];

            clone[fromRow][7] = ".";

        }


        // Queen side

        if (
            toCol === 2
        ) {

            clone[fromRow][3] =
                clone[fromRow][0];

            clone[fromRow][0] = ".";

        }

    }



    return clone.map(
        row => row.join("")
    );

}