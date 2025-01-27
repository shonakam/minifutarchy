import * as fs from "fs/promises";
import hre from "hardhat";
import { TransactionReceipt, decodeEventLog, keccak256, stringToBytes } from "viem";
import abiFactory from "../artifacts/contracts/futarchy/factory/ProposalFactory.sol/ProposalFactory.json";
import abiProposal from "../artifacts/contracts/futarchy/target/Proposal.sol/Proposal.json"
import abiCollateral from "../artifacts/contracts/futarchy/CollateralMock.sol/CollateralMock.json"

export function toWei(input: number): bigint {
  return BigInt(input) * BigInt(1e18);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  let txHash: `0x${string}`, receipt: TransactionReceipt, reserves
  const accounts = await hre.viem.getWalletClients()
  const publicClient = await hre.viem.getPublicClient();
  const factory: `0x${string}` = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9";

  type ProposalCreatedEventArgs = { proposal: `0x${string}`; collateralToken: string; proposalId: bigint;};
  const eventSignature = "ProposalCreated(uint256,address,address)";
  const eventHash = keccak256(stringToBytes(eventSignature));
  const filePath = "./scripts/address.txt";
  
  try {
    await fs.access(filePath);
    await fs.rm(filePath);
  } catch { 
    console.log(`${filePath} は存在しません。`)
  }

  for (let i = 0; i < 100; i++) {
    const title: string = `This is sample title[${i}]`
    const description: string = 
      `This proposal aims to demonstrate the creation of a comprehensive example
      that includes a well-structured and highly detailed description. It covers
      multiple aspects of proposal implementation, including the technical
      considerations, expected outcomes, and potential challenges. By providing
      such a detailed description, we aim to ensure that all stakeholders have
      sufficient information to make informed decisions regarding the proposal.
    
      Key Objectives:
      1. To showcase the use of viem for contract interaction.
      2. To include a clear understanding of transaction receipts.
      3. To provide detailed logging for debugging purposes.
    
      Potential Challenges:
      - High gas costs if the input strings are excessively long.
      - Ensuring compatibility with all deployed network contracts.
      - Handling edge cases related to argument validation.
    
      Conclusion:
      This proposal is designed to demonstrate the scalability and flexibility
      of contract deployment using Hardhat and viem. It serves as a foundational
      step towards more complex contract interactions and integrations.`

    const threshold = "Threshold display location."
    const duration = BigInt(7 * 24 * 60 * 60);
    const collateral = "0x5fbdb2315678afecb367f032d93f642f64180aa3"

    txHash = await accounts[0].writeContract({
      address: factory, abi: abiFactory.abi,
      functionName: "createProposal", args: [
        title, description, threshold, duration, collateral
      ]
    })
    console.log("txHash: ", txHash);
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    const eventLog = receipt.logs.find((log) => log.topics[0] === eventHash);
    const decodedEvent = decodeEventLog({
      abi: abiFactory.abi,
      eventName: "ProposalCreated",
      data: eventLog?.data,
      topics: eventLog?.topics || [],
    }) as unknown as { args: ProposalCreatedEventArgs };

    const cloneAddress = decodedEvent.args.proposal;
    fs.appendFile(filePath, `${cloneAddress}\n`, "utf-8");

    txHash = await accounts[0].writeContract({
      address: collateral, abi: abiCollateral.abi,
      functionName: "mint", args: [
        accounts[0].account.address, BigInt(50000)
      ]
    })
    txHash = await accounts[0].writeContract({
      address: collateral, abi: abiCollateral.abi,
      functionName: "approve", args: [
        cloneAddress, BigInt(50000)
      ]
    })
    txHash = await accounts[0].writeContract({
      address: cloneAddress, abi: abiProposal.abi,
      functionName: "initializeLiquidity", args: [BigInt(50000)]
    })
    // await delay(200)
  }
}

// デプロイのエラーハンドリング
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contracts:", error);
    process.exit(1);
});
