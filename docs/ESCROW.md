# Royal64 Escrow — design & integration notes

## Status

**Draft, untested on-chain.** The contract in `contracts/escrow/escrow.tact`
has not been compiled, deployed, or run against a live network in this
pass — this environment has no network access and no Tact toolchain
installed, so nothing here has been verified beyond careful manual
review. Before any real money touches this:

1. Compile it (`tact` / Blueprint) and fix whatever the compiler flags.
2. Deploy to **testnet**, run every path below with real testnet TON,
   including the failure paths (expired deposit, oracle silence,
   overpayment, double-deposit attempts).
3. Get an independent security audit before mainnet + real user funds.
   This is standard practice for any contract that custodies money —
   not optional, regardless of how carefully it was written.

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
