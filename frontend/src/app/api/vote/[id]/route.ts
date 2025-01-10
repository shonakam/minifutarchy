import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/client/upstash';
// import { getSocketServer } from '@/client/socket';

function validator(data: any) {
	const { proposalId, optionId, amount } = data;
	if (!proposalId) return { isValid: false, message: '提案IDが無効です。' };
	if (!optionId) return { isValid: false, message: 'オプションIDが無効です。' };
	if (typeof amount !== 'number' || amount <= 0)
		return { isValid: false, message: '投票数は正の数値で指定してください。' };
	return { isValid: true };
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { vote } = await request.json();

  if (!['support', 'oppose'].includes(vote)) {
    return NextResponse.json(
      { error: { code: 400, message: 'Invalid vote option' } },
      { status: 400 }
    );
  }

  // Upstash Redisで投票データを更新
  // await redis.hincrby(`proposal:${id}`, vote, 1);

  // 更新後のデータを取得
  const updatedProposal = await redis.hgetall(`proposal:${id}`);

  // WebSocketでルームに通知
  // const io = getSocketServer()
  // io.to(id).emit('updateProposal', updatedProposal);

  return NextResponse.json(updatedProposal);
}
