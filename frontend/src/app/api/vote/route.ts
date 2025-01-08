import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/client/upstash';

function validator(data: any) {
	const { proposalId, optionId, amount } = data;
	if (!proposalId) return { isValid: false, message: '提案IDが無効です。' };
	if (!optionId) return { isValid: false, message: 'オプションIDが無効です。' };
	if (typeof amount !== 'number' || amount <= 0)
		return { isValid: false, message: '投票数は正の数値で指定してください。' };
	return { isValid: true };
}

export async function POST(req: NextRequest) {
  try {
	const body = await req.json();
    const validation = validator(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

	const { proposalId, optionId, amount } = body;
    const key = `policy:${proposalId}:votes`;

    await redis.hincrby(key, optionId, amount);
    const updatedVotes = await redis.hgetall(key);

    return NextResponse.json(
      { message: '投票が完了しました！', votes: updatedVotes },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating vote in Redis:', error);
    return NextResponse.json(
      { error: '投票処理中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
