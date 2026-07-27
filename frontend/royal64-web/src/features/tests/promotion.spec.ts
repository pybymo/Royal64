import { describe, it, expect } from "vitest";

import {
    simulateMove,
} from "@/features/chess/engine";


describe("Promotion", () => {

    it("must promote pawn to queen", () => {

        const board = [
            "........",
            "....P...",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
        ];


        const result = simulateMove(
            board,
            1,
            4,
            0,
            4
        );


        expect(result[0][4])
            .toBe("Q");

    });

});