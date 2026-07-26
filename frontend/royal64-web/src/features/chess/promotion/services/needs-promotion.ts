export function needsPromotion(

    piece: string,

    row: number

): boolean {

    if (

        piece === "P" &&

        row === 0

    ) {

        return true;

    }

    if (

        piece === "p" &&

        row === 7

    ) {

        return true;

    }

    return false;

}