'use client';

interface ProposalCardProps {
	title: string;
	proposer: string;
	collateral: string;
	start: string;
	end: string;
	description: string;
  }
  
const ProposalCard: React.FC<ProposalCardProps> = (
	{ title, proposer, collateral, start, end, description }
) => {
	return (
	  <div className="bg-gray-800 text-white rounded-lg p-4 shadow-lg">
		<h3 className="text-xl font-bold mb-2">{title}</h3>
		<p className="text-sm text-gray-400 mb-1">Proposer: {proposer}</p>
		<p className="text-sm text-gray-400 mb-1">Collateral: {collateral}</p>
		<p className="text-sm text-gray-400">Start: {start}</p>
		<p className="text-sm text-gray-400 mb-2">End: {end}</p>
		<p className="text-sm">{description}</p>
	 </div>
	);
  };
  
  export default ProposalCard;
  