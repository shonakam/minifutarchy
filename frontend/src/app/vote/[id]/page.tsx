'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import useFetchProposal from '../../../hooks/useFetchProposal';
import ErrorMessage from '../../../components/ErrorMessage';
import VoteChart from '../../../components/Chart';

const VotePage: React.FC = () => {
  const { id } = useParams();
  const { proposal, error, loading } = useFetchProposal(id as string);
  const [selectedOption, setSelectedOption] = useState<'support' | 'oppose' | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState<boolean>(false);

  const handleVote = async () => {
    if (!selectedOption) {
      alert('選択肢を選んでください。');
      return;
    }

    setVoteError(null);
    setIsVoting(true);

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ policyId: id, vote: selectedOption }),
      });

      if (!response.ok) {
        throw new Error('投票に失敗しました。');
      }

      const updatedProposal = await response.json();
      alert('投票が完了しました！');

      // 投票後のデータ更新
      if (proposal) {
        proposal.support = updatedProposal.support; // 賛成の票数を更新
        proposal.oppose = updatedProposal.oppose; // 反対の票数を更新
      }
    } catch (err: any) {
      console.error('投票エラー:', err);
      setVoteError(err.message || 'エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <ErrorMessage message={error} />;
  if (!proposal) return <p>No proposal found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">投票ページ</h1>

      {/* エラーメッセージの表示 */}
      <ErrorMessage message={voteError} />

      {/* 政策情報の表示 */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{proposal.title}</h2>
        <p>{proposal.description}</p>
      </div>

      {/* 投票選択肢の表示 */}
      <VoteChart support={proposal.support} oppose={proposal.oppose} />
      <div className="mt-4">
        <h3 className="text-lg font-semibold">選択肢を選んでください:</h3>
        <div className="mb-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="radio"
              name="voteOption"
              value="support"
              onChange={() => setSelectedOption('support')}
              className="cursor-pointer"
              disabled={isVoting}
            />
            <span>賛成 ({proposal.support}票)</span>
          </label>
        </div>
        <div className="mb-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="radio"
              name="voteOption"
              value="oppose"
              onChange={() => setSelectedOption('oppose')}
              className="cursor-pointer"
              disabled={isVoting}
            />
            <span>反対 ({proposal.oppose}票)</span>
          </label>
        </div>
        <button
          className={`mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${
            isVoting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleVote}
          disabled={isVoting}
        >
          {isVoting ? '投票中...' : '投票する'}
        </button>
      </div>
    </div>
  );
};

export default VotePage;
