import { NextRequest, NextResponse } from 'next/server';

// 型定義
interface PolicyResponse {
  policy: {
    id: number;
    title: string;
    description: string;
  };
  options: {
    id: number;
    name: string;
    votes: number;
  }[];
}

// モックデータ
const mockPolicies: Record<number, PolicyResponse> = {
  1: {
    policy: {
      id: 1,
      title: '新しい図書館を建設するべきか？',
      description: '図書館建設の是非を問う政策です。',
    },
    options: [
      { id: 1, name: '賛成', votes: 120 },
      { id: 2, name: '反対', votes: 80 },
    ],
  },
  2: {
    policy: {
      id: 2,
      title: 'オンライン授業を増やすべきか？',
      description: 'オンライン授業の利便性について議論します。',
    },
    options: [
      { id: 3, name: '増やす', votes: 200 },
      { id: 4, name: '現状維持', votes: 50 },
    ],
  },
};

// ハンドラ関数
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const policyId = parseInt(params.id, 10);

  if (mockPolicies[policyId]) {
    return NextResponse.json(mockPolicies[policyId]);
  } else {
    return NextResponse.json(
      {
        error: {
          code: 404,
          message: 'Policy not found',
        },
      },
      { status: 404 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    {
      error: {
        code: 405,
        message: 'Method Not Allowed',
      },
    },
    { status: 405 }
  );
}
