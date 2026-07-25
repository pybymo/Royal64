interface Props {

    piece: string;

}

export function ChessPiece({

    piece,

}: Props) {

    if (piece === ".")

        return null;

    return <>{piece}</>;

}