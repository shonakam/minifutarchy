'use client';

interface ProposalCardProps {
	title: string;
	proposer: string;
	duration: string;
	description: string;
  }
  
  const ProposalCard: React.FC<ProposalCardProps> = ({ title, proposer, duration, description }) => {
	return (
	  <div className="bg-gray-800 text-white rounded-lg p-4 shadow-lg">
		<h3 className="text-xl font-bold mb-2">{title}</h3>
		<p className="text-sm text-gray-400 mb-1">Proposer: {proposer}</p>
		<p className="text-sm text-gray-400 mb-4">Duration: {duration}</p>
		<p className="text-sm">{description}</p>
	  </div>
	);
  };
  
  export default ProposalCard;
  