import { NextResponse, NextRequest } from 'next/server';
import ProposalABI from 
  '/Users/cyanea/Documents/builds/minifutarchy/contract/artifacts/contracts/futarchy/target/Proposal.sol/Proposal.json';
import { ethers } from 'ethers';

type Response = [string, string, string, bigint, bigint, string];

interface Proposal {
	id: number;
	submitter: `0x${string}`;
	proposalAddress: `0x${string}`;
	title: string;
	description: string;
	start: string;
	duration: string;
	collateralAddress: `0x${string}`;
  }
  

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    const address = (await params).id
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const contract = new ethers.Contract(address, ProposalABI.abi, provider);

    const [submitter, title, description, start, duration, collateralAddress]: [
      string, string, string, bigint, bigint, string
    ] = await contract.getProposalData();

    const data: Proposal = {
      id: 0,
      proposalAddress: address as `0x${string}`,
      submitter: submitter as `0x${string}`,
      title,
      description,
      start: start.toString(),
      duration: duration.toString(),
      collateralAddress: collateralAddress as `0x${string}`,
    };

    provider.destroy();
    return NextResponse.json(
      { message: 'プロポーザルの状態を取得しました', data: data },
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

