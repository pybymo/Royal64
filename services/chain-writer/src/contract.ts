// Re-exports the class Tact generates when you build the contract.
// This file itself never encodes a message — the generated class is
// what knows how to correctly turn CreateMatch / Deposit /
// DeclareResult / CancelExpired / ForceSplit into the right cells.
//
// Requires: copy build/Royal64Escrow/tact_Royal64Escrow.ts from your
// Blueprint project into ./generated/Royal64Escrow.ts first — see
// ./generated/README.md.

export { Royal64Escrow } from "./generated/Royal64Escrow";
