'use client';

import React, { useState } from 'react';
import { ethers } from 'ethers';

interface Props {
  signer: ethers.Signer | null; // 既に接続済みのウォレットの Signer
}

const TransactionSender: React.FC<Props> = ({ signer }) => {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendTransaction = async () => {
    if (!signer) {
      alert('Wallet is not connected.');
      return;
    }

    if (!to || !amount) {
      alert('Recipient address and amount are required.');
      return;
    }

    try {
      setError(null);

      // トランザクションデータを構築
      const tx = {
        to,
        value: ethers.parseEther(amount), // ETH → Wei に変換
        gasLimit: 21000, // シンプルな ETH 転送の場合
      };

      // トランザクション送信
      const txResponse = await signer.sendTransaction(tx);
      setTxHash(txResponse.hash);

      console.log('Transaction sent:', txResponse);
    } catch (err: any) {
      console.error('Transaction failed:', err);
      setError(err.message || 'Transaction failed');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Send Transaction</h2>

      {/* 送信先アドレス */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">To Address</label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="0xRecipientAddress"
        />
      </div>

      {/* 送信額 */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">Amount (ETH)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="0.01"
        />
      </div>

      {/* 送信ボタン */}
      <button
        onClick={sendTransaction}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Send Transaction
      </button>

      {/* トランザクション結果 */}
      {txHash && (
        <p className="mt-4 text-sm text-gray-700">
          Transaction Hash:{' '}
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {txHash}
          </a>
        </p>
      )}

      {/* エラー */}
      {error && <p className="mt-2 text-sm text-red-500">Error: {error}</p>}
    </div>
  );
};

export default TransactionSender;
