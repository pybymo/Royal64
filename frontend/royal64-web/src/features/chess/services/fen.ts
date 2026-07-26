export function boardToFen(

    board: string[],

    whiteToMove: boolean

): string {

    const placement = board

        .map((row) => {

            let out = "";

            let empty = 0;

            for (const cell of row) {

                if (cell === ".") {

                    empty++;

                }

                else {

                    if (empty) {

                        out += empty;

                        empty = 0;

                    }

                    out += cell;

                }

            }

            if (empty)

                out += empty;

            return out;

        })

        .join("/");

    return `${placement} ${whiteToMove ? "w" : "b"}`;

}