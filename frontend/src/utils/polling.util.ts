// type PollingOptions = {
// 	interval: number; // ポーリング間隔（ミリ秒）
// 	maxRetries?: number; // 最大リトライ回数（デフォルト: 無制限）
// 	onError?: (error: any) => void; // エラーハンドリング用コールバック
//   };
  
//   export class PollingManager {
// 	private isPolling = false; // ポーリング状態
// 	private retryCount = 0; // リトライ回数
// 	private timeoutId: NodeJS.Timeout | null = null; // setTimeout ID
  
// 	async startPolling<T>(
// 	  fetchFn: () => Promise<T>,
// 	  shouldContinue: () => boolean,
// 	  options: PollingOptions
// 	): Promise<void> {
// 	  const { interval, maxRetries = Infinity, onError } = options;
  
// 	  this.isPolling = true;
// 	  this.retryCount = 0;
  
// 	  const poll = async () => {
// 		if (!this.isPolling || !shouldContinue()) return; // ポーリング停止条件
  
// 		try {
// 		  await fetchFn(); // データ取得関数を実行
// 		  this.retryCount = 0; // 成功時にリトライ回数をリセット
// 		} catch (error) {
// 		  this.retryCount++;
// 		  if (onError) onError(error); // エラー時のコールバック
// 		  console.error(`Polling error: ${error}`);
// 		  if (this.retryCount >= maxRetries) {
// 			console.error('Max retries reached. Stopping polling.');
// 			this.stopPolling(); // ポーリング停止
// 			return;
// 		  }
// 		}
  
// 		// 次回のポーリングをスケジュール
// 		this.timeoutId = setTimeout(poll, interval);
// 	  };
	  
// 	  console.log("hello");
// 	  await poll(); // 初回ポーリング開始
// 	}
  
// 	stopPolling(): void {
// 	  this.isPolling = false;
// 	  if (this.timeoutId) {
// 		clearTimeout(this.timeoutId); // タイマーをクリア
// 		this.timeoutId = null;
// 	  }
// 	}
//   }
  