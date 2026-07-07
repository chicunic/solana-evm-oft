import { EndpointId } from "@layerzerolabs/lz-definitions";
import { ExecutorOptionType } from "@layerzerolabs/lz-v2-utilities";
import { TwoWayConfig, generateConnectionsConfig } from "@layerzerolabs/metadata-tools";
import { OAppEnforcedOption } from "@layerzerolabs/toolbox-hardhat";

import type { OmniPointHardhat } from "@layerzerolabs/toolbox-hardhat";

const sepoliaContract: OmniPointHardhat = {
  eid: EndpointId.SEPOLIA_V2_TESTNET,
  contractName: "MyOFTAdapter",
};

const bscTestnetContract: OmniPointHardhat = {
  eid: EndpointId.BSC_V2_TESTNET,
  contractName: "MyOFT",
};

const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
  {
    msgType: 1,
    optionType: ExecutorOptionType.LZ_RECEIVE,
    gas: 80000,
    value: 0,
  },
];

const pathways: TwoWayConfig[] = [
  [sepoliaContract, bscTestnetContract, [["LayerZero Labs"], []], [1, 1], [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS]],
];

export default async function () {
  const connections = await generateConnectionsConfig(pathways);
  return {
    contracts: [{ contract: sepoliaContract }, { contract: bscTestnetContract }],
    connections,
  };
}
