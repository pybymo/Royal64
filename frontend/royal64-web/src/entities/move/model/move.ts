export interface Move {

    id: number;

    gameId: number;

    moveNumber: number;

    playerId: number;

    san: string;

    uci: string;

    fenAfterMove: string;

    timeSpentMs: number;

    createdAt: string;

}