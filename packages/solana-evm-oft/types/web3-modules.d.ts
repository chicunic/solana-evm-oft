// @safe-global/protocol-kit ships a stray typechain source (Multi_send.ts) importing web3 types;
// the web3 branch is stubbed out via pnpm overrides, so provide the two type names it uses.
declare module "web3-eth-contract" {
  export type ContractOptions = unknown;
}
declare module "web3-core" {
  export type EventLog = unknown;
}
