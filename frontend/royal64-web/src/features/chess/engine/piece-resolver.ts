export type PieceType =
    | "pawn"
    | "rook"
    | "knight"
    | "bishop"
    | "queen"
    | "king"
    | null;

export function resolvePiece(

    piece: string

): PieceType {

    switch (

        piece.toLowerCase()

    ) {

        case "p":

            return "pawn";

        case "r":

            return "rook";

        case "n":

            return "knight";

        case "b":

            return "bishop";

        case "q":

            return "queen";

        case "k":

            return "king";

        default:

            return null;

    }

}