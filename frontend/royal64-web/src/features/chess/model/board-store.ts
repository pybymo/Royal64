import { create } from "zustand";

export interface SelectedSquare {

    row: number;

    col: number;

}

interface BoardStore {

    board: string[];

    selected?: SelectedSquare;

    turn: "white" | "black";

    whiteKingMoved: boolean;
    blackKingMoved: boolean;

    whiteLeftRookMoved: boolean;
    whiteRightRookMoved: boolean;

    blackLeftRookMoved: boolean;
    blackRightRookMoved: boolean;

    setBoard(board: string[]): void;

    select(row: number, col: number): void;

    clearSelection(): void;

    nextTurn(): void;

    reset(): void;

}

const INITIAL_BOARD = [

    "rnbqkbnr",
    "pppppppp",
    "........",
    "........",
    "........",
    "........",
    "PPPPPPPP",
    "RNBQKBNR",

];

export const useBoardStore = create<BoardStore>((set) => ({

    board: INITIAL_BOARD,

    selected: undefined,

    turn: "white",

    whiteKingMoved: false,
    blackKingMoved: false,

    whiteLeftRookMoved: false,
    whiteRightRookMoved: false,

    blackLeftRookMoved: false,
    blackRightRookMoved: false,

    setBoard(board) {

        set({

            board,

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

    nextTurn() {

        set((state) => ({

            turn:

                state.turn === "white"

                    ? "black"

                    : "white",

        }));

    },

    reset() {

        set({

            board: INITIAL_BOARD,

            selected: undefined,

            turn: "white",

            whiteKingMoved: false,
            blackKingMoved: false,

            whiteLeftRookMoved: false,
            whiteRightRookMoved: false,

            blackLeftRookMoved: false,
            blackRightRookMoved: false,

        });

    },

}));