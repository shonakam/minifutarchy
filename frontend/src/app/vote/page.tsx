'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // App Router用のRouter
import { Proposal } from '@/types/proposal';

const ProposalsPage = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // App Routerのルーター

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch('/api/proposals/list', { method: 'GET' });

        if (!response.ok) {
          throw new Error(`Failed to fetch proposals: ${response.statusText}`);
        }

        const { data } = await response.json();
        setProposals(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">MINI FUTARCHY🦄</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/vote/${proposal.id.toString()}`)} // 動的遷移
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{proposal.title}</h2>
            <p className="text-gray-600 mb-4">{proposal.description}</p>
            <div className="flex justify-between items-center text-gray-700 mb-2">
              <div className="flex items-center">
                <span className="font-bold text-green-600 mr-2">{proposal.support}</span>
                <span>support</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-red-600 mr-2">{proposal.oppose}</span>
                <span>oppose</span>
              </div>
            </div>
            <small className="text-gray-500">
              Created At: {new Date(proposal.created_at).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProposalsPage;
