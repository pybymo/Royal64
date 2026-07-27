import { describe, it, expect } from "vitest";

import {
    simulateMove,
} from "@/features/chess/engine";


describe("En Passant", () => {

    it("must capture en passant correctly", () => {

        const board = [
            "........",
            "........",
            "........",
            "...pP...",
            "........",
            "........",
            "........",
            "........",
        ];


        const result = simulateMove(
            board,
            3, // white pawn row
            4, // e5
            2, // d6
            3
        );


        expect(result[3][3])
            .toBe(".");


        expect(result[2][3])
            .toBe("P");

    });

});