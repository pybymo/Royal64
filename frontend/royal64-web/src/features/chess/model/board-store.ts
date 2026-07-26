import { create } from "zustand";

import type { LastMove } from "./last-move";

export interface SelectedSquare {

    row: number;

    col: number;

}

interface BoardStore {

    board: string[];

    selected?: SelectedSquare;

    turn: "white" | "black";

    lastMove?: LastMove;

    whiteKingMoved: boolean;
    blackKingMoved: boolean;

    whiteLeftRookMoved: boolean;
    whiteRightRookMoved: boolean;

    blackLeftRookMoved: boolean;
    blackRightRookMoved: boolean;

    history: string[];

    halfMoveClock: number;

    fullMoveNumber: number;

    addPosition(position: string): void;

    incrementHalfMove(): void;

    resetHalfMove(): void;

    nextFullMove(): void;

    setBoard(board: string[]): void;

    setLastMove(move: LastMove): void;

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

    lastMove: undefined,

    whiteKingMoved: false,
    blackKingMoved: false,

    whiteLeftRookMoved: false,
    whiteRightRookMoved: false,

    blackLeftRookMoved: false,
    blackRightRookMoved: false,

    history: [],

    halfMoveClock: 0,

    fullMoveNumber: 1,

    addPosition(position) {

    set((state) => ({

        history: [

            ...state.history,

            position,

        ],

    }));

},

incrementHalfMove() {

    set((state) => ({

        halfMoveClock:

            state.halfMoveClock + 1,

    }));

},

resetHalfMove() {

    set({

        halfMoveClock: 0,

    });

},

nextFullMove() {

    set((state) => ({

        fullMoveNumber:

            state.fullMoveNumber + 1,

    }));

},

    setBoard(board) {

        set({

            board,

        });

    },

    setLastMove(move) {

        set({

            lastMove: move,

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

            lastMove: undefined,

            whiteKingMoved: false,
            blackKingMoved: false,

            whiteLeftRookMoved: false,
            whiteRightRookMoved: false,

            blackLeftRookMoved: false,
            blackRightRookMoved: false,

        });

    },

}));