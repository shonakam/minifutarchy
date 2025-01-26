'use client';

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import Slider from './Slider';
import ProposalCard from './ProposalCard';

import { ethers } from 'ethers';
import proposalFactory from "@/constants/abis/factory/ProposalFactory.sol/ProposalFactory.json"
import ProposalABI from '../../../../contract/artifacts/contracts/futarchy/target/Proposal.sol/Proposal.json';
import ExchangeABI from 
  '../../../../contract/artifacts/contracts/futarchy/Exchange.sol/Exchange.json';
import CollateralABI from 
  '../../../../contract/artifacts/contracts/futarchy/CollateralMock.sol/CollateralMock.json';


ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartWithVotePressureProps {
  proposal: Proposal | null;
  yes: number;
  no: number;
}

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider & {
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

const ChartWithVotePressure: React.FC<ChartWithVotePressureProps> = ({ proposal, yes, no }) => {
  const [voteYes, setVoteYes] = useState(yes);
  const [voteNo, setVoteNo] = useState(no);
  const [userBalance, setUserBalance] = useState([0, 0 ,0])
  const [totalVotes, setTotalVotes] = useState(yes + no);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderMax, setSliderMax] = useState(100);
  const [position, setPosition] = useState<'yes' | 'no'>('yes');
  // const [type, setType] = useState<'vote' | 'redeem'>('vote');

  const votePressure = totalVotes > 0 ? (voteYes - voteNo) / totalVotes : 0;

  const startTime = Number(proposal?.start) * 1000;
  const duration = Number(proposal?.duration) * 1000;
  const endTime = startTime + duration;

  const barWidthPercentage = Math.abs(votePressure) * 50;
  const barStartPosition = votePressure >= 0 ? 50 : 50 - barWidthPercentage;

  useEffect(() => {
    setVoteYes(yes);
    setVoteNo(no);
    setTotalVotes(yes + no);
    try {
      async function fetchBalance() {
        if (!proposal?.proposalAddress) return
        const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
        console.log(await provider.getSigner())
        const taraget = new ethers.Contract(proposal?.proposalAddress!, ProposalABI.abi, provider);
        const response = await taraget.getUserBalances(await provider.getSigner());
        setUserBalance([
          Number(response[0]), Number(response[1]), Number(response[2])
        ])
      }
      fetchBalance();
    } catch {}
  }, [yes, no]);

  // 棒グラフのデータ
  const data = {
    labels: ['YES', 'NO'],
    datasets: [
      {
        label: '投票数',
        data: [voteYes, voteNo],
        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const optionsConfig = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(Math.round(value * sliderMax));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(1, parseInt(e.target.value) || 1);
    setSliderMax(newMax);
    setSliderValue(0);
  };

  const handleOrder = async (type: 'vote' | 'redeem') => {
    console.log('Vote request sent:', { type, position, amount: ethers.toBigInt(sliderValue), });
    console.log()
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const collateral = new ethers.Contract(
        "0x5fbdb2315678afecb367f032d93f642f64180aa3",
        CollateralABI.abi, signer
      );
      const exchange = new ethers.Contract(
        "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0",
        ExchangeABI.abi, signer
      );

      const nonce = await provider.getTransactionCount(signer.address);
      let tx;
      const pos = position == 'yes' ? true : false;
      if (type == 'vote') {
        tx = await collateral.approve(
          "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0", BigInt(sliderValue),
          {gasLimit: ethers.toBigInt(500000), nonce: nonce}
        );
        await tx.wait();
        tx = await exchange.vote(
          proposal?.proposalAddress, BigInt(sliderValue), pos,
          {gasLimit: ethers.toBigInt(500000), nonce: nonce+1}
        );
      } else if(type == 'redeem') {
        tx = await exchange.redeem(
          proposal?.proposalAddress, BigInt(sliderValue), pos,
          {gasLimit: ethers.toBigInt(500000), nonce: nonce}
        );
      }
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      alert(`${type} submitted:\nChoice: ${position}\nAmount: ${sliderValue}`);
    } catch (e) {
      console.log("Err:", e);
      alert("ERROR: This transaction reverted.")
    }
  };

  return (
    <div className="bg-gray-900 flex min-h-screen items-center justify-center text-white rounded">
      <div className="w-full max-w-4xl shadow-lg rounded-lg p-6">
        {/* 投票数の棒グラフ */}

        {/* ProposalCard */}
        <div className="mt-6 mb-2">
          <ProposalCard
            title={proposal?.title || "(NULL)"}
            proposer={proposal?.submitter || "(NULL)"}
            collateral={proposal?.collateralAddress || "(NULL)"}
            start={
              isNaN(new Date(startTime).getTime())
                ? "(NULL)"
                : new Date(startTime).toLocaleString()
            }
            end={
              isNaN(new Date(endTime).getTime())
                ? "(NULL)"
                : new Date(endTime).toLocaleString()
            }
            description={proposal?.description || "(NULL)"}
          />
        </div>

        <div className="mb-6 max-w-md mx-auto flex justify-center items-center">
          <Bar data={data} options={optionsConfig} />
          <div className="mt-4">
            <p className="text-sm text-gray-400">Your Balances:</p>
            <div className="flex justify-between">
            <span className="text-sm text-yellow-400">LP:</span>
            <span className="text-sm text-yellow-400">{userBalance[0] || 0}</span>
            </div>
            <div className="flex justify-between">
            <span className="text-sm text-green-400">YES:</span>
            <span className="text-sm text-green-400">{userBalance[1] || 0}</span>
            </div>
            <div className="flex justify-between">
            <span className="text-sm text-red-400">NO:</span>
            <span className="text-sm text-red-400">{userBalance[2] || 0}</span>
            </div>
          </div>
        </div>

        {/* 数直線メーター */}
        <h3 className="text-xl font-semibold text-center mb-8">VOTE PRESSURE {/* : {(votePressure * 100).toFixed(2)}% */}</h3>
        <div className="relative w-full max-w-2xl h-4 bg-gray-600 rounded-full mx-auto">
          {/* 投票圧力バー */}
          <div
            className={`absolute top-0 h-full ${votePressure >= 0 ? 'bg-green-500 rounded-r' : 'bg-red-500 rounded-l'} transition-all`}
            style={{
              left: `${barStartPosition}%`,
              width: `${barWidthPercentage}%`,
            }}
          />
          {/* 真ん中の線 */}
          <div className="absolute top-0 left-1/2 h-6 w-0.5 bg-white transform -translate-x-1/2"></div>
          {/* 矢印と数値 */}
          <div
            className="absolute -top-8 left-0 transform -translate-x-1/2"
            style={{ left: `${50 + votePressure * 50}%` }}
          >
            <div className="flex flex-col items-center">
              {/* 数値 */}
              <span className="text-sm text-white">{(votePressure * 100).toFixed(2)}%</span>
              {/* 矢印 */}
              <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-b-white"></div>
            </div>
          </div>
        </div>

        {/* ラベル (-100%, 0%, 100%) */}
        <div className="flex justify-between max-w-xl mt-2 mx-auto">
          <span className="text-sm text-gray-400">-100%</span>
          <span className="text-sm text-gray-400">0%</span>
          <span className="text-sm text-gray-400">100%</span>
        </div>

        {/* スライダーと調整要素 */}
        <div className="flex flex-col justify-between items-center w-full">
          {/* スライダー */}
          <Slider onChange={handleSliderChange} value={sliderValue / sliderMax} />
          <div className="flex justify-between w-full max-w-2xl items-center mt-2">
            {/* 左下の値 */}
            <span className="text-sm text-gray-400">{sliderValue + " Collateral"}</span>
            {/* 上限値の入力フィールド */}
            <input
              type="number"
              min="1"
              value={sliderMax}
              onChange={handleMaxChange}
              className="bg-gray-800 text-white text-center rounded px-2 py-1 w-20"
            />
          </div>
        </div>

        {/* スイッチ */}
        <div className="flex justify-center items-center mt-4 gap-x-8">
          <label className="flex items-center">
            <input
              type="radio"
              name="voteChoice"
              value="yes"
              checked={position === 'yes'}
              onChange={() => setPosition('yes')}
              className="hidden"
            />
            <span
              className={`cursor-pointer flex items-center justify-center px-4 py-2 rounded w-24 h-10 ${
                position === 'yes' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              YES
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="voteChoice"
              value="no"
              checked={position === 'no'}
              onChange={() => setPosition('no')}
              className="hidden"
            />
            <span
              className={`cursor-pointer flex items-center justify-center px-4 py-2 rounded w-24 h-10 ${
                position === 'no' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              NO
            </span>
          </label>
        </div>

        {/* Vote & Redeem ボタン */}
        <div className="flex flex-col justify-center mt-6 gap-x-4 gap-y-1">
          <button
            onClick={() => handleOrder('vote')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-1 text-sm rounded font-bold"
          >
            VOTE
          </button>
          <button
            onClick={() => handleOrder('redeem')}
            className="bg-gray-500 hover:bg-orange-400 text-white px-6 py-1 text-sm rounded font-bold"
          >
            REDEEM
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartWithVotePressure;
