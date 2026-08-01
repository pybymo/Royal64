After `npx blueprint build` in your separate Blueprint project (see
docs/ESCROW.md), copy the generated wrapper file here:

    <blueprint-project>/build/Royal64Escrow/tact_Royal64Escrow.ts
        -> services/chain-writer/src/generated/Royal64Escrow.ts

Re-copy it every time the contract changes and gets rebuilt. This
folder is gitignored on purpose (see .gitignore) — it's a build
artifact, not source you maintain by hand.
