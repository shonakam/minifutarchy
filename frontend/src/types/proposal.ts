export type ProposalStatus = 'open' | 'voting' | 'closed';
export type ProposalResult = 'support' | 'oppose' | 'undefind';

export interface ProposalRegister {
  title: string;
  description: string;
  tags?: string[];
  author_id: string;
}

export interface Proposal extends ProposalRegister {
  id: number;
  created_at: string;
  support: number;
  oppose: number;
  result: ProposalResult;
  status: ProposalStatus;
  voting_started_at?: string;
  voting_ended_at?: string;
}