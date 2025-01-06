'use client';

import { useState } from 'react';

export default function ProposingPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!title || !description) {
    //   alert('タイトルと説明を入力してください。');
    //   return;
    // }

    setLoading(true);

    try {
      const response = await fetch('/api/proposals/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          tags: tags.split(',').map((tag) => tag.trim()),
          author_id: 'dummy-author-id',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '提案の作成に失敗しました。');
      }

      alert('提案が作成されました！');
      setTitle('');
      setDescription('');
      setTags('');
    } catch (error: any) {
      console.error('Error submitting proposal:', error.message);
      alert(error.message || '提案の作成中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          新しい提案を作成する
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル入力 */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              タイトル
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="提案のタイトルを入力"
            //   required
            />
          </div>

          {/* 説明入力 */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              説明
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="提案の詳細を記述してください"
              rows={6}
            //   required
            ></textarea>
          </div>

          {/* タグ入力 */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              タグ（カンマ区切りで入力）
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="例: 環境, 教育, 科学"
            />
          </div>

          {/* 提案作成ボタン */}
          <button
            type="submit"
            className={`w-full flex items-center justify-center bg-blue-500 text-white font-bold rounded-lg px-4 py-3 transition-transform ${
              loading ? 'cursor-not-allowed bg-blue-300' : 'hover:scale-105'
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                作成中...
              </div>
            ) : (
              '提案を作成'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
