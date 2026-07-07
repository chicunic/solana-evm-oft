import assert from "assert";

import { BigNumber, Contract, ContractTransaction } from "ethers";
import { type DeployFunction } from "hardhat-deploy/types";

const contractName = "MyERC20Mock";

// Minimal typed view over the mock token; ethers v5 Contract method calls are untyped otherwise
interface MyERC20MockContract extends Contract {
  mint(to: string, amount: BigNumber): Promise<ContractTransaction>;
  balanceOf(account: string): Promise<BigNumber>;
}

const deploy: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments } = hre;

  const { deployer } = await getNamedAccounts();

  assert(deployer, "Missing named deployer account");

  console.log(`Network: ${hre.network.name}`);
  console.log(`Deployer: ${deployer}`);

  // Token configuration
  const tokenName = "Sidekick";
  const tokenSymbol = "K";
  const initialMintAmount = hre.ethers.utils.parseEther("10"); // 10 tokens

  const { address } = await deployments.deploy(contractName, {
    from: deployer,
    args: [
      tokenName, // Token name
      tokenSymbol, // Token symbol
    ],
    log: true,
    skipIfAlreadyDeployed: false,
  });

  console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`);
  console.log(`Token: ${tokenName} (${tokenSymbol})`);

  // Mint initial tokens to the deployer
  const [signer] = await hre.ethers.getSigners();
  const innerToken = (await hre.ethers.getContractAt(contractName, address, signer)) as MyERC20MockContract;

  const mintTx = await innerToken.mint(deployer, initialMintAmount);
  await mintTx.wait();

  const balance = await innerToken.balanceOf(deployer);
  console.log(`Minted ${hre.ethers.utils.formatEther(balance)} ${tokenSymbol} tokens to deployer: ${deployer}`);
};

deploy.tags = [contractName];

export default deploy;
