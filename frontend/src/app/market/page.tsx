'use client';
import { useEffect, useState } from 'react';
import ProposalTile from '@/components/ProposalTile';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingScreen from '@/components/Loading';

const ProposalsPage = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const network = 'hardhat';
        const response = await fetch(`/api/proposal/list/${network}`, { method: 'GET' });

        if (!response.ok)
          throw new Error(`Failed to fetch proposals: ${response.statusText}`);

        const { data } = await response.json();
        const sortedProposals = data.sort((a: any, b: any) => b.id - a.id);

        setProposals(sortedProposals);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  if (loading) return <LoadingScreen />
  if (error) return <ErrorMessage message={error}/>

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-center mt-16 mb-6 text-white">MINI FUTARCHY🦄</h1>
      <div className="flex flex-col items-center space-y-6">
        {proposals.map((proposal) => (
          <ProposalTile key={proposal.id} proposal={proposal} />
        ))}
      </div>
    </div>
  );
};

export default ProposalsPage;
