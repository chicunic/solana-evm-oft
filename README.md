# solana-evm-oft

LayerZero OFT (Omnichain Fungible Token) cross-chain bridge monorepo.

## Packages

- [`packages/evm-oft`](./packages/evm-oft) — Pure EVM cross-chain OFT using `MyOFTAdapter` (lock/unlock) and `MyOFT` (mint/burn). Configured for Sepolia and BSC Testnet.
- [`packages/solana-evm-oft`](./packages/solana-evm-oft) — Cross-chain OFT between Solana and EVM. Includes a Rust/Anchor program (`programs/oft/`) and Solidity contracts. Configured for Arbitrum Sepolia and Solana Testnet.

## Prerequisites

- Node.js >= 24
- [pnpm](https://pnpm.io/)
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for Solidity tests)

Additional requirements for `solana-evm-oft`:

- [Rust](https://rustup.rs/) (1.84.1+)
- [Solana CLI](https://docs.solanalabs.com/cli/install)
- [Anchor](https://www.anchor-lang.com/docs/installation) (0.31.1)

## Usage

```bash
pnpm install          # install dependencies
pnpm compile          # compile Solidity contracts
pnpm test             # run tests (Hardhat + Forge)
pnpm check            # type check + Prettier
```

## Tech Stack

| Layer    | Technology                                 |
| -------- | ------------------------------------------ |
| Protocol | [LayerZero V2](https://layerzero.network/) |
| EVM      | Solidity 0.8.22, Hardhat, Foundry          |
| Solana   | Rust, Anchor 0.31.1                        |
| Tooling  | pnpm workspaces, TypeScript 6, Prettier    |

## Links

- [LayerZero Documentation](https://docs.layerzero.network/)
- [OFT Standard](https://docs.layerzero.network/v2/concepts/applications/oft-standard)
- [Deployed Endpoints](https://docs.layerzero.network/v2/deployments/deployed-contracts)
- [Troubleshooting](https://docs.layerzero.network/v2/developers/evm/troubleshooting/debugging-messages)

## License

[MIT](./LICENSE)
