import { useBoardStore } from "@/features/chess";

export function movePiece(

    fromRow: number,

    fromCol: number,

    toRow: number,

    toCol: number

) {

    const state =

        useBoardStore.getState();

    const board =

        [...state.board];

    const rows =

        board.map((r) =>

            r.split("")

        );

    rows[toRow][toCol] =

        rows[fromRow][fromCol];

    rows[fromRow][fromCol] = ".";

    state.setBoard(

        rows.map((r) =>

            r.join("")

        )

    );

    state.clearSelection();

    state.nextTurn();

}