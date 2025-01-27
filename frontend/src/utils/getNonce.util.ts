import { ethers } from 'ethers';

export async function getNonce(): Promise<number> {
	const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
	const signer = await provider.getSigner();
	const nonce = await provider.getTransactionCount(signer.address)

	return nonce;
}