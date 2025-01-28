'use client';

import { useState } from 'react';
import { sendTx } from '@/utils/sendTx.util';
import DurationAdjuster from '@/components/DurationAdjuster';
import Factory from '@/_artifacts/contracts/futarchy/factory/ProposalFactory.sol/ProposalFactory.json';
import Proposal from '@/_artifacts/contracts/futarchy/target/Proposal.sol/Proposal.json';
import Collateral from  '@/_artifacts/contracts/futarchy/CollateralMock.sol/CollateralMock.json'
import { getNonce } from '@/utils/getNonce.util';

export default function ProposingPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [threshold, setThreshold] = useState('');
  const [collateral, setCollateral] = useState<`0x${string}`>('0x');
  const [initLquidity, setInitLquidity] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  function isValidEthereumAddress(collateral: `0x${string}` | undefined) {
    if (!collateral) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(collateral);
  }

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEthereumAddress(collateral)) 
      return (alert("Invalid Collateral Address."))
    if (duration < 1) 
      return (alert("Invalid Duration."))
    if (initLquidity! < 5000) 
      return (alert("Invalid Initial Liquidity Value. Need over 5000"))

    const formData = [
      title, description, threshold, BigInt(duration), collateral
    ];

    try {
      setLoading(true)
      let nonce = await getNonce();

      const factory: `0x${string}` = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9"
      const { events: createEvent } = await sendTx(
        factory, Factory.abi, "createProposal", formData, nonce++, BigInt(1000000)
      );
      const proposal = createEvent[0].args[1]

      await sendTx(collateral, Collateral.abi, "approve", [proposal, BigInt(initLquidity!)], nonce++);
      await sendTx(proposal, Proposal.abi, "initializeLiquidity", [BigInt(initLquidity!)], nonce++);
      
      alert("submitted!")
      setLoading(false)
    } catch (e) {
      alert(`An error occurred: ${e}`);
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 mt-8">
      <div className="max-w-2xl w-full bg-gray-800 shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Submit a Market
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル入力 */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="e.g.: Expanding subsidies for small and medium-sized enterprises"
            //   required
            />
          </div>

          {/* 説明入力 */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="e.g.: This proposal aims to increase the GDP growth rate by 2% by introducing a tax incentive for SMEs."
              rows={4}
            //   required
            ></textarea>
          </div>

          {/*  閾値入力 */}
          <div>
            <label
              htmlFor="threshold"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Threshold
            </label>
            <input
              type="text"
              id="threshold"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="e.g.: Achieve a GDP growth rate of at least 2%"
            />
          </div>

          {/*  担保トークンアドレス入力 */}
          <div>
            <label
              htmlFor="collateral"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Collareral Address
            </label>
            <input
              type="text"
              id="collateral"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value as `0x${string}`)}
              className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="e.g.: 0x5fbdb2315678afecb367f032d93f642f64180aa3"
            />
          </div>

          {/*  初期流動性の提供  */}
          <div>
            <label
              htmlFor="initLiquidity"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Initial Liquidity
            </label>
            <input
              type="number"
              id="initLiqyuidity"
              value={initLquidity || ""}
              onChange={(e) => setInitLquidity(Number(e.target.value))}
              className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="e.g.: 50000"
            />
          </div>

            {/* Duration Adjuster */}
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Duration
            </label>
            <DurationAdjuster
              duration={duration}
              onChange={handleDurationChange}
            />
          </div>

          {/* 提案作成ボタン */}
          <button
            type="submit"
            className={`w-full flex items-center justify-center bg-blue-500 text-white font-bold rounded-lg px-4 py-3 transition-transform ${
              loading ? 'cursor-not-allowed bg-blue-300' : 'hover:scale-105'
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                作成中...
              </div>
            ) : (
              '提案を作成'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
