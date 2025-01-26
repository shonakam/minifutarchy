import { NextRequest, NextResponse } from 'next/server';
import ExchangeABI from 
  '../../../../../../contract/artifacts/contracts/futarchy/Exchange.sol/Exchange.json';
import { ethers } from 'ethers';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const proposal = params.id;
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const contract = new ethers.Contract(
      "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0", ExchangeABI.abi, provider
    );
    const { type, amount, position } = await request.json();

    console.log("here" ,type, amount, position)
    return 
    if (type === 'vote') {
      await contract.vote(proposal, BigInt(amount), position);
    } else if (type === 'redeem') {
      await contract.redeem(proposal, BigInt(amount), position);
    }

    return NextResponse.json({status: 200});
  } catch {
    return NextResponse.json(
      { error: { code: 400, message: 'Invalid vote option' } },
      { status: 400 }
    );
  }
}
