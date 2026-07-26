export interface PositionHistory {

    positions: string[];

    halfMoveClock: number;

    fullMoveNumber: number;

}

export const initialHistory: PositionHistory = {

    positions: [],

    halfMoveClock: 0,

    fullMoveNumber: 1,

};