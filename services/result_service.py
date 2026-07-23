from core.game_result import GameResult


class ResultService:

    @staticmethod
    def parse(

        result: str,

    ):

        if result == "1-0":

            return GameResult.WHITE

        if result == "0-1":

            return GameResult.BLACK

        if result == "1/2-1/2":

            return GameResult.DRAW

        return GameResult.NONE