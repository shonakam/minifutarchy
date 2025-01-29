import * as fs from "fs/promises";
import hre from "hardhat";
import abiCollateral from "../artifacts/contracts/futarchy/CollateralMock.sol/CollateralMock.json";
import abiExchange from "../artifacts/contracts/futarchy/Exchange.sol/Exchange.json";
import { Indicator } from "../indicator";

const COLLATERAL_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const EXCHANGE_ADDRESS = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";
const FILE_PATH = "./scripts/address.txt";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
let LOCK: Promise<void> | null = null;

async function getProposalAddress(): Promise<`0x${string}`> {
	try {
		const data = await fs.readFile(FILE_PATH, "utf-8");
		const lines = data.trim().split("\n");
		if (lines.length < 100) throw new Error(`ファイルには 100 行以上のアドレスが必要です。現在の行数: ${lines.length}`);
		return lines[99] as `0x${string}`;
	} catch {
		throw new Error(`${FILE_PATH} が存在しません。`);
	}
}

async function performExchangeActionsWithLock(
	account: any,
	proposalAddress: string,
	amount: number,
	flag: boolean,
	action: "vote" | "redeem"
): Promise<void> {
	if (LOCK) {
		console.log("Waiting for existing exchange operation to complete...");
		await LOCK;
	}

	LOCK = (async () => {
		try {
			await account.writeContract({
				address: COLLATERAL_ADDRESS,
				abi: abiCollateral.abi,
				functionName: "approve",
				args: [EXCHANGE_ADDRESS, BigInt(amount)],
			});

			await account.writeContract({
				address: EXCHANGE_ADDRESS,
				abi: abiExchange.abi,
				functionName: action,
				args: [proposalAddress, BigInt(amount), flag],
			});
		} catch (error) {
			console.error(`Error during ${action} operation:`, error);
			throw error;
		} finally {
			LOCK = null;
		}
	})();

	await LOCK;
}

async function performActions(
	account: any,
	amount: number,
	flag: boolean,
	proposalAddress: string,
	iterations: number,
	delayMs: number,
	indicator: Indicator
) {
	for (let i = 0; i < iterations; i++) {
		try {
			await account.writeContract({
				address: COLLATERAL_ADDRESS,
				abi: abiCollateral.abi,
				functionName: "mint",
				args: [account.account.address, BigInt(amount)],
			});

			const action = i % 2 === 0 ? "vote" : "redeem";
			await performExchangeActionsWithLock(
				account, proposalAddress, amount, flag, action
			);

			indicator.update(account.index, i + 1);
			await delay(delayMs);
		} catch (error) {
			console.error(`Error in iteration ${i + 1}:`, error);
		}
	}
	indicator.update(account.index, iterations);
}

async function main() {
	const proposalAddress = process.env.PROPOSAL || await getProposalAddress();

	const iterations = 256;
	const indicator = new Indicator(iterations);

	console.log("\n".repeat(4));

	const accounts = await hre.viem.getWalletClients();

	// Perform actions in parallel for multiple accounts
	await Promise.all([
		performActions(accounts[1], 200, true, proposalAddress, iterations, 2000, indicator),
		performActions(accounts[2], 150, false, proposalAddress, iterations, 3500, indicator),
		performActions(accounts[3], 300, true, proposalAddress, iterations, 2500, indicator),
		performActions(accounts[4], 1000, false, proposalAddress, iterations, 3000, indicator),
	]);

	console.log("シミュレーションが完了しました。");
}

main()
.then(() => process.exit(0))
.catch(error => {
	console.error("Error:", error);
	process.exit(1);
});
