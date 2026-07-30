# chain-writer

Internal-only service. The only thing in this repo allowed to hold the
oracle wallet's private key and send transactions to the escrow
contract. FastAPI talks to this over localhost/internal network — it
must never be exposed publicly.

## Setup

1. Compile the contract first — this generates the typed wrapper this
   service imports:

   ```
   cd ../../contracts/escrow
   npx tact build   # or: npx blueprint build, depending on your setup
   ```

   That produces `output/Royal64Escrow_Royal64Escrow.ts` (exact path
   depends on your Tact/Blueprint version) with a generated
   `Royal64Escrow` class exposing typed `send*` methods for every
   `message` in the contract — `sendCreateMatch`, `sendDeclareResult`,
   etc. — and a typed `getMatch_` getter. `src/contract.ts` re-exports
   from there; update the import path in that file to match your build
   output before running anything.

2. `cp .env.example .env` and fill in:
   - `ORACLE_MNEMONIC` — the 24-word mnemonic for the oracle wallet.
     **Never commit this. Use a secrets manager in production.**
   - `TON_ENDPOINT` — a TonCenter/TonAPI HTTP endpoint (testnet first).
   - `ESCROW_ADDRESS` — the deployed contract's address.
   - `INTERNAL_API_KEY` — shared secret so only the FastAPI backend can
     call this service.

3. `npm install && npm run dev`

## Endpoints (internal only — check `INTERNAL_API_KEY` header)

- `POST /matches` — creates a match on-chain (oracle-signed `CreateMatch`)
- `POST /matches/:matchId/resolve` — sends `DeclareResult`
- `GET /matches/:matchId` — reads current on-chain state via the getter

This has not been run against a live network in this pass — treat it
as a structured starting point, not a tested integration. See
`docs/ESCROW.md` for the full picture and known limitations.
