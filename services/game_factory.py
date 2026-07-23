from uuid import uuid4

from database.models.game import Game


class GameFactory:

    @staticmethod
    def create_first_game(match):

        return Game(
            id=uuid4(),
            match_id=match.id,
            game_number=1,
            white_player_id=match.owner_id,
            black_player_id=match.accepter_id,
            status="WAITING",
        )