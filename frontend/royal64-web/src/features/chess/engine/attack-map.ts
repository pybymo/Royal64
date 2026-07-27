import type {
    Square,
} from "@/features/chess/services/legal-moves";

import {
    pawnAttacks,
} from "@/features/chess/rules";

import {
    attackMoves,
} from "./attack-dispatcher";


function kingAttacks(
    row: number,
    col: number
): Square[] {

    const attacks: Square[] = [];

    const directions = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
    ];


    for (const [dr, dc] of directions) {

        const r = row + dr;
        const c = col + dc;


        if (
            r >= 0 &&
            r < 8 &&
            c >= 0 &&
            c < 8
        ) {

            attacks.push({
                row: r,
                col: c,
            });

        }

    }


    return attacks;

}



export function buildAttackMap(
    board: string[],
    attackerWhite?: boolean
): Square[] {


    const attacks: Square[] = [];


    for (
        let row = 0;
        row < 8;
        row++
    ) {

        for (
            let col = 0;
            col < 8;
            col++
        ) {


            const piece =
                board[row][col];


            if (
                piece === "."
            ) {

                continue;

            }



            const white =
                piece === piece.toUpperCase();



            /*
             * اگر رنگ مشخص شده،
             * فقط همان طرف را بررسی کن
             */

            if (
                attackerWhite !== undefined &&
                white !== attackerWhite
            ) {

                continue;

            }



            const type =
                piece.toLowerCase();



            switch(type) {


                case "p":

                    attacks.push(
                        ...pawnAttacks(
                            board,
                            row,
                            col
                        )
                    );

                    break;



                case "k":

                    attacks.push(
                        ...kingAttacks(
                            row,
                            col
                        )
                    );

                    break;



                default:

                    attacks.push(
                        ...attackMoves(
                            board,
                            row,
                            col
                        )
                    );

            }

        }

    }


    return attacks;

}