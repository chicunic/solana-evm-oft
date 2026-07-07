import { PublicKey } from "@solana/web3.js";
import { utils } from "ethers";

// Cross-chain codec compatibility tests for the OFT wire format.
//
// The OFT message travels between chains, so the byte layout produced by the EVM
// encoder (OFTMsgCodec.sol) must be readable by the Solana decoder
// (programs/oft/src/msg_codec.rs) and vice versa. These tests pin both sides to
// shared golden vectors; test/foundry/MsgCodec.t.sol asserts the same vectors
// against the real Solidity library.
//
// Layout (both chains): sendTo[32] | amountSD u64 BE[8] | (sender[32] | composeMsg[..])

// Offsets mirrored from programs/oft/src/msg_codec.rs
const SEND_AMOUNT_SD_OFFSET = 32;
const COMPOSE_MSG_OFFSET = 40;

// Shared fixture values (must stay in sync with test/foundry/MsgCodec.t.sol)
const AMOUNT_SD = 123456789n;
const AMOUNT_SD_HEX = "00000000075bcd15";
const COMPOSE_MSG_HEX = "01020304050607080900";
const SOLANA_RECIPIENT = new PublicKey(Buffer.alloc(32, 0x01));
const SOLANA_SENDER = new PublicKey(Buffer.alloc(32, 0x03));
const EVM_SENDER = "0x1111111111111111111111111111111111111111";
const EVM_RECIPIENT = "0x2222222222222222222222222222222222222222";

// Golden vectors: raw bytes as they appear on the wire
const GOLDEN_EVM_TO_SOLANA = "01".repeat(32) + AMOUNT_SD_HEX + "00".repeat(12) + "11".repeat(20) + COMPOSE_MSG_HEX;
const GOLDEN_EVM_TO_SOLANA_NO_COMPOSE = "01".repeat(32) + AMOUNT_SD_HEX;
const GOLDEN_SOLANA_TO_EVM = "00".repeat(12) + "22".repeat(20) + AMOUNT_SD_HEX + "03".repeat(32) + COMPOSE_MSG_HEX;

const hex = (bytes: Uint8Array): string => Buffer.from(bytes).toString("hex");

// Mirror of msg_codec::encode from programs/oft/src/msg_codec.rs
function solanaEncode(sendTo: Uint8Array, amountSd: bigint, sender: PublicKey, composeMsg?: Uint8Array): Buffer {
  const amount = Buffer.alloc(8);
  amount.writeBigUInt64BE(amountSd);
  const parts = [Buffer.from(sendTo), amount];
  if (composeMsg) {
    parts.push(Buffer.from(sender.toBytes()), Buffer.from(composeMsg));
  }
  return Buffer.concat(parts);
}

// Mirrors of the msg_codec decoder functions from programs/oft/src/msg_codec.rs
const solanaDecodeSendTo = (message: Buffer): Buffer => message.subarray(0, SEND_AMOUNT_SD_OFFSET);
const solanaDecodeAmountSd = (message: Buffer): bigint => message.readBigUInt64BE(SEND_AMOUNT_SD_OFFSET);
const solanaDecodeComposeMsg = (message: Buffer): Buffer | null =>
  message.length > COMPOSE_MSG_OFFSET ? message.subarray(COMPOSE_MSG_OFFSET) : null;

// Mirror of OFTMsgCodec.encode: abi.encodePacked(sendTo, amountSD[, bytes32(msg.sender), composeMsg])
function evmEncode(sendTo: string, amountSd: bigint, msgSender: string, composeMsg?: string): string {
  return composeMsg
    ? utils.solidityPack(
        ["bytes32", "uint64", "bytes32", "bytes"],
        [sendTo, amountSd, utils.hexZeroPad(msgSender, 32), composeMsg],
      )
    : utils.solidityPack(["bytes32", "uint64"], [sendTo, amountSd]);
}

describe("OFT msg codec cross-chain compatibility", () => {
  describe("EVM -> Solana", () => {
    it("EVM encoder output matches the golden vector", () => {
      const encoded = evmEncode("0x" + hex(SOLANA_RECIPIENT.toBytes()), AMOUNT_SD, EVM_SENDER, "0x" + COMPOSE_MSG_HEX);
      expect(encoded).toEqual("0x" + GOLDEN_EVM_TO_SOLANA);
    });

    it("EVM encoder output without composeMsg matches the golden vector", () => {
      const encoded = evmEncode("0x" + hex(SOLANA_RECIPIENT.toBytes()), AMOUNT_SD, EVM_SENDER);
      expect(encoded).toEqual("0x" + GOLDEN_EVM_TO_SOLANA_NO_COMPOSE);
    });

    it("Solana decoder reads the EVM-encoded golden vector", () => {
      const message = Buffer.from(GOLDEN_EVM_TO_SOLANA, "hex");
      expect(message.length).toBe(72 + COMPOSE_MSG_HEX.length / 2);
      expect(hex(solanaDecodeSendTo(message))).toEqual(hex(SOLANA_RECIPIENT.toBytes()));
      expect(solanaDecodeAmountSd(message)).toEqual(AMOUNT_SD);
      // msg_codec::compose_msg returns [sender(32) | composeMsg], sender is the padded EVM address
      const composeMsg = solanaDecodeComposeMsg(message);
      if (composeMsg === null) {
        throw new Error("expected composeMsg to be present");
      }
      expect(hex(composeMsg)).toEqual("00".repeat(12) + "11".repeat(20) + COMPOSE_MSG_HEX);
    });

    it("Solana decoder reads the EVM-encoded golden vector without composeMsg", () => {
      const message = Buffer.from(GOLDEN_EVM_TO_SOLANA_NO_COMPOSE, "hex");
      expect(message.length).toBe(40);
      expect(hex(solanaDecodeSendTo(message))).toEqual(hex(SOLANA_RECIPIENT.toBytes()));
      expect(solanaDecodeAmountSd(message)).toEqual(AMOUNT_SD);
      expect(solanaDecodeComposeMsg(message)).toBeNull();
    });
  });

  describe("Solana -> EVM", () => {
    it("Solana encoder output matches the golden vector", () => {
      const sendTo = Buffer.from(utils.arrayify(utils.hexZeroPad(EVM_RECIPIENT, 32)));
      const encoded = solanaEncode(sendTo, AMOUNT_SD, SOLANA_SENDER, Buffer.from(COMPOSE_MSG_HEX, "hex"));
      expect(hex(encoded)).toEqual(GOLDEN_SOLANA_TO_EVM);
    });

    it("EVM decoder layout reads the Solana-encoded golden vector", () => {
      // Same offsets OFTMsgCodec.sol uses; the real library is exercised in MsgCodec.t.sol
      const message = Buffer.from(GOLDEN_SOLANA_TO_EVM, "hex");
      const sendTo = "0x" + hex(message.subarray(0, 32));
      expect(utils.getAddress("0x" + hex(message.subarray(12, 32)))).toEqual(utils.getAddress(EVM_RECIPIENT));
      expect(utils.hexZeroPad(EVM_RECIPIENT, 32)).toEqual(sendTo);
      expect(message.readBigUInt64BE(32)).toEqual(AMOUNT_SD);
      expect(hex(message.subarray(40))).toEqual("03".repeat(32) + COMPOSE_MSG_HEX);
    });
  });
});

// The compose payload is assembled and consumed on the destination chain only, so its
// layout is chain-local and intentionally differs between the two implementations:
// Solana (compose_msg_codec.rs): nonce u64[8] | srcEid u32[4] | amountLD u64[8]  | composeFrom[32] | composeMsg
// EVM (OFTComposeMsgCodec.sol):  nonce u64[8] | srcEid u32[4] | amountLD u256[32] | composeFrom[32] | composeMsg
describe("Solana compose_msg_codec (chain-local layout)", () => {
  const NONCE = 123456789n;
  const SRC_EID = 987654321;
  const GOLDEN_COMPOSE = AMOUNT_SD_HEX + "3ade68b1" + AMOUNT_SD_HEX + "01".repeat(32) + COMPOSE_MSG_HEX;

  // Mirror of compose_msg_codec::encode from programs/oft/src/compose_msg_codec.rs
  const composeEncode = (nonce: bigint, srcEid: number, amountLd: bigint, composeMsg: Buffer): Buffer => {
    const header = Buffer.alloc(20);
    header.writeBigUInt64BE(nonce, 0);
    header.writeUInt32BE(srcEid, 8);
    header.writeBigUInt64BE(amountLd, 12);
    return Buffer.concat([header, composeMsg]);
  };

  it("encodes and decodes the golden vector with Rust offsets", () => {
    const composeFrom = Buffer.alloc(32, 0x01);
    const composeMsg = Buffer.from(COMPOSE_MSG_HEX, "hex");
    const encoded = composeEncode(NONCE, SRC_EID, AMOUNT_SD, Buffer.concat([composeFrom, composeMsg]));

    expect(hex(encoded)).toEqual(GOLDEN_COMPOSE);
    expect(encoded.length).toBe(20 + 32 + composeMsg.length);
    // Decoder mirrors: offsets 0/8/12/20/52 from compose_msg_codec.rs
    expect(encoded.readBigUInt64BE(0)).toEqual(NONCE);
    expect(encoded.readUInt32BE(8)).toEqual(SRC_EID);
    expect(encoded.readBigUInt64BE(12)).toEqual(AMOUNT_SD);
    expect(hex(encoded.subarray(20, 52))).toEqual("01".repeat(32));
    expect(hex(encoded.subarray(52))).toEqual(COMPOSE_MSG_HEX);
  });
});
