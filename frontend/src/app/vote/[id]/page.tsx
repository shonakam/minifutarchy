'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // 動的ルートのパラメータ取得
import VoteChart from '../../../components/Chart';
import { Policy, Option } from '../../../types/vote';

const VotePage: React.FC = () => {
  const { id } = useParams(); // 動的ルートの ID を取得
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // IDに基づいてデータを取得
  useEffect(() => {
    async function fetchPolicy() {
      try {
        const response = await fetch(`/api/policy/${id}`); // 政策IDに基づくAPI呼び出し
        const data = await response.json();
        setPolicy(data.policy);
        setOptions(data.options);
      } catch (error) {
        console.error('Error fetching policy:', error);
      }
    }
    fetchPolicy();
  }, [id]);

  // 投票処理
  const handleVote = async () => {
    if (!selectedOption) {
      alert('選択肢を選んでください。');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ policyId: id, optionId: selectedOption }),
      });

      if (response.ok) {
        const updatedOptions = await response.json();
        setOptions(updatedOptions.options);
        alert('投票が完了しました！');
      } else {
        alert('投票に失敗しました。');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">投票ページ</h1>
      {policy && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{policy.title}</h2>
          <p>{policy.description}</p>
        </div>
      )}

      {options.length > 0 ? (
        <>
          <VoteChart options={options} />
          <div className="mt-4">
            <h3 className="text-lg font-semibold">選択肢を選んでください:</h3>
            {options.map((option) => (
              <div key={option.id} className="mb-2">
                <label>
                  <input
                    type="radio"
                    name="voteOption"
                    value={option.id}
                    onChange={() => setSelectedOption(option.id)}
                  />
                  {option.name} ({option.votes}票)
                </label>
              </div>
            ))}
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleVote}
              disabled={loading}
            >
              {loading ? '投票中...' : '投票する'}
            </button>
          </div>
        </>
      ) : (
        <p>投票情報を取得中...</p>
      )}
    </div>
  );
};

export default VotePage;
