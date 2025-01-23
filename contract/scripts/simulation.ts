import * as fs from "fs/promises";
import { Indicator } from "../indicator";
import hre from "hardhat";
import abiCollateral from "../artifacts/contracts/futarchy/CollateralMock.sol/CollateralMock.json";
import abiExchange from "../artifacts/contracts/futarchy/Exchange.sol/Exchange.json";

export function toWei(input: number): bigint {
  return BigInt(input) * BigInt(1e18);
}

function delayFunc(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const collateral = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const exchange = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";
const filePath = "./scripts/address.txt";

async function getAddress(): Promise<`0x${string}`> {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`${filePath} が存在しません。`);
  }

  const data = await fs.readFile(filePath, "utf-8");
  const lines = data.split("\n").map((line) => line.trim());
  if (lines.length < 100) {
    throw new Error(`ファイルには 100 行以上のアドレスが必要です。現在の行数: ${lines.length}`);
  }
  return lines[99] as `0x${string}`;
}

async function adjustAllowance(
	account: any,
	spender: string,
	amount: number,
	increase: boolean
  ) {
	if (increase) {
	  // console.log(`Increasing allowance for spender ${spender} by ${amount}`);
	  await account.writeContract({
		address: collateral,
		abi: abiCollateral.abi,
		functionName: "increaseAllowance",
		args: [spender, BigInt(amount)],
	  });
	} else {
	  // console.log(`Decreasing allowance for spender ${spender} by ${amount}`);
	  await account.writeContract({
		address: collateral,
		abi: abiCollateral.abi,
		functionName: "decreaseAllowance",
		args: [spender, BigInt(amount)],
	  });
	}
}

async function performActions(
  accountIndex: number,
  amount: number,
  flag: boolean,
  proposalAddress: string,
  iterations: number,
  delay: number,
  indicator: Indicator
) {
  const accounts = await hre.viem.getWalletClients();
  const account = accounts[accountIndex];

  await adjustAllowance(account, exchange, amount * iterations, true);

  for (let i = 0; i < iterations; i++) {
    try {
      await account.writeContract({
        address: collateral,
        abi: abiCollateral.abi,
        functionName: "mint",
        args: [account.account.address, BigInt(amount)],
        //   maxFeePerGas: toWei(50),
        //   maxPriorityFeePerGas: toWei(2),
      });
      
      if (i % 2 === 0) {
        // console.log(
          //   `Account ${accountIndex} Voting with amount: ${amount}, flag: ${flag}`
          // );
      await account.writeContract({
        address: exchange,
        abi: abiExchange.abi,
        functionName: "vote",
        args: [proposalAddress, BigInt(amount), flag]
      });
    } else {
      // console.log(
        //   `Account ${accountIndex} Redeeming with amount: ${amount}, flag: ${flag}`
        // );
        await account.writeContract({
          address: exchange,
          abi: abiExchange.abi,
          functionName: "redeem",
          args: [proposalAddress, BigInt(amount), flag]
        });
      }
        indicator.update(accountIndex, i + 1);
        await delayFunc(delay);
      } catch {
        
      }
    }
    indicator.update(accountIndex, iterations);
    console.log();
    await adjustAllowance(account, exchange, amount * iterations, false);
  }
  
  async function main() {
    const target = await getAddress();
    console.log(`Using proposal address: ${target}\n`);
    const iter = 256;
    
    const indicator = new Indicator(iter);
    console.log("\n".repeat(4));
    
    await Promise.all([
      performActions(1, 200, true, target, iter, 2000, indicator),
      performActions(2, 150, false, target, iter, 3500, indicator),
      performActions(3, 300, true, target, iter, 2500, indicator),
      performActions(4, 1000, false, target, iter, 3000, indicator),
    ]);
    
    console.log("シミュレーションが完了しました。");
  }
  
  main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contracts:", error);
    process.exit(1);
  });
