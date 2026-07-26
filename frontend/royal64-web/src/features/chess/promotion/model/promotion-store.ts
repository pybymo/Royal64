import { create } from "zustand";

export type PromotionPiece =
    "q"
    | "r"
    | "b"
    | "n";

interface PromotionState {

    open: boolean;

    row: number;

    col: number;

    white: boolean;

    show(

        row: number,

        col: number,

        white: boolean

    ): void;

    hide(): void;

}

export const usePromotionStore =

    create<PromotionState>((set) => ({

        open: false,

        row: -1,

        col: -1,

        white: true,

        show(

            row,

            col,

            white

        ) {

            set({

                open: true,

                row,

                col,

                white,

            });

        },

        hide() {

            set({

                open: false,

            });

        },

    }));