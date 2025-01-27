import { ethers } from 'ethers';

export async function sendTx(
	address: string,
	abi: any[],
	selector: string,
	args: any[],
	_nonce: number,
	_gasLimit: bigint = ethers.toBigInt(500000),
): Promise<{ receipt: ethers.TransactionReceipt; events: any[]; }> {
	try {
		const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
		const signer = await provider.getSigner();
		const contract = new ethers.Contract(address, abi, signer);
		const options: ethers.TransactionRequest = { gasLimit: _gasLimit, nonce: _nonce }
		
		const tx = await contract[selector](...args, options);
		const receipt = await tx.wait();

		const events = receipt.logs.map((log: any) => {
			try {
				return contract.interface.parseLog(log);
			} catch (err) {
				return null;
			}
		}).filter((event: any) => event !== null);

		return {receipt, events};
	} catch (err) {
		throw new Error(`Transaction failed: ${err}`);
	}
}