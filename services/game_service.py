from uuid import uuid4

from database.models.game import Game

from repositories.game_repository import GameRepository

from services.move_service import MoveService


class GameService:

    def __init__(self, session):

        self.repo = GameRepository(session)

        self.move_service = MoveService(session)

    async def create_first_game(
        self,
        match,
    ):

        game = Game(

            id=uuid4(),

            match_id=match.id,

            game_number=1,

            white_player_id=match.owner_id,

            black_player_id=match.accepter_id,

            status="WAITING",

        )

        game = await self.repo.create(game)

        await self.move_service.first_position(game)

        return game