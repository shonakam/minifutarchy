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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartWithVotePressureProps {
  yes: number;  // YESの投票数
  no: number;   // NOの投票数
}

const ChartWithVotePressure: React.FC<ChartWithVotePressureProps> = ({ yes, no }) => {
  const [voteYes, setVoteYes] = useState(yes);
  const [voteNo, setVoteNo] = useState(no);
  const [totalVotes, setTotalVotes] = useState(yes + no); // 投票総数
  const [sliderValue, setSliderValue] = useState(0); // スライダーの値（担保トークンの amount）
  const [sliderMax, setSliderMax] = useState(100); // スライダーの上限値
  const [voteChoice, setVoteChoice] = useState<'yes' | 'no'>('yes'); // スイッチの選択値
  const [redeemChoice, setRedeemChoice] = useState<'yes' | 'no'>('yes');

  // 投票圧力を計算 (-1 ~ 1)
  const votePressure = totalVotes > 0 ? (voteYes - voteNo) / totalVotes : 0;

  // 数直線上の幅を計算
  const barWidthPercentage = Math.abs(votePressure) * 50; // 正負に関係なくバーの幅 (50% で最大)
  const barStartPosition = votePressure >= 0 ? 50 : 50 - barWidthPercentage; // 中央を基準に計算

  useEffect(() => {
    setVoteYes(yes);
    setVoteNo(no);
    setTotalVotes(yes + no);
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
    const newMax = Math.max(1, parseInt(e.target.value) || 1); // 最小値は1
    setSliderMax(newMax);
    setSliderValue(0); // 上限を変更したらスライダーをリセット
  };

  const handleVoteRequest = () => {
    console.log('Vote request sent:', {
      voteChoice,
      amount: sliderValue,
    });
    alert(`Vote submitted:\nChoice: ${voteChoice}\nAmount: ${sliderValue}`);
  };

  const handleRedeemRequest = () => {
    console.log('Vote request sent:', {
      redeemChoice,
      amount: sliderValue,
    });
    alert(`Vote submitted:\nChoice: ${voteChoice}\nAmount: ${sliderValue}`);
  };

  return (
    <div className="bg-gray-900 flex min-h-screen items-center justify-center text-white rounded">
      <div className="w-full max-w-4xl shadow-lg rounded-lg p-6">
        {/* 投票数の棒グラフ */}

        {/* ProposalCard */}
        <div className="mb-8">
          <ProposalCard
            title="Proposal for New Voting System"
            proposer="Alice Johnson"
            duration="7 days"
            description="This proposal aims to improve the current voting system by introducing new features and better scalability. The proposed changes include a dynamic slider mechanism and enhanced user feedback."
          />
        </div>

        <div className="mb-8 max-w-md mx-auto">
          <Bar data={data} options={optionsConfig} />
        </div>

        {/* 数直線メーター */}
        <h3 className="text-xl font-semibold text-center mb-10">VOTE PRESSURE {/* : {(votePressure * 100).toFixed(2)}% */}</h3>
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
        <div className="flex justify-between w-full max-w-2xl mt-2 mx-auto">
          <span className="text-sm text-gray-400">-100%</span>
          <span className="text-sm text-gray-400">0%</span>
          <span className="text-sm text-gray-400">100%</span>
        </div>

        {/* スライダーと調整要素 */}
        <div className="flex flex-col justify-between items-center w-full gap-1">
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
              checked={voteChoice === 'yes'}
              onChange={() => setVoteChoice('yes')}
              className="hidden"
            />
            <span
              className={`cursor-pointer flex items-center justify-center px-4 py-2 rounded w-24 h-10 ${
                voteChoice === 'yes' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
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
              checked={voteChoice === 'no'}
              onChange={() => setVoteChoice('no')}
              className="hidden"
            />
            <span
              className={`cursor-pointer flex items-center justify-center px-4 py-2 rounded w-24 h-10 ${
                voteChoice === 'no' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              NO
            </span>
          </label>
        </div>

        {/* Vote & Redeem ボタン */}
        <div className="flex flex-col justify-center mt-6 gap-x-4 gap-y-1">
          <button
            onClick={handleVoteRequest}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-1 text-sm rounded font-bold"
          >
            VOTE
          </button>
          <button
            onClick={handleRedeemRequest}
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
