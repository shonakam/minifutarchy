'use client';

import { useParams } from 'next/navigation';
import React, {useState, useEffect} from 'react';
import Chart from '../../../components/chart/ChartWithVotePressure';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingScreen from '@/components/Loading';

const MarketById: React.FC = () => {
  const { id } = useParams();
  const [votes, setVotes] = useState<number[]>([0, 0]); // [yesVotes, noVotes]
	const [noVotes, setNoVotes] = useState(22500); // NOの初期値
  const [proposal, setProposal] = useState<Proposal>();
  const [selectedOption, setSelectedOption] = useState<'support' | 'oppose' | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [currentProposal, setCurrentProposal] = useState();
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateVotes = async () => {
      try {
        const response = await fetch(`/api/proposal/${id}/hardhat`, { method: 'GET' });

        if (!response.ok)
          throw new Error(`Failed to fetch proposal: ${response.statusText}`);
        const { data } = await response.json();

        setVotes([Number(data[0]), Number(data[1])]);
      } catch (err) {
        setError("");
      }
      // const newYesVotes = Math.max(20000, votes[0] + Math.floor(Math.random() * 100 - 50));
      // const newNoVotes = Math.max(20000, votes[1] + Math.floor(Math.random() * 100 - 50));
    };
    const interval = setInterval(updateVotes, 10000);
    return () => clearInterval(interval);
  }, [votes[0], votes[1]]);


  // if (loading) return <LoadingScreen />
  if (error) return <ErrorMessage message={error}/>

  return (
    <div className="min-h-screen flex items-center justify-center">
        <Chart proposal={null} yes={votes[0]} no={votes[1]} />
    </div>
  );
};

export default MarketById;
