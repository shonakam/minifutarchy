'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import useFetchProposal from '../../../hooks/useFetchProposal';
import useWebSocket from '../../../hooks/useWebSocket';
import ErrorMessage from '../../../components/ErrorMessage';
import VoteChart from '../../../components/Chart';

const VotePage: React.FC = () => {
  const { id } = useParams();
  const { policy, options, setOptions, error } = useFetchProposal(id as string);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  // WebSocket接続
  useWebSocket('ws://localhost:8080', (updatedOptions) => {
    console.log(updatedOptions);
    setOptions(updatedOptions);
  });

  const handleVote = async () => {
    if (!selectedOption) {
      alert('選択肢を選んでください。');
      return;
    }

    setLoading(true);
    setVoteError(null);

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ policyId: id, optionId: selectedOption }),
      });

      if (!response.ok) {
        throw new Error('投票に失敗しました。');
      }

      const updatedOptions = await response.json();
      setOptions(updatedOptions.options); // サーバーからの更新後データを適用

      alert('投票が完了しました！');
    } catch (err: any) {
      console.error('投票エラー:', err);
      setVoteError(err.message || 'エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">投票ページ</h1>

      {/* エラーメッセージの表示 */}
      <ErrorMessage message={error || voteError} />

      {/* 政策情報の表示 */}
      {policy ? (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{policy.title}</h2>
          <p>{policy.description}</p>
        </div>
      ) : (
        <p>政策データを取得中...</p>
      )}

      {/* 投票選択肢の表示 */}
      {options.length > 0 ? (
        <>
          <VoteChart options={options} />
          <div className="mt-4">
            <h3 className="text-lg font-semibold">選択肢を選んでください:</h3>
            {options.map((option) => (
              <div key={option.id} className="mb-2">
                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="radio"
                    name="voteOption"
                    value={option.id}
                    onChange={() => setSelectedOption(option.id)}
                    className="cursor-pointer"
                    disabled={loading}
                  />
                  <span>{option.name} ({option.votes}票)</span>
                </label>
              </div>
            ))}
            <button
              className={`mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleVote}
              disabled={loading}
            >
              {loading ? '投票中...' : '投票する'}
            </button>
          </div>
        </>
      ) : !error && policy ? (
        <p>選択肢を取得中...</p>
      ) : null}
    </div>
  );
};

export default VotePage;
