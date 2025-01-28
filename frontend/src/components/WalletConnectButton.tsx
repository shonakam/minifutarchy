'use client';

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { shortenAddress } from '../utils/shortenAddress';

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider & {
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

const WalletConnectButton: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Ethereum-compatible wallet.');
      return;
    }

    try {
      setIsConnecting(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAddress(accounts[0]);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return; // 'undefined' の場合は処理をスキップ

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(null);
        alert('Wallet disconnected.');
      } else {
        setAddress(accounts[0]);
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log(`Chain changed to ${chainId}`);
    };

    // イベントリスナーを追加
    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      // クリーンアップ: イベントリスナーを削除
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {address ? (
        <div className="text-center">
          <p className="text-sm text-gray-300">Connected to:</p>
          <p className="font-bold text-lg text-white">{shortenAddress(address)}</p>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
};

export default WalletConnectButton;
