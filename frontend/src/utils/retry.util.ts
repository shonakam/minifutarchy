/**
 * 汎用リトライ関数
 * @param fn - 実行する非同期関数
 * @param retries - 最大リトライ回数
 * @param delay - 各リトライ間の待機時間 (ms)
 * @returns Promise<T>
 */
export async function withRetry<T>(fn: () => Promise<T>, retries: number, delay: number): Promise<T> {
    let attempts = 0;

while (attempts < retries) {
	try {
		return await fn(); // 成功時は結果を返す
	} catch (error: any) { // Specify the type of 'error' as 'any'
		attempts++;
		console.warn(`Attempt ${attempts} failed. Retrying...`);

		if (attempts >= retries) {
			throw new Error(`Failed after ${retries} retries: ${error.message}`);
		}

		// リトライ前に待機
		await new Promise((resolve) => setTimeout(resolve, delay));
	}
}

    // 到達しないが型安全のため
    throw new Error('Unexpected error in retry logic');
}
