export type PieceType =

    | "pawn"

    | "rook"

    | "knight"

    | "bishop"

    | "queen"

    | "king"

    | null;

const pieceMap: Record<

    string,

    Exclude<

        PieceType,

        null

    >

> = {

    p: "pawn",

    r: "rook",

    n: "knight",

    b: "bishop",

    q: "queen",

    k: "king",

};

export function resolvePiece(

    piece: string

): PieceType {

    return (

        pieceMap[

            piece.toLowerCase()

        ] ?? null

    );

}