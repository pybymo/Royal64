from enum import Enum


class MatchStatus(str, Enum):

    ACTIVE = "ACTIVE"

    FINISHED = "FINISHED"

    CANCELLED = "CANCELLED"


class GameStatus(str, Enum):

    WAITING = "WAITING"

    PLAYING = "PLAYING"

    FINISHED = "FINISHED"