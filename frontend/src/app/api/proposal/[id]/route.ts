import { NextResponse, NextRequest } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    
    return NextResponse.json(
      { message: 'プロポーザル一覧を取得しました', data: "" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: { code: 400, message: 'Invalid proposal ID' } },
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

