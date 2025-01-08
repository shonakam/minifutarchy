import { Proposal } from '@/types/proposal';
import { NextResponse } from 'next/server';
import { supabaseClient } from '@/client/supabase';

export const revalidate = 60 * 60;

async function read(): Promise<Proposal[]>{
  const { data, error } = await supabaseClient.from('proposals').select('*');

  if (error) {
    console.error('Supabase Error:', error.message);
    throw new Error(`データベース取得に失敗しました: ${error.message}`);
  }

  return data || [];
}

export async function GET() {
  try {
    const proposals = await read();
    return NextResponse.json(
      { message: 'プロポーザル一覧を取得しました', data: proposals },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
			{ error: `プロポーザルリスト取得に失敗しました: ${error}` },
			{ status: 500 }
		)
  }
}