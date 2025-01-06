import { ProposalRegister } from '@/types/proposal';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/client/supabase';

function validator(body: { title?: string; description?: string }) {
	if (!body.title) throw new Error("タイトルがありません");
	if (!body.description) throw new Error("説明がありません");
}

async function create(body: ProposalRegister) {
	const { data, error } = await supabaseClient.from('proposals').insert([
		{
			title: body.title,
			description: body.description,
			tags: body.tags || [],
			author_id: body.author_id || 'ANONYMOUS',
		},
	]);

	if (error) {
		console.error('Supabase Error:', error.message);
		throw new Error(`データベース登録に失敗しました: ${error.message}`);
	}

	return data;
}

export async function POST(request: NextRequest) {
	try {
		const body: ProposalRegister = await request.json();

		validator(body);
		const data = await create(body);

		return NextResponse.json(
			{ message: 'プロポーザルが正常に登録されました', data },
			{ status: 201 }
		);
	} catch (error) {
		return NextResponse.json(
			{ error: `プロポーザル登録に失敗しました: ${error}` },
			{ status: 500 }
		)
	}
}
