from uuid import uuid4

from database.models.game import Game

from repositories.game_repository import GameRepository

from services.chess_service import ChessService
from services.move_service import MoveService


class GameService:

    def __init__(self, session):

        self.repo = GameRepository(session)

        self.move_service = MoveService(session)

    async def create_first_game(
        self,
        match,
    ):

        return await self._create_game(
            match,
            game_number=1,
            white_player_id=match.white_player_id,
            black_player_id=match.black_player_id,
        )

    async def create_next_game(
        self,
        match,
    ):
        """
        For Bo3 (or any games_required > 1) matches that aren't decided
        after the previous game. Players swap colors each game, which
        is standard match-play practice and also means the same
        player isn't stuck on the disadvantaged side twice in a row.
        """

        latest = await self.repo.get_latest_for_match(match.id)

        next_number = (latest.game_number + 1) if latest else 1

        swap = next_number % 2 == 0

        return await self._create_game(
            match,
            game_number=next_number,
            white_player_id=match.black_player_id if swap else match.white_player_id,
            black_player_id=match.white_player_id if swap else match.black_player_id,
        )

    async def _create_game(
        self,
        match,
        *,
        game_number,
        white_player_id,
        black_player_id,
    ):

        time_ms = match.time_control_minutes * 60 * 1000

        game = Game(
            id=uuid4(),
            match_id=match.id,
            game_number=game_number,
            white_player_id=white_player_id,
            black_player_id=black_player_id,
            status="WAITING",
            time_control_minutes=match.time_control_minutes,
            white_time_ms=time_ms,
            black_time_ms=time_ms,
            fen=ChessService.initial_fen(),
        )

        game = await self.repo.create(game)

        await self.move_service.first_position(game)

        return game
