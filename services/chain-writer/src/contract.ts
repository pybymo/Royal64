// Re-exports the class Tact generates when you build the contract in
// ../../../contracts/escrow. The exact path/name depends on your
// Tact/Blueprint version — after running `tact build` there, look in
// contracts/escrow/output/ and fix this import accordingly.
//
// The generated class is what actually knows how to encode
// CreateMatch / Deposit / DeclareResult / CancelExpired / ForceSplit
// into correctly-typed cells — nothing in this service should
// hand-construct those cells itself.

// TODO: fix this path after `tact build`
// export { Royal64Escrow } from "../../../contracts/escrow/output/Royal64Escrow_Royal64Escrow";

throw new Error(
    "contract.ts is a placeholder — build the contract with `tact build` " +
    "in contracts/escrow, then point this import at the generated wrapper " +
    "before running chain-writer."
);
