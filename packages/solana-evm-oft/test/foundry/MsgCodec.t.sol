// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {OFTMsgCodec} from "@layerzerolabs/oft-evm/contracts/libs/OFTMsgCodec.sol";

import {Test} from "forge-std/Test.sol";

// Wraps the internal library so tests control msg.sender via vm.prank and use calldata slices
contract MsgCodecHarness {
    function encode(bytes32 _sendTo, uint64 _amountShared, bytes memory _composeMsg)
        external
        view
        returns (bytes memory, bool)
    {
        return OFTMsgCodec.encode(_sendTo, _amountShared, _composeMsg);
    }

    function sendTo(bytes calldata _msg) external pure returns (bytes32) {
        return OFTMsgCodec.sendTo(_msg);
    }

    function amountSD(bytes calldata _msg) external pure returns (uint64) {
        return OFTMsgCodec.amountSD(_msg);
    }

    function isComposed(bytes calldata _msg) external pure returns (bool) {
        return OFTMsgCodec.isComposed(_msg);
    }

    function composeMsg(bytes calldata _msg) external pure returns (bytes memory) {
        return OFTMsgCodec.composeMsg(_msg);
    }
}

/// Cross-chain wire-format tests: pins OFTMsgCodec output to the same golden vectors
/// asserted against the Rust layout (programs/oft/src/msg_codec.rs) in test/anchor/msg-codec.test.ts.
contract MsgCodecTest is Test {
    // Shared fixture values (must stay in sync with test/anchor/msg-codec.test.ts)
    uint64 private constant AMOUNT_SD = 123456789;
    bytes32 private constant SOLANA_RECIPIENT =
        bytes32(hex"0101010101010101010101010101010101010101010101010101010101010101");
    bytes32 private constant SOLANA_SENDER =
        bytes32(hex"0303030303030303030303030303030303030303030303030303030303030303");
    address private constant EVM_SENDER = 0x1111111111111111111111111111111111111111;
    address private constant EVM_RECIPIENT = 0x2222222222222222222222222222222222222222;
    bytes private constant COMPOSE_MSG = hex"01020304050607080900";

    bytes private constant GOLDEN_EVM_TO_SOLANA = hex"0101010101010101010101010101010101010101010101010101010101010101"
        hex"00000000075bcd15" hex"0000000000000000000000001111111111111111111111111111111111111111"
        hex"01020304050607080900";
    bytes private constant GOLDEN_EVM_TO_SOLANA_NO_COMPOSE = hex"0101010101010101010101010101010101010101010101010101010101010101"
        hex"00000000075bcd15";
    bytes private constant GOLDEN_SOLANA_TO_EVM = hex"0000000000000000000000002222222222222222222222222222222222222222"
        hex"00000000075bcd15" hex"0303030303030303030303030303030303030303030303030303030303030303"
        hex"01020304050607080900";

    MsgCodecHarness private harness;

    function setUp() public {
        harness = new MsgCodecHarness();
    }

    function test_encode_matches_golden_vector() public {
        vm.prank(EVM_SENDER);
        (bytes memory encoded, bool hasCompose) = harness.encode(SOLANA_RECIPIENT, AMOUNT_SD, COMPOSE_MSG);

        assertTrue(hasCompose);
        assertEq(encoded, GOLDEN_EVM_TO_SOLANA);
    }

    function test_encode_without_compose_matches_golden_vector() public {
        vm.prank(EVM_SENDER);
        (bytes memory encoded, bool hasCompose) = harness.encode(SOLANA_RECIPIENT, AMOUNT_SD, "");

        assertFalse(hasCompose);
        assertEq(encoded, GOLDEN_EVM_TO_SOLANA_NO_COMPOSE);
    }

    function test_decode_solana_encoded_message() public {
        assertEq(harness.sendTo(GOLDEN_SOLANA_TO_EVM), bytes32(uint256(uint160(EVM_RECIPIENT))));
        assertEq(harness.amountSD(GOLDEN_SOLANA_TO_EVM), AMOUNT_SD);
        assertTrue(harness.isComposed(GOLDEN_SOLANA_TO_EVM));
        assertEq(harness.composeMsg(GOLDEN_SOLANA_TO_EVM), abi.encodePacked(SOLANA_SENDER, COMPOSE_MSG));
    }

    function test_decode_message_without_compose_is_not_composed() public {
        assertFalse(harness.isComposed(GOLDEN_EVM_TO_SOLANA_NO_COMPOSE));
        assertEq(harness.sendTo(GOLDEN_EVM_TO_SOLANA_NO_COMPOSE), SOLANA_RECIPIENT);
        assertEq(harness.amountSD(GOLDEN_EVM_TO_SOLANA_NO_COMPOSE), AMOUNT_SD);
    }
}
