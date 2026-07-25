export function simulateMove(
    board: string[],
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
): string[] {

    const clone = board.map(
        (row) => row.split("")
    );

    clone[toRow][toCol] =
        clone[fromRow][fromCol];

    clone[fromRow][fromCol] = ".";

    return clone.map(
        (row) => row.join("")
    );

}