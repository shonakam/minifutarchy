import { NextResponse } from 'next/server';
import { redis } from '@/client/upstash';
import { supabaseClient } from '@/client/supabase';

export async function GET() {
  try {
    const policyKeys = await redis.keys('policy:*:votes');

	for (const key of policyKeys) {
		const policyId = key.split(':')[1];
		const votes = await redis.hgetall(key) as Record<string, string>;

		for (const optionId in votes) {
			const voteCount = parseInt(votes[optionId]);

			await supabaseClient
				.from('votes')
				.upsert({ policy_id: policyId, option_id: optionId, votes: voteCount });
		}

		await redis.del(key);
	}

    console.log('Redisの投票データをSupabaseに反映しました。');
    return NextResponse.json({ message: '同期が完了しました。' }, { status: 200 });
  } catch (error) {
    console.error('RedisからSupabaseへの同期中にエラーが発生しました:', error);
    return NextResponse.json({ error: '同期に失敗しました。' }, { status: 500 });
  }
}
