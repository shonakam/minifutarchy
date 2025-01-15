import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import abiProposal from "../../artifacts/contracts/futarchy/target/Proposal.sol/Proposal.json";
import abiCollateralMock from "../../artifacts/contracts/futarchy/CollateralMock.sol/CollateralMock.json";

export function toWei(input: number) { return input * 10 ** 18 }
export function fromWei(input: number) { return input / 10**18 }

export const deploy = async () => {
  const publicClient = await hre.viem.getPublicClient();
  const [from, to, x, y, z] = await hre.viem.getWalletClients();

  const collateral = await hre.viem.deployContract("CollateralMock", [BigInt(toWei(5000000))]);
  const target = await hre.viem.deployContract("Proposal", []);
  const exchange = await hre.viem.deployContract("Exchange", []);
  const factory = await hre.viem.deployContract("ProposalFactory", [target.address, exchange.address]);

  return { publicClient, from, to, x, y, z, collateral, target, exchange, factory };
};

export const setupInstance = async () => {
  const { publicClient, from, x, y, z, collateral, factory, exchange } = await loadFixture(deploy);

  const setDescription = "Test Proposal";
  const setDuration = BigInt(7 * 24 * 60 * 60);

  await factory.write.createProposal([setDescription, setDuration, collateral.address]);
  const proposalAddress: `0x${string}` = "0xd8058efe0198ae9dD7D563e1b4938Dcbc86A1F81";

  await from.writeContract({
    address: collateral.address, abi: abiCollateralMock.abi,
    functionName: "approve", args: [proposalAddress, BigInt(toWei(1000000))],
  });

  for (const user of [x, y, z]) {
    await user.writeContract({
      address: collateral.address, abi: abiCollateralMock.abi,
      functionName: "mint", args: [user.account.address, BigInt(toWei(2000))],
    });
  }

  for (const user of [x, y, z]) {
    await user.writeContract({
      address: collateral.address, abi: abiCollateralMock.abi,
      functionName: "approve", args: [proposalAddress, BigInt(toWei(2000))],
    });
  }

  await from.writeContract({
    address: proposalAddress, abi: abiProposal.abi,
    functionName: "initializeLiquidity", args: [BigInt(toWei(20000))],
  });

  return { publicClient, from, x, y, z, collateral, factory, exchange, proposalAddress };
};
