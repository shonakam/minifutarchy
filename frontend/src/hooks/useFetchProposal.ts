import { useState, useEffect, useCallback } from 'react';
import { Policy, Option } from '../types/vote';

const useFetchProposal = (id: string) => {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicy = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(`/api/proposals/${id}`);
      if (!response.ok) {
        throw new Error('政策データの取得に失敗しました。');
      }
      const data = await response.json();
      setPolicy(data.policy);
      setOptions(data.options);
    } catch (err) {
      console.error('Error fetching policy:', err);
      setError('政策データの取得に失敗しました。もう一度お試しください。');
    }
  }, [id]);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  return { policy, options, setOptions, error };
};

export default useFetchProposal;
