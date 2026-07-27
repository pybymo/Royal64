import { describe, it, expect } from "vitest";

import { isInCheck } from "@/features/chess/engine";


describe("Check", () => {

    it("must detect king in check by rook", () => {

        const board = [
            "....r...",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "....K..."
        ];


        expect(
            isInCheck(
                board,
                true
            )
        ).toBe(true);

    });

    it("must detect king not in check", () => {

        const board = [
            "........",
            "........",
            "........",
            "........",
            "....r...",
            "........",
            "........",
            "...K...."
        ];


        expect(
            isInCheck(
                board,
                true
            )
        ).toBe(false);

    });

});