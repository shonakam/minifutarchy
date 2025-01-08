import { NextResponse, NextRequest } from 'next/server';
import { mockProposalList } from '@/mock/proposals.mock';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) {
    return NextResponse.json(
      { error: { code: 400, message: 'Missing proposal ID in request' } },
      { status: 400 }
    );
  }

  const proposalId = parseInt(id, 10);

  if (isNaN(proposalId)) {
    return NextResponse.json(
      { error: { code: 400, message: 'Invalid proposal ID' } },
      { status: 400 }
    );
  }

  const proposal = mockProposalList.find((p) => p.id === proposalId);

  if (proposal) {
    return NextResponse.json(proposal);
  } else {
    return NextResponse.json(
      { error: { code: 404, message: 'Proposal not found' } },
      { status: 404 }
    );
  }
}
