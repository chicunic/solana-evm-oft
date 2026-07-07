// @solana-developers/helpers ships types only via the ESM "import" condition; mirror the used API for nodenext/require resolution
declare module "@solana-developers/helpers" {
  import type {
    AddressLookupTableAccount,
    Commitment,
    Connection,
    PublicKey,
    TransactionInstruction,
  } from "@solana/web3.js";

  export const getSimulationComputeUnits: (
    connection: Connection,
    instructions: TransactionInstruction[],
    payer: PublicKey,
    lookupTables: AddressLookupTableAccount[] | [],
    commitment?: Commitment,
  ) => Promise<number | null>;
}
