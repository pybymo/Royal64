export class BoardService {

    static clone(

        board: string[]

    ): string[] {

        return [

            ...board,

        ];

    }

    static toMatrix(

        board: string[]

    ): string[][] {

        return board.map(

            (row) =>

                row.split("")

        );

    }

    static fromMatrix(

        matrix: string[][]

    ): string[] {

        return matrix.map(

            (row) =>

                row.join("")

        );

    }

}