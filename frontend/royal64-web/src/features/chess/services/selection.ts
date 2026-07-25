import { useBoardStore } from "@/features/chess";

export function selectSquare(

    row: number,

    col: number

) {

    useBoardStore

        .getState()

        .select(row, col);

}

export function clearSelection() {

    useBoardStore

        .getState()

        .clearSelection();

}