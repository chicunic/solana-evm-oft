import { decode } from "@coral-xyz/anchor/dist/cjs/utils/bytes/bs58";
import { Keypair, PublicKey } from "@solana/web3.js";
import { CLIArgumentType } from "hardhat/types";

export const keyPair: CLIArgumentType<Keypair> = {
  name: "keyPair",
  parse(_name: string, value: string) {
    return Keypair.fromSecretKey(decode(value));
  },
  validate() {
    // parse() already throws on invalid input, so no extra validation is needed
  },
};

export const publicKey: CLIArgumentType<PublicKey> = {
  name: "keyPair",
  parse(_name: string, value: string) {
    return new PublicKey(value);
  },
  validate() {
    // parse() already throws on invalid input, so no extra validation is needed
  },
};

export interface SendResult {
  txHash: string; // EVM: receipt.transactionHash, Solana: base58 sig
  scanLink: string; // LayerZeroScan link for cross-chain tracking
}
