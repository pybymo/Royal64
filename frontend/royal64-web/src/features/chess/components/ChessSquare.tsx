import { ChessPiece } from "./ChessPiece";

import { selectSquare } from "@/features/chess/services";

interface Props {

    row: number;

    col: number;

    piece: string;

    dark: boolean;

}

export function ChessSquare({

    row,

    col,

    piece,

    dark,

}: Props) {

    return (

        <div

            onClick={() =>

                selectSquare(

                    row,

                    col

                )

            }

            style={{

                width: 64,

                height: 64,

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                cursor: "pointer",

                background:

                    dark

                        ? "#769656"

                        : "#eeeed2",

                fontSize: 32,

            }}

        >

            <ChessPiece

                piece={piece}

            />

        </div>

    );

}