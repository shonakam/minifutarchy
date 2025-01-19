import hre from "hardhat";
import { TransactionReceipt } from "viem";
import abiFactory from "../artifacts/contracts/futarchy/factory/ProposalFactory.sol/ProposalFactory.json";

export function toWei(input: number): bigint {
  return BigInt(input) * BigInt(1e18);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


async function main() {
  let txHash: `0x${string}`, receipt: TransactionReceipt, reserves
  const accounts = await hre.viem.getWalletClients()
  const factory: `0x${string}` = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9";

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

      const duration = BigInt(7 * 24 * 60 * 60);
      const collateral = "0x5fbdb2315678afecb367f032d93f642f64180aa3"

      txHash = await accounts[0].writeContract({
        address: factory, abi: abiFactory.abi,
        functionName: "createProposal", args: [
        title, description, duration, collateral
      ]
    })
    console.log("txHash: ", txHash);
    await delay(200)
  }
}

// デプロイのエラーハンドリング
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contracts:", error);
    process.exit(1);
  });
