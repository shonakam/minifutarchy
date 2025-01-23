'use client';

import { useParams } from 'next/navigation';
import React, {useState, useEffect, useRef} from 'react';
import Chart from '../../../components/chart/ChartWithVotePressure';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingScreen from '@/components/Loading';

const MarketById: React.FC = () => {
  const { id } = useParams();
  const [polling, setPolling] = useState<NodeJS.Timeout | null>(null);
  const [votes, setVotes] = useState<number[]>([0, 0]);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProposalData = async () => {
    try {
      const response = await fetch(`/api/proposal/${id}/hardhat/data`, { method: 'GET' });
      if (!response.ok) throw new Error(`Failed to fetch proposal data: ${response.statusText}`);
      const { data } = await response.json();
      setProposal(data);
    } catch (error) {
      console.error('Error fetching proposal data:', error);
      setError('Failed to fetch proposal data.');
    }
  };

  const fetchVoteData = async () => {
    const response = await fetch(`/api/proposal/${id}/hardhat`, { method: 'GET' });
    if (!response.ok) throw new Error(`Failed to fetch votes: ${response.statusText}`);
    const { data } = await response.json();
    setVotes([Number(data[0]), Number(data[1])]);
  };

  useEffect(() => {
    fetchProposalData();
    if (polling) {
      clearInterval(polling);
      setPolling(null);
    }
    const intervalId = setInterval(() => {
      fetchVoteData();
    }, 1000); 
    setPolling(intervalId);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // if (loading) return <LoadingScreen />
  if (error) return <ErrorMessage message={error}/>

  return (
    <div className="min-h-screen flex items-center justify-center">
        <Chart proposal={proposal} yes={votes[0]} no={votes[1]} />
    </div>
  );
};

export default MarketById;
