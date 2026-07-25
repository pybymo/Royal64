import { ChessPiece } from "./ChessPiece";

import { selectSquare } from "@/features/chess/services";

import { useBoard } from "@/features/chess";

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

    const {

        selected,

    } = useBoard();

    const active =

        selected?.row === row &&

        selected?.col === col;

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

                border: active
                    ? "3px solid #ff9800"
                    : "1px solid #999",

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