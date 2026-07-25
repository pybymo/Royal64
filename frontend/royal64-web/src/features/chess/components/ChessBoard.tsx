import { useBoard } from "@/features/chess";

import { ChessSquare } from "./ChessSquare";

export function ChessBoard() {

    const { board } = useBoard();

    return (

        <div

            style={{

                display: "grid",

                gridTemplateColumns:

                    "repeat(8,64px)",

            }}

        >

            {board.flatMap(

                (row, r) =>

                    row

                        .split("")

                        .map(

                            (

                                piece,

                                c

                            ) => (

                                <ChessSquare

                                    key={`${r}-${c}`}

                                    row={r}

                                    col={c}

                                    piece={piece}

                                    dark={

                                        (r + c) %

                                            2 ===

                                        1

                                    }

                                />

                            )

                        )

            )}

        </div>

    );

}