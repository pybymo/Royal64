These two files aren't meant to sit here — Blueprint expects them
inside your separate Blueprint project (the one made with
`npm create ton@latest`), not inside this repo:

    deployRoyal64Escrow.ts  ->  <blueprint-project>/scripts/deployRoyal64Escrow.ts
    Royal64Escrow.spec.ts   ->  <blueprint-project>/tests/Royal64Escrow.spec.ts

They're kept here just so the exact content travels with the rest of
the project instead of living only in a chat reply.
