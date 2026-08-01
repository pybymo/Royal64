# chain-writer

Internal-only service. The only thing in this repo allowed to hold the
oracle wallet's private key and send transactions to the escrow
contract. FastAPI talks to this over localhost/internal network — it
must never be exposed publicly.

## Setup

1. Compile the contract in a **separate** Blueprint project (Blueprint
   expects its own project layout — see `docs/ESCROW.md` for the full
   walkthrough: `npm create ton@latest`, copy `contracts/escrow/escrow.tact`
   in as `contracts/Royal64Escrow.tact`, `npx blueprint build`).

2. Copy the generated wrapper into this service:
   ```
   <blueprint-project>/build/Royal64Escrow/tact_Royal64Escrow.ts
       -> services/chain-writer/src/generated/Royal64Escrow.ts
   ```
   Re-copy after every contract rebuild — see
   `src/generated/README.md`.

3. `cp .env.example .env` and fill in:
   - `ORACLE_MNEMONIC` — the 24-word mnemonic for the oracle wallet.
     **Never commit this. Use a secrets manager in production.**
   - `TON_ENDPOINT` — a TonCenter/TonAPI HTTP endpoint (testnet first).
   - `ESCROW_ADDRESS` — the deployed contract's address.
   - `INTERNAL_API_KEY` — shared secret so only the FastAPI backend can
     call this service.

4. `npm install && npm run dev`

## Endpoints (internal only — check `INTERNAL_API_KEY` header)

- `POST /matches` — creates a match on-chain (oracle-signed `CreateMatch`).
  Returns 202 immediately (sending an external message doesn't confirm
  it landed) — poll `GET /matches/:matchId` to verify.
- `POST /matches/:matchId/resolve` — sends `DeclareResult`
- `GET /matches/:matchId` — reads current on-chain state via `getMatchInfo`

Implemented against the actual generated wrapper shape now (not a
guess) — but still only exercised in the sandbox test that ships with
this project (`contracts/escrow/blueprint-scripts/Royal64Escrow.spec.ts`),
not against a live network from this service itself. Run that test
and a real testnet deploy before trusting this against real matches.
