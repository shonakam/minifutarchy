import { NextResponse, NextRequest } from 'next/server';
import ProposalABI from 
  '/Users/cyanea/Documents/builds/minifutarchy/contract/artifacts/contracts/futarchy/target/Proposal.sol/Proposal.json';
import { ethers } from 'ethers';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    const address = (await params).id
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const contract = new ethers.Contract(
      address, ProposalABI.abi, provider
    );

    const response: [bigint, bigint] = await contract.getMarketReserves()
    let votes = [];
    votes[0] = response[0].toString()
    votes[1] = response[1].toString();

    console.log(votes)

    return NextResponse.json(
      { message: 'プロポーザルの状態を取得しました', data: votes },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: { code: 500, message: 'プロポーザルの状態の取得に失敗しました' } },
      { status: 400 }
    );
  }
}

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
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
}

