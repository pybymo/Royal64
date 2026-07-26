export function isThreefoldRepetition(

    history: string[]

): boolean {

    const map =

        new Map<

            string,

            number

        >();

    for (

        const position

        of history

    ) {

        const count =

            map.get(

                position

            ) ?? 0;

        const next =

            count + 1;

        if (

            next >= 3

        ) {

            return true;

        }

        map.set(

            position,

            next

        );

    }

    return false;

}