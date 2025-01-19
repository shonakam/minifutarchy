/**
 * アドレスを短縮形式 (0x000...000) に変換
 * @param address 短縮するウォレットアドレス
 * @param chars 表示する先頭と末尾の文字数 (デフォルト: 4)
 * @returns 短縮されたアドレス
 */
export const shortenAddress = (address: string, chars: number = 4): string => {
	if (!address) return '';
	if (address.length < 2 * chars + 2) return address; // 短すぎる場合はそのまま返す
	return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
  };
