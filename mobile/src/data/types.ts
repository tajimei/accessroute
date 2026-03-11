/**
 * 全国鉄道データ共通型定義
 */

/** 駅情報 */
export interface StationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lines: string[];
  prefecture?: string;
  /** エレベーター設置有無（未設定の場合は不明扱い） */
  hasElevator?: boolean;
  /** 車椅子対応（スロープ・多機能トイレ等の総合判定） */
  isWheelchairAccessible?: boolean;
  /** 駅構内にエスカレーターがあるか */
  hasEscalator?: boolean;
  /** バリアフリートイレ設置有無 */
  hasAccessibleRestroom?: boolean;
}

/** 路線情報 */
export interface LineData {
  id: string;
  name: string;
  company: string;
  color: string;
  vehicleType: 'train' | 'subway' | 'shinkansen' | 'tram' | 'monorail';
  stationIds: string[];
  isLoop: boolean;
  /** 駅間平均所要時間（分）。デフォルト2分 */
  avgIntervalMinutes?: number;
  /**
   * 駅間の実際の線路形状を表す中間座標点。
   * キー: "stationId_A:stationId_B" 形式（stationIds の並び順）
   * 値: 駅Aと駅Bの間を通る中間座標点の配列（駅自体の座標は含まない）
   * この情報があれば Catmull-Rom 補間の代わりに実際の線路形状を使用する。
   */
  trackPoints?: Record<string, Array<{ lat: number; lng: number }>>;
}

/** 地域データセット */
export interface RegionData {
  stations: StationData[];
  lines: LineData[];
}
