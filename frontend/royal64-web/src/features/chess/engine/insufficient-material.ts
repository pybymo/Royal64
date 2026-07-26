export function isInsufficientMaterial(

    board: string[]

): boolean {

    const pieces: string[] = [];

    board.forEach(

        (row) =>

            row.split("").forEach(

                (piece) => {

                    if (

                        piece !== "."

                    ) {

                        pieces.push(

                            piece.toLowerCase()

                        );

                    }

                }

            )

    );

    const counts = {

        p: 0,

        r: 0,

        n: 0,

        b: 0,

        q: 0,

        k: 0,

    };

    pieces.forEach(

        (piece) => {

            if (

                piece in counts

            ) {

                counts[

                    piece as keyof typeof counts

                ]++;

            }

        }

    );

    if (

        counts.p ||

        counts.r ||

        counts.q

    ) {

        return false;

    }

    const minors =

        counts.b +

        counts.n;

    if (

        minors === 0

    ) {

        return true;

    }

    if (

        minors === 1

    ) {

        return true;

    }

    return false;

}