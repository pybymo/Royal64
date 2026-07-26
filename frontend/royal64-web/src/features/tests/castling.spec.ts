// TODO: Complete test suite after engine freeze

import { describe, expect, it, beforeEach } from "vitest";

import { legalMoves } from "@/features/chess/services/legal-moves";
import { useBoardStore } from "@/features/chess";
import { castlingMoves } from "@/features/chess/rules";
import {simulateMove} from "@/features/chess/engine";


describe("Castling", () => {


    beforeEach(() => {

        useBoardStore.getState().reset();

    });



    it("must reject castling while king is in check", () => {

        const board = [

            "....r...",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "R...K..R",

        ];


        useBoardStore.getState().setBoard(board);


        const moves = legalMoves(
            board,
            7,
            4
        );


        expect(

            moves.some(

                m =>
                    m.row === 7 &&
                    m.col === 6

            )

        ).toBe(false);


    });



    it("must reject castling through attacked square", () => {


        const board = [

            "........",
            "........",
            "........",
            "........",
            "........",
            ".....r..",
            "........",
            "R...K..R",

        ];


        useBoardStore.getState().setBoard(board);


        const moves = legalMoves(
            board,
            7,
            4
        );


        expect(

            moves.some(

                m =>
                    m.row === 7 &&
                    m.col === 6

            )

        ).toBe(false);


    });



    it("must allow kingside castling", () => {


        const board = [

            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "R...K..R",

        ];


        useBoardStore.getState().setBoard(board);

        console.log(
            castlingMoves(
                board,
                7,
                4
            )
        );


        const moves = legalMoves(
            board,
            7,
            4
        );

        expect(

            moves.some(

                m =>
                    m.row === 7 &&
                    m.col === 6

            )

        ).toBe(true);


    });

    it("must execute kingside castling", () => {

        const board = [
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "R...K..R",
        ];
        
        const result = simulateMove(
            board,
            7,
            4,
            7,
            6
        );


        expect(result[7][6])
            .toBe("K");


        expect(result[7][5])
            .toBe("R");


        expect(result[7][4])
            .toBe(".");


        expect(result[7][7])
            .toBe(".");

    });

});