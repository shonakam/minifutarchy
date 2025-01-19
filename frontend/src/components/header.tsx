'use client';

import React from 'react';
import Link from 'next/link';
import WalletConnectButton from './wallet/WalletConnectButton';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white shadow-lg fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            {/* ロゴ画像 */}
            <img src="/image.png" alt="" className="h-14 w-14 mr-2" />
            {/* タイトル */}
            <Link href="/" className="text font-bold">
              Mini <br/> Futarchy
            </Link>
          </div>
          {/* Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link href="/" className="text-sm font-medium hover:text-gray-300">
              Home
            </Link>
            <Link href="/submit" className="text-sm font-medium hover:text-gray-300">
              submit
            </Link>
            <Link href="/market" className="text-sm font-medium hover:text-gray-300">
              market
            </Link>
            <Link href="/sample" className="text-sm font-medium hover:text-gray-300">
              sample
            </Link>
          </nav>
          {/* Wallet Connect Button */}
          <div>
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
