'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { shortenDescription } from '@/utils/shortenDescription';

const ProposalTile: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  const router = useRouter();

  const startTime = Number(proposal.start) * 1000;
  const duration = Number(proposal.duration) * 1000;
  const endTime = startTime + duration;
  const description = shortenDescription(proposal.description);

  return (
    <div
      className="proposal-tile bg-blue-900 bg-opacity-60 rounded-lg shadow-md p-6 
        hover:bg-opacity-80 hover:shadow-lg transition-shadow cursor-pointer w-full max-w-4xl mx-auto"
      onClick={() => router.push(`/market/${proposal.proposalAddress.toString()}`)}
    >
      <h2 className="text-2xl font-bold text-white mb-4">{proposal.title}</h2>
      <p className="text-gray-300 text-lg mb-6">{description}</p>
      <div className="flex justify-between items-center text-gray-300 space-x-8 mb-4">
        <span className="text-sm">
          <strong>Submitted by:</strong> {proposal.submitter}
        </span>
        <span className="text-sm">
          <strong>Start:</strong> {new Date(startTime).toLocaleString()}
        </span>
        <span className="text-sm">
          <strong>End:</strong> {new Date(endTime).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default ProposalTile;
