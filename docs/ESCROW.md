# Royal64 Escrow — design & integration notes

## Status

**Draft, untested on-chain** until you complete the steps below.

## Getting it running (testnet)

1. **Separate Blueprint project** — Blueprint expects its own project
   layout, so this doesn't build in place inside this repo:
   ```
   npm create ton@latest
   ```
   Choose **Tact**, empty project. Then:
   ```
   cd <your-project>
   npm install
   ```

2. Copy `contracts/escrow/escrow.tact` from this repo into
   `<your-project>/contracts/Royal64Escrow.tact`.

3. Compile:
   ```
   npx blueprint build
   ```
   Fixes needed here are expected on a first compile that's never
   touched an actual toolchain — send the errors back rather than
   guessing at fixes blind.

4. Test in the sandbox (no real network, no real funds) before going
   anywhere near testnet:
   ```
   npx blueprint test
   ```
   Copy `contracts/escrow/blueprint-scripts/Royal64Escrow.spec.ts`
   into `<your-project>/tests/` first — it covers the happy path,
   the deposit-window-expired refund, and the ForceSplit safety net.

5. Get testnet TON for three wallets (owner/deployer, oracle,
   treasury — can reuse one for owner+treasury) via `@testgiver_ton_bot`
   on Telegram, using a TON Keeper wallet switched to testnet mode.

6. Copy `contracts/escrow/blueprint-scripts/deployRoyal64Escrow.ts`
   into `<your-project>/scripts/`, fill in the oracle/treasury
   addresses, then:
   ```
   npx blueprint run
   ```
   Confirm via TON Connect in TON Keeper (testnet mode). Verify the
   result at `https://testnet.tonscan.org/address/<deployed address>`.

7. Copy the generated wrapper into this repo's chain-writer service —
   see `services/chain-writer/README.md` for the exact path and the
   rest of the wiring (`.env`, endpoints).

8. Before mainnet or any real money: get an independent security
   audit. This is standard practice for any contract that custodies
   funds, regardless of how carefully it was written or how well it
   passes its own tests — not optional.

## Why a separate small TypeScript "chain-writer" service

The rest of the backend is Python/FastAPI. It would be possible to
hand-encode the Tact contract's message cells (`CreateMatch`,
`DeclareResult`, ...) directly in Python. That was deliberately **not**
done here: Tact's compiler generates the exact, correct TL-B cell
encoding for you as a typed wrapper (`Royal64Escrow.ts`, produced by
`tact` / Blueprint next to the contract). Hand-rolling that byte layout
in Python from memory, with no compiler or test network available to
check it against, is exactly the kind of subtle-bug-in-a-money-path
risk this project can't afford — the same reasoning that led the
wallet-connect work to resolve public keys from chain state instead of
trusting client-supplied bytes.

So: a small internal service (`services/chain-writer/`, Node/TypeScript,
not public-facing) owns all contract calls, using `@ton/ton` and the
Tact-generated wrapper. FastAPI talks to it over a local HTTP API.
This is more moving parts than one language, but it means every
message sent to the escrow contract is encoded by the same tool that
compiled the contract — not by a hand-written guess.

## State machine (see contract for full detail)

```
Waiting  --both players Deposit-->            Active
Waiting  --depositDeadline passes, <2 paid--> Cancelled  (refund whoever paid)
Active   --oracle sends DeclareResult-->      Resolved   (payout sent, 3% fee to treasury)
Active   --resolveDeadline passes, oracle
           never resolved-->                  Resolved   (ForceSplit: 50/50, no fee)
```

Key invariants:

- Every branch sets `status` **before** sending any value message
  (checks-effects-interactions), so a match can never pay out twice
  even if a payout message bounces.
- Only the `oracle` address (the backend's own signing wallet) can
  create matches or declare results. Only `owner` can rotate the
  oracle or treasury address.
- `ForceSplit` is callable by *anyone* once `resolveDeadline` passes —
  this is the concrete on-chain backstop if the backend is down, buggy,
  or compromised: funds cannot be permanently stuck waiting on the
  oracle. No fee is taken on a forced split.
- Overpayment on `Deposit` is refunded immediately rather than kept.

## Known limitations / things to decide before mainnet

- **Bounced payouts**: payouts use `bounce: true`. If a winner's
  address can't accept the message for some reason, TON bounces the
  value back into the contract, and there is currently no `Claim()`
  fallback to let them retry. Worth adding before mainnet.
- **Single contract, all matches**: one contract holds a `map` of every
  match. Simpler to reason about and audit than a per-match factory,
  but it means all escrowed funds sit behind one contract's logic and
  one storage map. At meaningful scale, sharding into N parallel
  escrow contracts (e.g. `match_id % N`) behind a small router is the
  natural next step — not done here to keep the audited surface area
  small for v1.
- **Oracle key custody**: whoever holds the oracle wallet's mnemonic
  can create matches and declare arbitrary results. This key must live
  in a secrets manager, never in `.env` on a shared box, ideally behind
  an HSM or multisig before real volume. `ForceSplit` limits the damage
  of oracle compromise to "funds get split instead of paid to the
  wrong winner," which is intentional.
- **Gas/fee estimation**: `MIN_GAS_RESERVE` in the contract is a rough
  placeholder. Needs to be checked against real network fees during
  testnet testing, not assumed.

## Off-chain / on-chain division of responsibility

- **On-chain (this contract)**: holds funds, decides payouts, is the
  only party that can move money. This is what makes "the server never
  holds user funds" true rather than a slogan.
- **Off-chain (`services/payment/`)**: creates the on-chain match once
  two players accept an offer, watches deposit status, and — once the
  chess game finishes — tells the contract who won. It never touches
  the funds directly.

## Status update: resolve() is now wired into game-over

`services/game_loop_service.py` calls `PaymentService.resolve()` when a
match is decided (Bo1: immediately; Bo3: once a player reaches
majority — game 2/3 are now created automatically with colors swapped
when a Bo3 isn't decided yet). This call is currently best-effort: if chain-writer is
unreachable, the failure is swallowed rather than retried or alerted
on. That's fine while chain-writer is still a stub with no real
contract behind it, but **must** get a real retry/alerting mechanism
before this handles actual funds — a swallowed exception on a payout
call is not acceptable once money is real.
