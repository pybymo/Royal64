import { create } from "zustand";

import { initialBoard } from "./initial-position";

interface SelectedSquare {

    row: number;

    col: number;

}

interface BoardStore {

    board: string[];

    selected?: SelectedSquare;

    turn: "white" | "black";

    reset(): void;

    select(row: number, col: number): void;

    clearSelection(): void;

    setBoard(board: string[]): void;

    nextTurn(): void;

}

export const useBoardStore = create<BoardStore>((set) => ({

    board: initialBoard,

    selected: undefined,

    turn: "white",

    reset() {

        set({

            board: initialBoard,

            selected: undefined,

            turn: "white",

        });

    },

    select(row, col) {

        set({

            selected: {

                row,

                col,

            },

        });

    },

    clearSelection() {

        set({

            selected: undefined,

        });

    },

    setBoard(board) {

        set({

            board,

        });

    },

    nextTurn() {

        set((state) => ({

            turn:

                state.turn === "white"

                    ? "black"

                    : "white",

        }));

    },

}));