// UUID生成ヘルパー（外部依存なし）

import { randomBytes } from "crypto";

/**
 * ランダムなUUID v4風のIDを生成する
 * uuidパッケージを使わずcryptoモジュールで生成
 * 生成失敗時はフォールバック文字列を返す
 */
export const v4Fallback = (fallback: string): string => {
  try {
    const bytes = randomBytes(16);
    // RFC4122 v4 UUID形式に設定
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = bytes.toString("hex");
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32),
    ].join("-");
  } catch {
    return `${fallback}_${Date.now()}`;
  }
};
