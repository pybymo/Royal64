"""
Post-game anti-cheat analysis: ACPL (average centipawn loss) via
Stockfish, move-timing consistency, and a running per-player
Fingerprint baseline that Trust Score is nudged against.

Deliberately advisory, not automatic: this NEVER bans, forfeits, or
withholds payout on its own. It writes an AntiCheatLog row and nudges
User.trust_score; a human reviews flagged games from the admin panel
(see docs/ANTICHEAT.md for why automatic action was rejected).

Runs as background/offline analysis after a game finishes — Stockfish
evaluation at real depth is too slow to sit in any request path.
"""

import statistics
from uuid import UUID

import chess

from core.config import settings
from database.models.anti_cheat_log import AntiCheatLog
from repositories.anti_cheat_log_repository import AntiCheatLogRepository
from repositories.fingerprint_repository import FingerprintRepository
from repositories.move_repository import MoveRepository
from repositories.user_repository import UserRepository
from services.engine_service import EngineService

MATE_SCORE_CP = 1000  # how a forced mate is valued in centipawn terms


class AntiCheatService:

    def __init__(self, session):
        self.session = session
        self.move_repo = MoveRepository(session)
        self.fp_repo = FingerprintRepository(session)
        self.log_repo = AntiCheatLogRepository(session)
        self.user_repo = UserRepository(session)

    # ------------------------------------------------------------------
    # Entry point
    # ------------------------------------------------------------------

    async def analyze_game(
        self,
        game_id: UUID,
        player_id: UUID,
    ) -> AntiCheatLog | None:

        moves = await self.move_repo.get_by_game(game_id)
        player_moves = [m for m in moves if m.player_id == player_id]

        if not player_moves:
            return None

        acpl, sampled = self._compute_acpl(moves, player_id)
        timing_cv, avg_time = self._compute_timing(player_moves)

        fingerprint = await self.fp_repo.get_or_create(player_id)
        user = await self.user_repo.get_by_id(player_id)

        flagged, reason = self._evaluate(
            acpl=acpl,
            sampled=sampled,
            timing_cv=timing_cv,
            fingerprint=fingerprint,
        )

        trust_before = user.trust_score
        trust_after = self._adjust_trust(trust_before, flagged)

        user.trust_score = trust_after
        await self.user_repo.save(user)

        self._update_fingerprint(fingerprint, acpl, avg_time, sampled)
        await self.fp_repo.save(fingerprint)

        log = AntiCheatLog(
            game_id=game_id,
            player_id=player_id,
            acpl=acpl,
            avg_move_time_ms=avg_time,
            timing_cv=timing_cv,
            flagged=flagged,
            reason=reason,
            trust_score_before=trust_before,
            trust_score_after=trust_after,
        )

        return await self.log_repo.create(log)

    # ------------------------------------------------------------------
    # ACPL
    # ------------------------------------------------------------------

    def _compute_acpl(
        self,
        moves: list,
        player_id: UUID,
    ) -> tuple[float, int]:
        """
        For each of the player's moves: evaluate the position right
        before it (best achievable eval for the mover) and the
        position right after their actual move (same perspective),
        both from the mover's point of view. The gap is that move's
        centipawn loss; ACPL is the average over the game.

        This is a standard approximation, not a tournament-grade
        analysis tool — evaluated at ANTICHEAT_ENGINE_DEPTH, which
        trades some precision for being able to run this on every
        paid game without an unreasonable compute bill. Treat results
        as a signal to route to human review, not as proof on its own.
        """

        engine = EngineService()
        losses: list[int] = []

        try:
            for i, move in enumerate(moves):

                if move.player_id != player_id:
                    continue

                if i == 0:
                    continue  # can't happen (START move has player_id=None) but be safe

                fen_before = moves[i - 1].fen_after
                fen_after = move.fen_after

                mover_color = chess.Board(fen_before).turn

                eval_before = engine.evaluate(
                    fen_before,
                    depth=settings.ANTICHEAT_ENGINE_DEPTH,
                )["score"].pov(mover_color).score(mate_score=MATE_SCORE_CP)

                eval_after = engine.evaluate(
                    fen_after,
                    depth=settings.ANTICHEAT_ENGINE_DEPTH,
                )["score"].pov(mover_color).score(mate_score=MATE_SCORE_CP)

                loss = max(0, eval_before - eval_after)
                losses.append(loss)

        finally:
            engine.close()

        if not losses:
            return 0.0, 0

        return statistics.fmean(losses), len(losses)

    # ------------------------------------------------------------------
    # Move timing
    # ------------------------------------------------------------------

    def _compute_timing(self, player_moves: list) -> tuple[float, float]:

        times = [m.move_time_ms for m in player_moves if m.move_time_ms]

        if len(times) < 2:
            return 0.0, (times[0] if times else 0.0)

        mean = statistics.fmean(times)
        stddev = statistics.pstdev(times)

        cv = (stddev / mean) if mean > 0 else 0.0

        return cv, mean

    # ------------------------------------------------------------------
    # Flagging
    # ------------------------------------------------------------------

    def _evaluate(
        self,
        *,
        acpl: float,
        sampled: int,
        timing_cv: float,
        fingerprint,
    ) -> tuple[bool, str | None]:

        if sampled == 0:
            return False, None

        if acpl < settings.ANTICHEAT_ACPL_HARD_FLAG_THRESHOLD:
            return True, f"ACPL {acpl:.1f} below hard threshold (near-engine play)"

        if timing_cv > 0 and timing_cv < settings.ANTICHEAT_TIMING_CV_FLAG_THRESHOLD:
            return True, f"move timing suspiciously uniform (cv={timing_cv:.3f})"

        if fingerprint.games_analyzed >= settings.ANTICHEAT_MIN_GAMES_FOR_BASELINE:

            if fingerprint.acpl_stddev > 0:

                deviation = (fingerprint.avg_acpl - acpl) / fingerprint.acpl_stddev

                if deviation > settings.ANTICHEAT_ACPL_DEVIATION_SIGMA:
                    return True, (
                        f"ACPL {acpl:.1f} is {deviation:.1f} std devs better than "
                        f"this player's own baseline ({fingerprint.avg_acpl:.1f})"
                    )

        return False, None

    # ------------------------------------------------------------------
    # Trust score / fingerprint updates
    # ------------------------------------------------------------------

    def _adjust_trust(self, current: float, flagged: bool) -> float:

        # Deliberately gentle — this nudges toward human review, it
        # doesn't itself punish. A single flagged game shouldn't tank
        # someone who just played very well.
        delta = -3.0 if flagged else 0.5

        return max(0.0, min(100.0, current + delta))

    def _update_fingerprint(
        self,
        fingerprint,
        acpl: float,
        avg_time: float,
        sampled: int,
    ) -> None:

        if sampled == 0:
            return

        n = fingerprint.games_analyzed

        # Rolling mean/variance update (Welford-ish, simplified) — the
        # baseline shifts with real play over time rather than being
        # frozen at calibration, per the MVP notes on this.
        new_n = n + 1

        new_avg_acpl = (fingerprint.avg_acpl * n + acpl) / new_n
        new_avg_time = (fingerprint.avg_move_time_ms * n + avg_time) / new_n

        # Widen/narrow stddev toward the new sample rather than
        # recomputing from full history (we don't keep per-game
        # history here — AntiCheatLog rows are the audit trail for that).
        acpl_delta = abs(acpl - fingerprint.avg_acpl) if n > 0 else 0.0
        time_delta = abs(avg_time - fingerprint.avg_move_time_ms) if n > 0 else 0.0

        fingerprint.acpl_stddev = (
            (fingerprint.acpl_stddev * n + acpl_delta) / new_n
        )
        fingerprint.move_time_stddev_ms = (
            (fingerprint.move_time_stddev_ms * n + time_delta) / new_n
        )

        fingerprint.avg_acpl = new_avg_acpl
        fingerprint.avg_move_time_ms = new_avg_time
        fingerprint.games_analyzed = new_n
