import readline from "readline";
import chalk from "chalk";

export class Indicator {
  private total: number;
  private rows: Map<number, number>; // アカウントごとの進行状況を管理

  constructor(total: number) {
    this.total = total;
    this.rows = new Map();
  }

  /**
   * 指定されたアカウントのインジケーターを更新する
   * @param accountIndex アカウント番号
   * @param progress 現在の進捗
   */
  update(accountIndex: number, progress: number) {
    const percentage = Math.round((progress / this.total) * 100);
    const filledBars = Math.floor((progress / this.total) * 10);
    const bar = `[${"#".repeat(filledBars)}${"-".repeat(10 - filledBars)}]`;

    readline.cursorTo(process.stdout, 0, accountIndex); // 指定した行にカーソルを移動
    process.stdout.write(
      `Account ${accountIndex}: ${bar} ${chalk.green(`${percentage}% 完了`)}`
    );

    this.rows.set(accountIndex, progress);
  }

  /**
   * 指定されたアカウントのインジケーターを削除する
   * @param accountIndex アカウント番号
   */
  clear(accountIndex: number) {
    readline.cursorTo(process.stdout, 0, accountIndex);
    readline.clearLine(process.stdout, 0); // 行をクリア
    this.rows.delete(accountIndex);
  }

  /**
   * 全てのアカウントの進行状況を完了状態に更新
   */
  completeAll() {
    for (const [accountIndex, progress] of this.rows.entries()) {
      this.update(accountIndex, this.total);
      console.log(); // 次の行に移動
    }
  }
}
