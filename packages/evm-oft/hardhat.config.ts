import 'dotenv/config';

import 'hardhat-deploy';
import 'hardhat-contract-sizer';
import '@nomiclabs/hardhat-ethers';
import '@layerzerolabs/toolbox-hardhat';
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types';

import { EndpointId } from '@layerzerolabs/lz-definitions';

import './type-extensions';
import './tasks/sendOFT';

const MNEMONIC = process.env.MNEMONIC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const accounts: HttpNetworkAccountsUserConfig | undefined = MNEMONIC
  ? { mnemonic: MNEMONIC }
  : PRIVATE_KEY
    ? [PRIVATE_KEY]
    : undefined;

if (accounts == null) {
  console.warn(
    'Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.',
  );
}

const config: HardhatUserConfig = {
  paths: {
    cache: 'cache/hardhat',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.22',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    'sepolia-testnet': {
      eid: EndpointId.SEPOLIA_V2_TESTNET,
      url: process.env.RPC_URL_SEPOLIA || 'https://sepolia.gateway.tenderly.co',
      accounts,
      oftAdapter: {
        tokenAddress: process.env.TOKEN_ADDRESS_ETHEREUM || '0x0',
      },
    },
    'bsc-testnet': {
      eid: EndpointId.BSC_V2_TESTNET,
      url: process.env.RPC_URL_BSC_TESTNET || 'https://bsc-testnet-rpc.publicnode.com',
      accounts,
    },
    hardhat: {
      allowUnlimitedContractSize: true,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

export default config;
