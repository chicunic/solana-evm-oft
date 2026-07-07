import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, BigNumberish, Contract, ContractFactory, ContractTransaction, Signer } from "ethers";
import { deployments, ethers } from "hardhat";

import { Options } from "@layerzerolabs/lz-v2-utilities";

type SendParam = [number, Uint8Array, BigNumber, BigNumber, string, string, string];

// Minimal typed views over the mock contracts; ethers v5 Contract method calls are untyped otherwise
interface EndpointV2MockContract extends Contract {
  setDestLzEndpoint(destAddr: string, lzEndpointAddr: string): Promise<ContractTransaction>;
}

interface ERC20MockContract extends Contract {
  connect(signer: Signer): this;
  mint(to: string, amount: BigNumber): Promise<ContractTransaction>;
  approve(spender: string, amount: BigNumber): Promise<ContractTransaction>;
  balanceOf(account: string): Promise<BigNumber>;
}

interface OFTContract extends Contract {
  connect(signer: Signer): this;
  setPeer(eid: number, peer: Uint8Array): Promise<ContractTransaction>;
  quoteSend(sendParam: SendParam, payInLzToken: boolean): Promise<[BigNumber, BigNumber]>;
  send(
    sendParam: SendParam,
    fee: [BigNumber, BigNumberish],
    refundAddress: string,
    overrides?: { value: BigNumber },
  ): Promise<ContractTransaction>;
  balanceOf(account: string): Promise<BigNumber>;
}

describe("MyOFTAdapter Test", function () {
  // Constant representing a mock Endpoint ID for testing purposes
  const eidA = 1;
  const eidB = 2;
  // Declaration of variables to be used in the test suite
  let MyOFTAdapter: ContractFactory;
  let MyOFT: ContractFactory;
  let ERC20Mock: ContractFactory;
  let EndpointV2Mock: ContractFactory;
  let ownerA: SignerWithAddress;
  let ownerB: SignerWithAddress;
  let endpointOwner: SignerWithAddress;
  let token: ERC20MockContract;
  let myOFTAdapter: OFTContract;
  let myOFTB: OFTContract;
  let mockEndpointV2A: EndpointV2MockContract;
  let mockEndpointV2B: EndpointV2MockContract;

  // Before hook for setup that runs once before all tests in the block
  before(async function () {
    // Contract factory for our tested contract
    //
    // We are using a derived contract that exposes a mint() function for testing purposes
    MyOFTAdapter = await ethers.getContractFactory("MyOFTAdapterMock");

    MyOFT = await ethers.getContractFactory("MyOFTMock");

    ERC20Mock = await ethers.getContractFactory("MyERC20Mock");

    // Fetching the first three signers (accounts) from Hardhat's local Ethereum network
    const signers = await ethers.getSigners();

    [ownerA, ownerB, endpointOwner] = signers;

    // The EndpointV2Mock contract comes from @layerzerolabs/test-devtools-evm-hardhat package
    // and its artifacts are connected as external artifacts to this project
    //
    // Unfortunately, hardhat itself does not yet provide a way of connecting external artifacts,
    // so we rely on hardhat-deploy to create a ContractFactory for EndpointV2Mock
    //
    // See https://github.com/NomicFoundation/hardhat/issues/1040
    const EndpointV2MockArtifact = await deployments.getArtifact("EndpointV2Mock");
    EndpointV2Mock = new ContractFactory(EndpointV2MockArtifact.abi, EndpointV2MockArtifact.bytecode, endpointOwner);
  });

  // beforeEach hook for setup that runs before each test in the block
  beforeEach(async function () {
    // Deploying a mock LZEndpoint with the given Endpoint ID
    mockEndpointV2A = (await EndpointV2Mock.deploy(eidA)) as EndpointV2MockContract;
    mockEndpointV2B = (await EndpointV2Mock.deploy(eidB)) as EndpointV2MockContract;

    token = (await ERC20Mock.deploy("Token", "TOKEN")) as ERC20MockContract;

    // Deploying two instances of MyOFT contract with different identifiers and linking them to the mock LZEndpoint
    myOFTAdapter = (await MyOFTAdapter.deploy(token.address, mockEndpointV2A.address, ownerA.address)) as OFTContract;
    myOFTB = (await MyOFT.deploy("bOFT", "bOFT", mockEndpointV2B.address, ownerB.address)) as OFTContract;

    // Setting destination endpoints in the LZEndpoint mock for each MyOFT instance
    await mockEndpointV2A.setDestLzEndpoint(myOFTB.address, mockEndpointV2B.address);
    await mockEndpointV2B.setDestLzEndpoint(myOFTAdapter.address, mockEndpointV2A.address);

    // Setting each MyOFT instance as a peer of the other in the mock LZEndpoint
    await myOFTAdapter.connect(ownerA).setPeer(eidB, ethers.utils.zeroPad(myOFTB.address, 32));
    await myOFTB.connect(ownerB).setPeer(eidA, ethers.utils.zeroPad(myOFTAdapter.address, 32));
  });

  // A test case to verify token transfer functionality
  it("should send a token from A address to B address via OFTAdapter/OFT", async function () {
    // Minting an initial amount of tokens to ownerA's address in the myOFTA contract
    const initialAmount = ethers.utils.parseEther("100");
    await token.mint(ownerA.address, initialAmount);

    // Defining the amount of tokens to send and constructing the parameters for the send operation
    const tokensToSend = ethers.utils.parseEther("1");

    // Defining extra message execution options for the send operation
    const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex();

    const sendParam: SendParam = [
      eidB,
      ethers.utils.zeroPad(ownerB.address, 32),
      tokensToSend,
      tokensToSend,
      options,
      "0x",
      "0x",
    ];

    // Fetching the native fee for the token send operation
    const [nativeFee] = await myOFTAdapter.quoteSend(sendParam, false);

    // Approving the native fee to be spent by the myOFTA contract
    await token.connect(ownerA).approve(myOFTAdapter.address, tokensToSend);

    // Executing the send operation from myOFTA contract
    await myOFTAdapter.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee });

    // Fetching the final token balances of ownerA and ownerB
    const finalBalanceA = await token.balanceOf(ownerA.address);
    const finalBalanceAdapter = await token.balanceOf(myOFTAdapter.address);
    const finalBalanceB = await myOFTB.balanceOf(ownerB.address);

    // Asserting that the final balances are as expected after the send operation
    expect(finalBalanceA).eql(initialAmount.sub(tokensToSend));
    expect(finalBalanceAdapter).eql(tokensToSend);
    expect(finalBalanceB).eql(tokensToSend);
  });
});
