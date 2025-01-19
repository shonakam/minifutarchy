'use client';

import React from 'react';

interface VoteButtonsProps {
  onVote: (type: 'yes' | 'no') => void;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({ onVote }) => {
  return (
    <div className="flex justify-center gap-4 mb-8">
      <button
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        onClick={() => onVote('yes')}
      >
        YES
      </button>
      <button
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        onClick={() => onVote('no')}
      >
        NO
      </button>
    </div>
  );
};

export default VoteButtons;
