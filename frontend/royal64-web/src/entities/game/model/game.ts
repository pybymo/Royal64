export type GameResult =
    | "white"
    | "black"
    | "draw"
    | "ongoing";

export interface Game {

    id: number;

    matchId: number;

    currentFen: string;

    pgn: string;

    result: GameResult;

    moveCount: number;

    whiteTimeMs: number;

    blackTimeMs: number;

    whiteOfferedDraw: boolean;

    blackOfferedDraw: boolean;

    whiteResigned: boolean;

    blackResigned: boolean;

    createdAt: string;

    updatedAt: string;

    finishedAt?: string;

}