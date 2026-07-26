export function simulateMove(

    board: string[],

    fromRow: number,

    fromCol: number,

    toRow: number,

    toCol: number

): string[] {

    const clone = board.map(

        (row) => row.split("")

    );

    const piece =

        clone[fromRow][fromCol];

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
     * NORMAL MOVE
     */

    clone[toRow][toCol] = piece;

    clone[fromRow][fromCol] = ".";

    /*
     * CASTLING
     */

    if (

        piece.toLowerCase() === "k"

    ) {

        if (

            fromCol === 4 &&
            toCol === 6

        ) {

            clone[fromRow][5] =

                clone[fromRow][7];

            clone[fromRow][7] = ".";

        }

        if (

            fromCol === 4 &&
            toCol === 2

        ) {

            clone[fromRow][3] =

                clone[fromRow][0];

            clone[fromRow][0] = ".";

        }

    }

    return clone.map(

        (row) => row.join("")

    );

}