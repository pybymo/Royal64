# USDT stakes (alongside TON)

## Why

Discussed directly: TON is fast and native to this app's ecosystem,
but its price moves — a "1 TON" stake is worth something different
every day, which adds a layer of volatility on top of the actual game
outcome. TON has native USDT support as a jetton (a token on TON
itself, not a separate chain), so this is added as a second currency
option on the *same* wallet/TonConnect integration already built,
rather than bolting on an entire second blockchain.

## What exists so far (this pass)

- `contracts/escrow_usdt/escrow_usdt.tact` — a **separate** contract
  from `escrow.tact`, on purpose. Same match lifecycle (Waiting →
  Active → Resolved/Cancelled, ForceSplit safety net), but accepting
  jetton `transfer_notification` messages (TEP-74) instead of native
  TON value. Jetton handling is a well-documented source of real
  exploits on TON specifically — see the security notes at the top of
  that file. Keeping it separate means each contract's audited surface
  stays small instead of growing together.
- `match_offers.currency` (TON | USDT) — plumbed through
  `OfferCreate`/`OfferOut`/`Match.currency`. An offer can be created in
  either currency now, at the data-model level.

## What's explicitly NOT done yet

- **Not compiled or tested.** Same status as `escrow.tact` was before
  your testnet pass — needs `blueprint build`, the sandbox test suite,
  then testnet, before it's trustworthy at all.
- **`chain-writer` has no USDT-side implementation.** It only knows
  how to call the plain-TON contract right now. Extending it means:
  encoding the `forwardPayload` this contract expects when a player
  deposits (a 32-bit tag `0x52364444`, the match id, and the
  depositor's address — see `escrow_usdt.tact`'s `JettonTransferNotification`
  receiver), and calling `SetJettonWallet` once after deployment with
  this contract's own resolved USDT jetton-wallet address.
- **No frontend currency picker.** The Lobby's stake presets are still
  TON-only. `OfferCreate.currency` exists on the backend but nothing
  in the UI sets it to `"USDT"` yet.
- **USDT jetton master address** differs between mainnet and testnet —
  needs to be looked up and set as a config value before any of this
  is wired up (mainnet master: `EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs`;
  testnet has its own, separate address — don't assume it's the same).

## Recommended order for finishing this

1. Compile + sandbox-test `escrow_usdt.tact` on its own, the same way
   `escrow.tact` was validated.
2. Deploy to testnet, call `SetJettonWallet` with the resolved address.
3. Extend `chain-writer` with the jetton-specific deposit/payout calls.
4. Add the currency toggle to the Lobby UI last, once the chain behind
   it is actually proven to work — a currency picker over a
   non-functional payment path is worse than not having the option
   yet.
