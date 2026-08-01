/**
 * Tiny, dependency-free FEN helpers — just enough to detect a pawn
 * promotion client-side so we can show a piece picker before sending
 * the move. Not a chess engine; the server is still the only
 * authority on legality.
 */

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function pieceAt(fen: string, square: string): string | null {

    const board = fen.split(" ")[0];
    const ranks = board.split("/"); // ranks[0] = rank 8, ranks[7] = rank 1

    const file = FILES.indexOf(square[0]);
    const rank = Number(square[1]);

    if (file === -1 || rank < 1 || rank > 8) {
        return null;
    }

    const row = ranks[8 - rank];
    let col = 0;

    for (const ch of row) {

        if (/\d/.test(ch)) {
            col += Number(ch);
            continue;
        }

        if (col === file) {
            return ch;
        }

        col += 1;
    }

    return null;
}

export function isPromotionMove(fen: string, from: string, to: string): boolean {

    const piece = pieceAt(fen, from);

    if (!piece) {
        return false;
    }

    const isPawn = piece === "P" || piece === "p";
    const targetRank = to[1];

    return isPawn && (targetRank === "8" || targetRank === "1");
}
