from uuid import uuid4

from database.models.move import Move

from repositories.move_repository import MoveRepository

from services.chess_service import ChessService
from services.result_service import ResultService


class MoveService:

    def __init__(self, session):

        self.repo = MoveRepository(session)

    async def first_position(
        self,
        game,
    ):

        move = Move(

            id=uuid4(),

            game_id=game.id,

            move_number=0,

            player_id=None,

            san="START",

            uci="",

            fen_after=ChessService.initial_fen(),

            move_time_ms=0,

        )

        return await self.repo.create(move)

    async def play(

        self,

        game,

        player_id,

        move_number,

        current_fen,

        uci,

        move_time_ms: int = 0,

    ):

        result = ChessService.move(

            current_fen,

            uci,

        )

        move = Move(

            id=uuid4(),

            game_id=game.id,

            move_number=move_number,

            player_id=player_id,

            san=result["san"],

            uci=result["uci"],

            fen_after=result["fen"],

            move_time_ms=move_time_ms,

            is_check=result["check"],

            is_checkmate=result["checkmate"],

        )

        await self.repo.create(move)

        return {

            "move": move,

            "fen": result["fen"],

            "check": result["check"],

            "checkmate": result["checkmate"],

            "stalemate": result["stalemate"],

            "game_over": result["game_over"],

            "winner": ResultService.parse(

                result["result"]

            ),

        }
