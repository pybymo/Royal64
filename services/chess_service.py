import chess


class ChessService:

    @staticmethod
    def board(

        fen: str,

    ):

        return chess.Board(fen)

    @staticmethod
    def initial_fen():

        return chess.Board().fen()

    @staticmethod
    def move(

        fen: str,

        uci: str,

    ):

        board = chess.Board(fen)

        move = chess.Move.from_uci(uci)

        if move not in board.legal_moves:

            raise ValueError("Illegal move")

        san = board.san(move)

        board.push(move)

        return {

            "fen": board.fen(),

            "san": san,

            "uci": uci,

            "check": board.is_check(),

            "checkmate": board.is_checkmate(),

            "stalemate": board.is_stalemate(),

            "draw": board.is_insufficient_material(),

            "game_over": board.is_game_over(),

            "result": board.result(),

        }

    @staticmethod
    def legal(

        fen: str,

    ):

        board = chess.Board(fen)

        return [

            m.uci()

            for m in board.legal_moves

        ]