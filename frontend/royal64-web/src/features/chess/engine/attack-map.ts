import type {
    Square,
} from "@/features/chess/services/legal-moves";

import {
    pawnAttacks,
} from "@/features/chess/rules";

import {
    dispatchMoves,
} from "./move-dispatcher";


function kingAttacks(
    row: number,
    col: number
): Square[] {

    const attacks: Square[] = [];

    for (const [dr, dc] of [
        [-1,-1],
        [-1,0],
        [-1,1],
        [0,-1],
        [0,1],
        [1,-1],
        [1,0],
        [1,1],
    ]) {

        const r = row + dr;
        const c = col + dc;

        if (
            r >=0 &&
            r <8 &&
            c >=0 &&
            c <8
        ) {

            attacks.push({
                row:r,
                col:c,
            });

        }
    }

    return attacks;
}


export function buildAttackMap(
    board:string[],
    attackerWhite:boolean
):Square[] {


    const attacks:Square[]=[];


    for(let row=0; row<8; row++){

        for(let col=0; col<8; col++){


            const piece =
                board[row][col];


            if(piece === ".")
                continue;



            const white =
                piece === piece.toUpperCase();



            if(
                white !== attackerWhite
            )
                continue;



            const type =
                piece.toLowerCase();



            if(type==="p"){

                attacks.push(
                    ...pawnAttacks(
                        board,
                        row,
                        col
                    )
                );

                continue;

            }



            if(type==="k"){

                attacks.push(
                    ...kingAttacks(
                        row,
                        col
                    )
                );

                continue;

            }



            attacks.push(
                ...dispatchMoves(
                    board,
                    row,
                    col
                )
            );

        }

    }


    return attacks;

}