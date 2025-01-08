import { useState, useEffect, useCallback } from 'react';
import { Proposal } from '@/types/proposal'

const useFetchProposal = (id: string) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // ローディング状態

  const fetchProposal = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
	  alert(id);
      const response = await fetch(`/api/proposals/${Number(id)}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`データの取得に失敗しました: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const data: Proposal = await response.json(); // Proposal型として型アサーション
      setProposal(data);
    } catch (err) {
      console.error('Error fetching proposal:', err);
      setError('データの取得に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  return { proposal, error, loading }; // Proposal型のデータを返す
};

export default useFetchProposal;
