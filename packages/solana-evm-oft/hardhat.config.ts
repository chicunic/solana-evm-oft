// Force ts-node to use CommonJS mode
process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: 'commonjs',
  esModuleInterop: true,
});

import 'dotenv/config';

import 'hardhat-deploy';
import '@nomicfoundation/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy-ethers';
import 'hardhat-contract-sizer';
import '@nomiclabs/hardhat-ethers';
import '@layerzerolabs/toolbox-hardhat';

import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types';

import { EndpointId } from '@layerzerolabs/lz-definitions';

import './tasks/index';

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
    tests: 'test/hardhat',
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
    'arbitrum-sepolia': {
      eid: EndpointId.ARBSEP_V2_TESTNET,
      url: process.env.RPC_URL_ARB_SEPOLIA || 'https://arbitrum-sepolia.gateway.tenderly.co',
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
