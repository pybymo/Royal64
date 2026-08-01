# Anti-cheat — design notes

## What it does

After a game finishes, `services/anticheat/service.py` analyzes one
player's moves in that game:

- **ACPL** (average centipawn loss) — for each of their moves, compares
  the best achievable evaluation before the move to the evaluation
  after their actual move, via Stockfish at `ANTICHEAT_ENGINE_DEPTH`.
- **Move timing** — coefficient of variation of their per-move time.
  Real humans vary; suspiciously uniform timing is a signal.
- Both are compared against the player's own rolling `Fingerprint`
  baseline (not a fixed one — it updates after every analyzed game, so
  it drifts with real skill changes over time rather than staying
  frozen at calibration).

## Deliberately advisory, not automatic

This never bans, forfeits, or withholds a payout by itself. It writes
an `AntiCheatLog` row and nudges `User.trust_score` by a small amount.
A flagged game is a prompt for a human to look at the game (admin
panel — not built in this pass) — not an automatic verdict. Reasons:

- ACPL at a practical depth is a *statistical* signal, not proof. A
  strong player having a great day and someone using an engine can
  produce overlapping numbers.
- Automatically slashing a payout on a false positive is a real-money
  mistake with no easy undo, versus a flagged-for-review queue which
  costs a little staff time.

## What's NOT done here (still open)

- **No trigger wiring**: nothing currently calls `analyze_game()` when
  a game actually finishes — that hook doesn't exist yet because the
  live game loop itself (`app/websocket.py`) is still a bare relay
  stub that doesn't call `MoveService` at all (found while working on
  this). Anti-cheat has nothing to analyze until moves are actually
  being persisted with real timing data.
- **No admin review UI** — `AntiCheatLog` rows exist, nothing surfaces
  them yet beyond a DB query.
- **Not tested against a running Stockfish binary** — this environment
  has no Stockfish binary or network to fetch one, so
  `EngineService`/`AntiCheatService` have been reviewed carefully but
  not run end-to-end. Test on a machine with `stockfish` installed
  before trusting the numbers.
- **ACPL depth/precision tradeoff**: `ANTICHEAT_ENGINE_DEPTH` (default
  16) trades accuracy for being affordable to run on every paid game.
  Tune after watching real distributions — the thresholds in
  `core/config.py` are reasoned starting points, not calibrated values.

## Bugs fixed along the way

While wiring this up, two pre-existing bugs in the move/game pipeline
were found and fixed (see `services/move_service.py`,
`database/models/move.py`, `services/engine_service.py`):

- `Move` rows were being created with a `fen=` kwarg that doesn't
  exist on the model (it's `fen_after`), and no `move_time_ms` — this
  would have failed on the very first real move once the game loop
  was wired up.
- `EngineService` pointed at `stockfish/stockfish.exe` unconditionally
  — a Windows-only filename that doesn't exist on a Linux server. Now
  resolves cross-platform with an explicit `STOCKFISH_PATH` override.
