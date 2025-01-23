// import { ethers } from 'ethers';
// import { withRetry } from './retry.util';

// // プロバイダーインスタンスを保持する変数
// let provider: ethers.JsonRpcProvider | null = null;

// /**
//  * プロバイダーを生成または取得
//  * @param rpcUrl - RPCのURL
//  */
// export async function createProvider(rpcUrl: string = 'http://127.0.0.1:8545'): Promise<ethers.JsonRpcProvider> {
//   if (provider) {
//     console.log('Using existing provider...');
//     return provider;
//   }

//   try {
//     // プロバイダーの生成をリトライ付きで実行
//     provider = await withRetry(
//       async () => new ethers.JsonRpcProvider(rpcUrl),
//       5, // 最大リトライ回数
//       1000 // リトライ間隔 (ms)
//     );

//     console.log('Provider created successfully');
//     return provider;
//   } catch (error) {
//     console.error('Failed to create provider:', error);
//     provider = null; // 失敗した場合は破棄
//     throw error; // 呼び出し元にエラーを伝搬
//   }
// }

// /**
//  * プロバイダーを破棄
//  */
// export function resetProvider(): void {
//   console.log('Resetting provider...');
//   provider = null;
// }
