import { NextResponse } from 'next/server';
import ProposalFactoryABI from '@/_artifacts/contracts/futarchy/factory/ProposalFactory.sol/ProposalFactory.json';
import { ethers } from 'ethers';

type Response = [string, string, string, string, string, bigint, bigint, string];

export async function GET() {
  try {
    const hardhatEndpoint = process.env.NEXT_PUBLIC_HARDHAT_ENDPOINT || "";

    const provider = new ethers.JsonRpcProvider(hardhatEndpoint);
    const contract = new ethers.Contract(
      "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9",
      ProposalFactoryABI.abi,
      provider
    );

    const batchSize = 20;
    const totalProposals = await contract.nextProposalId();
    let proposals: Response[] = [];
    for (let s = 0; s < totalProposals; s += batchSize) {
      const e = Math.min(s + batchSize, Number(totalProposals));
      const batch: Response[] = await contract.getProposalDetailsInRange(s, e);
      proposals.push(...batch);
    }

    const proposalsFormat = proposals.map((proposal, id) => ({
      id: id,
      submitter: proposal[0] as `0x${string}`,
      proposalAddress: proposal[1] as `0x${string}`,
      title: proposal[2],
      description: proposal[3],
      threshold: proposal[4],
      start: proposal[5].toString(),
      duration: proposal[6].toString(),
      collateralAddress: proposal[7] as `0x${string}`,
    }))

    provider.destroy();
    return NextResponse.json(
      { message: 'プロポーザル一覧を取得しました', data: proposalsFormat },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
			{ error: `プロポーザルリスト取得に失敗しました: ${error}` },
			{ status: 500 }
		)
  }
}