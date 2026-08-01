import platform
import shutil
from pathlib import Path

import chess
import chess.engine

from core.config import settings


def _resolve_engine_path() -> str:
    """
    ENGINE_PATH was previously hardcoded to a Windows-only
    `stockfish/stockfish.exe`, which doesn't exist on a Linux server —
    every anti-cheat analysis call would fail at deploy time. Resolve
    it properly instead:

      1. explicit override via settings.STOCKFISH_PATH, if set
      2. a binary already sitting in ./stockfish/ (any of the common
         names, OS-appropriate)
      3. whatever `stockfish` resolves to on PATH
    """

    if settings.STOCKFISH_PATH:
        return settings.STOCKFISH_PATH

    is_windows = platform.system() == "Windows"
    candidates = (
        ["stockfish.exe", "stockfish"] if is_windows else ["stockfish"]
    )

    local_dir = Path("stockfish")

    for name in candidates:
        candidate = local_dir / name
        if candidate.exists():
            return str(candidate)

    on_path = shutil.which("stockfish")

    if on_path:
        return on_path

    raise FileNotFoundError(
        "Stockfish binary not found. Set STOCKFISH_PATH in .env, place a "
        "binary in ./stockfish/, or install it so it's on PATH."
    )


class EngineService:

    def __init__(self):

        self.engine = chess.engine.SimpleEngine.popen_uci(
            _resolve_engine_path()
        )

    def close(self):

        if self.engine is not None:
            self.engine.quit()

    def evaluate(
        self,
        fen: str,
        depth: int = 18,
    ):

        board = chess.Board(fen)

        return self.engine.analyse(
            board,
            chess.engine.Limit(
                depth=depth,
            ),
        )

    def evaluation(
        self,
        fen: str,
        depth: int = 18,
    ):

        info = self.evaluate(
            fen,
            depth,
        )

        score = info["score"].white()

        if score.is_mate():

            return {
                "type": "mate",
                "value": score.mate(),
            }

        return {
            "type": "cp",
            "value": score.score(),
        }

    def best_move(
        self,
        fen: str,
        depth: int = 18,
    ):

        board = chess.Board(fen)

        result = self.engine.play(
            board,
            chess.engine.Limit(
                depth=depth,
            ),
        )

        return result.move.uci()

    def analyse(
        self,
        fen: str,
        depth: int = 18,
    ):

        board = chess.Board(fen)

        info = self.engine.analyse(
            board,
            chess.engine.Limit(
                depth=depth,
            ),
        )

        best_move = self.engine.play(
            board,
            chess.engine.Limit(
                depth=depth,
            ),
        ).move

        score = info["score"].white()

        return {
            "best_move": best_move.uci(),
            "score_cp": (
                None
                if score.is_mate()
                else score.score()
            ),
            "mate": (
                score.mate()
                if score.is_mate()
                else None
            ),
            "depth": depth,
        }

    def is_legal_move(
        self,
        fen: str,
        move: str,
    ):

        board = chess.Board(fen)

        chess_move = chess.Move.from_uci(move)

        return chess_move in board.legal_moves

    def make_move(
        self,
        fen: str,
        move: str,
    ):

        board = chess.Board(fen)

        chess_move = chess.Move.from_uci(move)

        if chess_move not in board.legal_moves:
            raise ValueError("Illegal move")

        san = board.san(chess_move)

        board.push(chess_move)

        return {
            "fen": board.fen(),
            "san": san,
            "uci": move,
            "turn": (
                "white"
                if board.turn == chess.WHITE
                else "black"
            ),
            "check": board.is_check(),
            "checkmate": board.is_checkmate(),
            "stalemate": board.is_stalemate(),
            "insufficient_material": board.is_insufficient_material(),
            "threefold_repetition": board.can_claim_threefold_repetition(),
            "fifty_move_rule": board.can_claim_fifty_moves(),
            "game_over": board.is_game_over(),
            "result": board.result(),
        }
