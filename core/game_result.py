from enum import Enum


class GameResult(str, Enum):

    WHITE = "WHITE"

    BLACK = "BLACK"

    DRAW = "DRAW"

    NONE = "NONE"