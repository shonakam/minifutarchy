import hre from "hardhat";

export function toWei(input: number): bigint {
  return BigInt(input) * BigInt(1e18);
}

async function main() {
  // コントラクトのデプロイ
  const collateral = await hre.viem.deployContract("CollateralMock", [toWei(5000000)]);
  console.log("CollateralMock deployed to:	", collateral.address);

  const target = await hre.viem.deployContract("Proposal", []);
  console.log("Proposal deployed to:		", target.address);

  const exchange = await hre.viem.deployContract("Exchange", []);
  console.log("Exchange deployed to:		", exchange.address);

  const factory = await hre.viem.deployContract("ProposalFactory", [
    target.address,
    exchange.address,
  ]);
  console.log("ProposalFactory deployed to:	", factory.address);
}

// async function verifyContract(contractAddress: string, args: any[]) {
// 	console.log(`Verifying contract at ${contractAddress}...`);
// 	await hre.run("verify:verify", {
// 	  address: contractAddress,
// 	  constructorArguments: args,
// 	});
// }


// デプロイのエラーハンドリング
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contracts:", error);
    process.exit(1);
  });
