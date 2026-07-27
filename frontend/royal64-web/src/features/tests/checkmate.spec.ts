import { describe, it, expect } from "vitest";

import { isCheckmate } from "@/features/chess/engine";


describe("Checkmate", () => {

    it("must detect simple rook checkmate", () => {

        const board = [
            "....r...",
            "........",
            "........",
            "........",
            "........",
            "........",
            "....K...",
            "........"
        ];


        expect(
            isCheckmate(
                board,
                true
            )
        ).toBe(false);

    });

    it("must detect rook checkmate", () => {

        const board = [
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "....K...",
            "....r..k"
        ];


        expect(
            isCheckmate(
                board,
                true
            )
        ).toBe(true);

    });


});