/**
 * 全国鉄道ルーティングエンジン
 *
 * Google Maps Directions API の Transit モードが利用不可のため、
 * 独自の駅・路線データベースと BFS/ダイクストラベースの経路探索を実装。
 *
 * 対応エリア: 新幹線、関東、関西、中部、九州、北海道
 */

import {
  MultiModalRoute,
  WaypointLeg,
  RouteStep,
  TransitDetail,
  LatLng,
  UserProfile,
} from '../types';

import {
  ALL_STATIONS,
  ALL_LINES,
  STATION_LOOKUP,
  LINE_LOOKUP,
} from '../data';

import type { StationData, LineData } from '../data/types';

// ============================================================
// 型定義
// ============================================================

/** 駅情報（後方互換） */
export type Station = StationData;

/** ルーティング結果 */
export interface TransitRouteResult {
  routes: MultiModalRoute[];
  originStation: Station;
  destStation: Station;
  walkToStation: number;
  walkFromStation: number;
}

/** 経路探索用の内部ノード */
interface PathNode {
  stationId: string;
  lineId: string | null;
  cost: number;
  transfers: number;
  parent: PathNode | null;
}

// ============================================================
// ユーティリティ関数
// ============================================================

/** NaN 安全な haversine ラッパー */
function safeHaversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) return Infinity;
  return haversineDistance(lat1, lng1, lat2, lng2);
}

/** Haversine 公式で2点間の距離を計算（メートル） */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/** 徒歩所要時間を計算（分）。速度: 80m/分 */
function walkingMinutes(distanceMeters: number): number {
  return distanceMeters / 80;
}

/** 一意なルートIDを生成 */
function generateRouteId(): string {
  return `transit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================================
// 空間インデックス（高速な最寄り駅検索）
// ============================================================

/** 緯度経度を基にしたグリッドベースの空間インデックス */
const GRID_SIZE = 0.1; // 約10kmグリッド
const spatialGrid = new Map<string, StationData[]>();
let spatialIndexBuilt = false;

function buildSpatialIndex(): void {
  if (spatialIndexBuilt) return;
  for (const station of ALL_STATIONS) {
    if (typeof station.lat !== 'number' || typeof station.lng !== 'number' || isNaN(station.lat) || isNaN(station.lng)) continue;
    const key = `${Math.floor(station.lat / GRID_SIZE)},${Math.floor(station.lng / GRID_SIZE)}`;
    if (!spatialGrid.has(key)) spatialGrid.set(key, []);
    spatialGrid.get(key)!.push(station);
  }
  spatialIndexBuilt = true;
}

/** グリッドベースで近傍駅を高速検索 */
function findNearbyFromGrid(lat: number, lng: number, limit: number): StationData[] {
  buildSpatialIndex();

  const gridLat = Math.floor(lat / GRID_SIZE);
  const gridLng = Math.floor(lng / GRID_SIZE);
  const candidates: StationData[] = [];

  // 周辺9グリッドを探索
  for (let dLat = -1; dLat <= 1; dLat++) {
    for (let dLng = -1; dLng <= 1; dLng++) {
      const key = `${gridLat + dLat},${gridLng + dLng}`;
      const stations = spatialGrid.get(key);
      if (stations) candidates.push(...stations);
    }
  }

  // 候補がなければ広範囲検索（離島等のフォールバック）
  if (candidates.length === 0) {
    return findNearestStationsBrute(lat, lng, limit);
  }

  const routable = candidates.filter((s) => s.lines.length > 0);
  const withDist = routable.map((s) => ({
    station: s,
    distance: safeHaversine(lat, lng, s.lat, s.lng),
  }));
  withDist.sort((a, b) => a.distance - b.distance);
  return withDist.slice(0, limit).map((d) => d.station);
}

/** ブルートフォース検索（フォールバック用） */
function findNearestStationsBrute(lat: number, lng: number, limit: number): StationData[] {
  const withDist = ALL_STATIONS.filter((s) => s.lines.length > 0).map((s) => ({
    station: s,
    distance: safeHaversine(lat, lng, s.lat, s.lng),
  }));
  withDist.sort((a, b) => a.distance - b.distance);
  return withDist.slice(0, limit).map((d) => d.station);
}

// ============================================================
// 隣接グラフの構築
// ============================================================

interface Edge {
  to: string;
  lineId: string;
  cost: number;
  /** 徒歩乗り換えエッジかどうか */
  isWalkingTransfer?: boolean;
}

const adjacency = new Map<string, Edge[]>();

/**
 * 徒歩乗り換えが可能な近接駅ペアの定義
 * 同一名称だが異なるIDの駅や、地下通路で接続された近接駅を含む
 * コスト（分）は実際の徒歩移動時間を反映
 */
const WALKING_TRANSFER_PAIRS: Array<{ stationA: string; stationB: string; walkMinutes: number }> = [
  // ============================================================
  // 同一駅名・地下通路接続による乗り換えペア
  // ============================================================

  // 東京駅 ↔ 大手町駅（地下通路で接続、約3分）
  { stationA: 'kt_tokyo', stationB: 'kt_otemachi', walkMinutes: 3 },
  // 岩本町（都営新宿線）↔ 秋葉原（JR/TX/日比谷線）（地上徒歩約4分）
  { stationA: 'kt_iwamotocho', stationB: 'kt_akihabara', walkMinutes: 4 },
  // 新御茶ノ水（千代田線）↔ 御茶ノ水（JR/丸ノ内線）（徒歩約3分）
  { stationA: 'kt_shin_ochanomizu', stationB: 'kt_ochanomizu', walkMinutes: 3 },
  // 小川町（都営新宿線）↔ 淡路町（丸ノ内線）（地下通路直結）
  { stationA: 'kt_ogawamachi', stationB: 'kt_awajicho', walkMinutes: 1 },
  // 小川町（都営新宿線）↔ 新御茶ノ水（千代田線）（地下通路直結）
  { stationA: 'kt_ogawamachi', stationB: 'kt_shin_ochanomizu', walkMinutes: 2 },
  // 小川町（都営新宿線）↔ 御茶ノ水（JR総武線）（徒歩約4分）
  { stationA: 'kt_ogawamachi', stationB: 'kt_ochanomizu', walkMinutes: 4 },
  // 日比谷（千代田線/日比谷線）↔ 有楽町（有楽町線/JR）（地下通路直結）
  { stationA: 'kt_hibiya', stationB: 'kt_yurakucho', walkMinutes: 2 },
  // 大門（都営浅草線/大江戸線）↔ 浜松町（JR/モノレール）（徒歩約2分）
  { stationA: 'kt_daimon', stationB: 'kt_hamamatsucho', walkMinutes: 2 },
  // 春日（都営三田線/大江戸線）↔ 後楽園（丸ノ内線/南北線）（地下通路直結）
  { stationA: 'kt_kasuga', stationB: 'kt_korakuen', walkMinutes: 2 },
  // 春日（都営三田線）↔ 水道橋（JR/都営三田線）（徒歩圏内）
  { stationA: 'kt_kasuga', stationB: 'kt_suidobashi', walkMinutes: 5 },
  // 馬喰横山（都営新宿線）↔ 東日本橋（都営浅草線）（地下通路直結）
  { stationA: 'kt_bakuroyokoyama', stationB: 'kt_higashi_nihombashi', walkMinutes: 2 },
  // 馬喰横山（都営新宿線）↔ 両国（JR総武線）（徒歩圏内）
  { stationA: 'kt_bakuroyokoyama', stationB: 'kt_ryogoku', walkMinutes: 8 },
  // 人形町（日比谷線/都営浅草線）↔ 水天宮前（半蔵門線）（地下通路接続）
  { stationA: 'kt_ningyocho', stationB: 'kt_suitengumae', walkMinutes: 3 },
  // 上野広小路（銀座線）↔ 仲御徒町（日比谷線）（地下通路直結）
  { stationA: 'kt_ueno_hirokoji', stationB: 'kt_naka_okachimachi', walkMinutes: 2 },
  // 上野広小路（銀座線）↔ 上野御徒町（大江戸線）（地下通路直結）
  { stationA: 'kt_ueno_hirokoji', stationB: 'kt_ueno_okachimachi', walkMinutes: 2 },
  // 赤坂見附（銀座線/丸ノ内線）↔ 永田町（有楽町線/半蔵門線/南北線）（地下通路直結、約2分）
  { stationA: 'kt_akasaka_mitsuke', stationB: 'kt_nagatacho', walkMinutes: 2 },
  // 京成上野 ↔ 上野（JR/銀座線/日比谷線）（徒歩約5分）
  { stationA: 'kt_keisei_ueno', stationB: 'kt_ueno', walkMinutes: 5 },
  // 泉岳寺（都営浅草線/京急）↔ 品川（JR/京急）（徒歩約8分）
  { stationA: 'kt_sengakuji', stationB: 'kt_shinagawa', walkMinutes: 8 },
  // 西武新宿 ↔ 新宿（JR/丸ノ内線等）（徒歩約7分）
  { stationA: 'kt_seibu_shinjuku', stationB: 'kt_shinjuku', walkMinutes: 7 },
  // 西武新宿 ↔ 新宿三丁目（丸ノ内線/副都心線）（地下通路約5分）
  { stationA: 'kt_seibu_shinjuku', stationB: 'kt_shinjuku_sanchome', walkMinutes: 5 },
  // 東新宿（大江戸線/副都心線）↔ 新宿三丁目（丸ノ内線/副都心線）（徒歩約6分）
  { stationA: 'kt_higashi_shinjuku', stationB: 'kt_shinjuku_sanchome', walkMinutes: 6 },
  // 赤羽岩淵（南北線）↔ 赤羽（JR）（徒歩約6分）
  { stationA: 'kt_akabane_iwabuchi', stationB: 'kt_akabane', walkMinutes: 6 },
  // 新宿西口（大江戸線）↔ 新宿（JR/丸ノ内線等）（地下通路約3分）
  { stationA: 'kt_shinjuku_nishiguchi', stationB: 'kt_shinjuku', walkMinutes: 3 },
  // 新宿西口（大江戸線）↔ 西武新宿（西武新宿線）（地下通路約5分）
  { stationA: 'kt_shinjuku_nishiguchi', stationB: 'kt_seibu_shinjuku', walkMinutes: 5 },

  // ============================================================
  // 同一駅・近接駅（異なる事業者）
  // ============================================================

  // 溝の口（東急田園都市線）↔ 武蔵溝ノ口（JR南武線）：同一駅扱い
  { stationA: 'kt_mizonokuchi', stationB: 'kt_musashi_mizonokuchi', walkMinutes: 2 },
  // 新橋（ゆりかもめ等）↔ 浜松町（東京モノレール）（徒歩圏内）
  { stationA: 'kt_shimbashi', stationB: 'kt_hamamatsucho', walkMinutes: 6 },
  // 上大岡・中目黒は駅ID統一済み（kt_kamiooka, kt_nakameguro）のため乗り換えペア不要

  // ============================================================
  // 追加の徒歩乗り換えペア
  // ============================================================

  // 川崎（JR南武線）↔ 京急川崎（京急本線）（徒歩約3分）
  { stationA: 'kt_kawasaki', stationB: 'kt_keikyu_kawasaki', walkMinutes: 3 },
  // 御徒町（JR山手線）↔ 仲御徒町（日比谷線）（地下通路直結）
  { stationA: 'kt_okachimachi', stationB: 'kt_naka_okachimachi', walkMinutes: 2 },
  // 御徒町（JR山手線）↔ 上野御徒町（大江戸線）（地下通路直結）
  { stationA: 'kt_okachimachi', stationB: 'kt_ueno_okachimachi', walkMinutes: 2 },
  // 御徒町（JR山手線）↔ 上野広小路（銀座線）（地下通路直結）
  { stationA: 'kt_okachimachi', stationB: 'kt_ueno_hirokoji', walkMinutes: 2 },
  // 原宿（JR山手線）↔ 明治神宮前〈原宿〉（千代田線/副都心線）（徒歩約1分）
  { stationA: 'kt_harajuku', stationB: 'kt_meiji_jingumae', walkMinutes: 1 },
  // 田町（JR山手線）↔ 三田（都営浅草線/三田線）（地下通路直結）
  { stationA: 'kt_tamachi', stationB: 'kt_mita', walkMinutes: 2 },
  // 高輪ゲートウェイ（JR山手線）↔ 泉岳寺（都営浅草線/京急）（徒歩約4分）
  { stationA: 'kt_takanawa_gw', stationB: 'kt_sengakuji', walkMinutes: 4 },
  // 大塚（JR山手線）↔ 新大塚（丸ノ内線）（徒歩約7分）
  { stationA: 'kt_otsuka', stationB: 'kt_shin_otsuka', walkMinutes: 7 },
  // 菊名（JR横浜線）↔ 菊名（東急東横線）：同一駅・別路線データ統合用
  // 注: 同一IDだが路線データ上の接続を補強
  // 日吉（東急東横線/目黒線）↔ 日吉（グリーンライン）：同一駅
  // 注: 同一kt_hiyoshiだがグリーンラインのkt_hiyoshiは別定義
  // 東京テレポート（りんかい線）↔ お台場海浜公園（ゆりかもめ）（徒歩約5分）
  { stationA: 'kt_tokyo_teleport', stationB: 'kt_odaiba_kaihinkoen', walkMinutes: 5 },
  // 淡路町（丸ノ内線）↔ 御茶ノ水（JR/丸ノ内線）（徒歩約3分）
  { stationA: 'kt_awajicho', stationB: 'kt_ochanomizu', walkMinutes: 3 },
  // 東日本橋（都営浅草線）↔ 馬喰町（JR総武線快速）※馬喰町は未定義のため馬喰横山経由
  // 蔵前（都営浅草線）↔ 蔵前（大江戸線）（徒歩約3分・別改札口）
  // 注: 同一kt_kuramaeを共有しているため不要（lines mergeで接続済み）
  // 新宿三丁目（丸ノ内線/副都心線）↔ 新宿（JR/小田急/京王）（地下通路約4分）
  { stationA: 'kt_shinjuku_sanchome', stationB: 'kt_shinjuku', walkMinutes: 4 },
  // 築地（日比谷線）↔ 新富町（有楽町線）（地下通路接続、約3分）
  { stationA: 'kt_tsukiji', stationB: 'kt_shintomicho', walkMinutes: 3 },
  // 国会議事堂前（丸ノ内線/千代田線）↔ 溜池山王（銀座線/南北線）（地下通路直結、約2分）
  { stationA: 'kt_kokkai_gijidomae', stationB: 'kt_tameike_sanno', walkMinutes: 2 },
  // 蒲田（JR京浜東北線）↔ 京急蒲田（京急本線/空港線）（地上徒歩約8分）
  // 羽田空港アクセスに重要な接続
  { stationA: 'kt_kamata', stationB: 'kt_keikyu_kamata', walkMinutes: 8 },
  // 押上（半蔵門線/浅草線/京成押上線）↔ とうきょうスカイツリー（東武スカイツリーライン）（徒歩約1分）
  { stationA: 'kt_oshiage', stationB: 'kt_tokyo_skytree', walkMinutes: 1 },
  // 溜池山王（銀座線/南北線）↔ 赤坂見附（銀座線/丸ノ内線）（地下通路直結、約4分）
  // 丸ノ内線↔南北線の直接乗り換えに重要（銀座線1駅乗車を回避）
  { stationA: 'kt_tameike_sanno', stationB: 'kt_akasaka_mitsuke', walkMinutes: 4 },
];

/** 隣接グラフを初期化（全国データから構築） */
function buildAdjacencyGraph(): void {
  if (adjacency.size > 0) return;

  for (const line of ALL_LINES) {
    const ids = line.stationIds;
    const intervalMinutes = line.avgIntervalMinutes ?? 2;

    for (let i = 0; i < ids.length - 1; i++) {
      const a = ids[i];
      const b = ids[i + 1];
      if (a === b) continue;

      if (!adjacency.has(a)) adjacency.set(a, []);
      if (!adjacency.has(b)) adjacency.set(b, []);
      adjacency.get(a)!.push({ to: b, lineId: line.id, cost: intervalMinutes });
      adjacency.get(b)!.push({ to: a, lineId: line.id, cost: intervalMinutes });
    }

    // 環状線
    if (line.isLoop && ids.length > 2) {
      const first = ids[0];
      const last = ids[ids.length - 1];
      if (first !== last) {
        if (!adjacency.has(first)) adjacency.set(first, []);
        if (!adjacency.has(last)) adjacency.set(last, []);
        adjacency.get(first)!.push({ to: last, lineId: line.id, cost: intervalMinutes });
        adjacency.get(last)!.push({ to: first, lineId: line.id, cost: intervalMinutes });
      }
    }
  }

  // 徒歩乗り換えエッジを追加（近接駅間の接続）
  for (const pair of WALKING_TRANSFER_PAIRS) {
    const stA = STATION_LOOKUP.get(pair.stationA);
    const stB = STATION_LOOKUP.get(pair.stationB);
    if (!stA || !stB) continue;

    // 各路線のエッジとして追加（乗り換え先の路線IDを使用）
    const linesA = stA.lines;
    const linesB = stB.lines;

    if (!adjacency.has(pair.stationA)) adjacency.set(pair.stationA, []);
    if (!adjacency.has(pair.stationB)) adjacency.set(pair.stationB, []);

    // A→B: Bの各路線へ接続
    for (const lineId of linesB) {
      adjacency.get(pair.stationA)!.push({
        to: pair.stationB,
        lineId,
        cost: pair.walkMinutes,
        isWalkingTransfer: true,
      });
    }

    // B→A: Aの各路線へ接続
    for (const lineId of linesA) {
      adjacency.get(pair.stationB)!.push({
        to: pair.stationA,
        lineId,
        cost: pair.walkMinutes,
        isWalkingTransfer: true,
      });
    }
  }
}

// ============================================================
// 公開関数
// ============================================================

/**
 * 指定座標に近い駅を検索する
 */
export function findNearestStations(lat: number, lng: number, limit: number = 3): Station[] {
  return findNearbyFromGrid(lat, lng, limit);
}

/**
 * 電車ルートを検索する（全国対応）
 *
 * @param origin 出発地の座標
 * @param destination 目的地の座標
 * @param userProfile ユーザープロファイル（アクセシビリティ考慮に使用）
 */
export function searchTransitRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  userProfile?: UserProfile,
): TransitRouteResult {
  buildAdjacencyGraph();

  const originStations = findNearestStations(origin.lat, origin.lng, 3);
  const destStations = findNearestStations(destination.lat, destination.lng, 3);

  // 最寄り駅が見つからない場合は徒歩ルートを返す
  if (originStations.length === 0 || destStations.length === 0) {
    const directRoute = buildDirectWalkRoute(origin, destination);
    directRoute.warnings = ['最寄り駅が見つかりません。', ...(directRoute.warnings ?? [])];
    return {
      routes: [directRoute],
      originStation: originStations[0] ?? { id: '', name: '不明', lat: origin.lat, lng: origin.lng, lines: [] } as Station,
      destStation: destStations[0] ?? { id: '', name: '不明', lat: destination.lat, lng: destination.lng, lines: [] } as Station,
      walkToStation: 0,
      walkFromStation: 0,
    };
  }

  const originStation = originStations[0];
  const destStation = destStations[0];

  const walkToStation = safeHaversine(origin.lat, origin.lng, originStation.lat, originStation.lng);
  const walkFromStation = safeHaversine(destStation.lat, destStation.lng, destination.lat, destination.lng);

  // 複数の出発駅・到着駅の組み合わせで経路探索
  const allPaths: { path: PathNode; originSt: Station; destSt: Station; walkTo: number; walkFrom: number }[] = [];

  for (const oSt of originStations) {
    for (const dSt of destStations) {
      if (oSt.id === dSt.id) continue;
      const paths = findPaths(oSt.id, dSt.id, 3);
      const wTo = safeHaversine(origin.lat, origin.lng, oSt.lat, oSt.lng);
      const wFrom = safeHaversine(dSt.lat, dSt.lng, destination.lat, destination.lng);
      for (const p of paths) {
        allPaths.push({ path: p, originSt: oSt, destSt: dSt, walkTo: wTo, walkFrom: wFrom });
      }
    }
  }

  // 出発地と目的地が同じ駅の場合
  let sameStationWarning: string | undefined;
  if (allPaths.length === 0 && originStation.id === destStation.id) {
    sameStationWarning = '出発地と目的地が同じ駅の近くです。';
  }

  // ユーザープロファイルに基づく重み係数を算出
  const isWheelchair = userProfile?.mobilityType === 'wheelchair';
  const isStroller = userProfile?.mobilityType === 'stroller';
  const hasElderlyCompanion = userProfile?.companions?.includes('elderly') ?? false;
  const hasDisabilityCompanion = userProfile?.companions?.includes('disability') ?? false;
  const needsBarrierFree = isWheelchair || isStroller || hasDisabilityCompanion;

  // 乗り換えペナルティの重み（高齢者・車椅子・ベビーカーは乗り換え負担が大きい）
  const transferPenaltyMultiplier = needsBarrierFree ? 2.0
    : hasElderlyCompanion ? 1.8
    : 1.0;

  // 徒歩距離ペナルティの重み（高齢者は歩行距離を最小化）
  const walkPenaltyMultiplier = hasElderlyCompanion ? 2.0
    : needsBarrierFree ? 1.5
    : 1.0;

  // 重み付きスコアでソート（乗り換え回数・徒歩距離にペナルティ）
  // 乗り換えペナルティは実際の乗り換えコスト（待ち時間等）に加えて
  // ユーザー体験としての負担を反映する追加ペナルティ
  const scoreCandidate = (c: typeof allPaths[0]): number => {
    const totalTime = c.path.cost + walkingMinutes(c.walkTo) + walkingMinutes(c.walkFrom);
    // 乗り換え回数が増えるほどペナルティ増加（1回目: 12分、2回目: 15分、3回目: 18分）
    let transferPenalty = 0;
    for (let i = 0; i < c.path.transfers; i++) {
      transferPenalty += 12 + i * 3;
    }
    transferPenalty *= transferPenaltyMultiplier;

    const walkPenalty = ((c.walkTo > 500 ? (c.walkTo - 500) / 100 : 0)
      + (c.walkFrom > 500 ? (c.walkFrom - 500) / 100 : 0)) * walkPenaltyMultiplier;

    // バリアフリー非対応駅を経由する場合のペナルティ
    let barrierFreePenalty = 0;
    if (needsBarrierFree) {
      const pathStations = getPathStationIds(c.path);
      for (const stationId of pathStations) {
        const station = STATION_LOOKUP.get(stationId);
        if (station) {
          // エレベーターなしの駅は車椅子・ベビーカーにとって大きな障壁
          if (station.hasElevator === false) {
            barrierFreePenalty += isWheelchair ? 30 : 15;
          }
          // 車椅子非対応の駅
          if (isWheelchair && station.isWheelchairAccessible === false) {
            barrierFreePenalty += 20;
          }
        }
      }
    }

    return totalTime + transferPenalty + walkPenalty + barrierFreePenalty;
  };

  allPaths.sort((a, b) => scoreCandidate(a) - scoreCandidate(b));

  // セグメントキーを生成するヘルパー（extractSegments の結果をキャッシュ）
  const segmentCache = new Map<PathNode, RouteSegment[]>();
  const getSegments = (candidate: typeof allPaths[0]): RouteSegment[] => {
    let segments = segmentCache.get(candidate.path);
    if (!segments) {
      segments = extractSegments(candidate.path);
      segmentCache.set(candidate.path, segments);
    }
    return segments;
  };
  const makeSegKey = (segments: RouteSegment[]): string =>
    segments.map((s) => `${s.lineId}:${s.stations.map((st) => st.id).join(',')}`).join('|');

  // ルート多様性を確保して上位3件を選出
  const routes: MultiModalRoute[] = [];
  const seen = new Set<string>();

  const buildAndPush = (candidate: typeof allPaths[0]): boolean => {
    const segments = getSegments(candidate);
    const segKey = makeSegKey(segments);
    if (seen.has(segKey)) return false;
    seen.add(segKey);
    const route = buildMultiModalRoute(
      origin, destination,
      candidate.originSt, candidate.destSt,
      candidate.walkTo, candidate.walkFrom,
      segments, candidate.path.cost,
      userProfile,
    );
    routes.push(route);
    return true;
  };

  // 1st: ベストスコア（すでにソート済み）
  for (const candidate of allPaths) {
    if (buildAndPush(candidate)) break;
  }

  // 2nd: 乗り換え回数が少ないルートを優先（スコア順でフォールバック）
  if (routes.length < 3) {
    const fewerTransfers = [...allPaths]
      .sort((a, b) => a.path.transfers - b.path.transfers || scoreCandidate(a) - scoreCandidate(b));
    for (const candidate of fewerTransfers) {
      const segments = getSegments(candidate);
      const segKey = makeSegKey(segments);
      if (seen.has(segKey)) continue;
      if (buildAndPush(candidate)) break;
    }
  }

  // 3rd: 最速ルート（乗り換え無視）
  if (routes.length < 3) {
    const fastest = [...allPaths]
      .sort((a, b) => {
        const timeA = a.path.cost + walkingMinutes(a.walkTo) + walkingMinutes(a.walkFrom);
        const timeB = b.path.cost + walkingMinutes(b.walkTo) + walkingMinutes(b.walkFrom);
        return timeA - timeB;
      });
    for (const candidate of fastest) {
      const segments = getSegments(candidate);
      const segKey = makeSegKey(segments);
      if (seen.has(segKey)) continue;
      if (buildAndPush(candidate)) break;
    }
  }

  // 残り枠をスコア順で埋める
  for (const candidate of allPaths) {
    if (routes.length >= 3) break;
    buildAndPush(candidate);
  }

  if (routes.length === 0) {
    const directRoute = buildDirectWalkRoute(origin, destination);
    if (sameStationWarning) {
      directRoute.warnings = [sameStationWarning, ...(directRoute.warnings ?? [])];
    }
    routes.push(directRoute);
  }

  return {
    routes,
    originStation,
    destStation,
    walkToStation,
    walkFromStation,
  };
}

// ============================================================
// 経路探索（ダイクストラ + 乗り換えペナルティ）
// ============================================================

/**
 * 乗り換えペナルティ（分）
 * 日本の鉄道では乗り換えに平均5〜10分かかることを考慮。
 * 同一駅での乗り換え: 8分（ホーム移動・待ち時間）
 * 徒歩乗り換え（近接駅間）: 徒歩時間に加算しない（walkMinutesに含まれる）
 */
const TRANSFER_PENALTY_MINUTES = 8;

// ============================================================
// バイナリヒープ（最小ヒープ）優先度キュー
// ============================================================

/**
 * ダイクストラ用の最小ヒープ。
 * 毎回の配列ソート O(N log N) を O(log N) の挿入・取り出しに改善。
 */
class MinHeap<T> {
  private heap: T[] = [];
  private compareFn: (a: T, b: T) => number;

  constructor(compareFn: (a: T, b: T) => number) {
    this.compareFn = compareFn;
  }

  get size(): number {
    return this.heap.length;
  }

  push(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  private bubbleUp(idx: number): void {
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (this.compareFn(this.heap[idx], this.heap[parent]) >= 0) break;
      [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
      idx = parent;
    }
  }

  private sinkDown(idx: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < length && this.compareFn(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && this.compareFn(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === idx) break;
      [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
      idx = smallest;
    }
  }
}

function findPaths(startId: string, goalId: string, maxPaths: number): PathNode[] {
  const open = new MinHeap<PathNode>((a, b) => a.cost - b.cost);
  const bestCost = new Map<string, number>();
  const results: PathNode[] = [];

  // 探索ノード数の上限（全国データは大きいため）
  const MAX_ITERATIONS = 50000;
  let iterations = 0;

  const startNode: PathNode = {
    stationId: startId,
    lineId: null,
    cost: 0,
    transfers: 0,
    parent: null,
  };
  open.push(startNode);

  while (open.size > 0 && iterations < MAX_ITERATIONS) {
    iterations++;

    // コストが最小のノードを取得（O(log N)）
    const current = open.pop()!;

    if (current.stationId === goalId) {
      results.push(current);
      if (results.length >= maxPaths) break;
      continue;
    }

    const stateKey = `${current.stationId}:${current.lineId ?? 'null'}`;
    const prevBest = bestCost.get(stateKey);
    if (prevBest !== undefined && prevBest <= current.cost) continue;
    bestCost.set(stateKey, current.cost);

    const edges = adjacency.get(current.stationId) ?? [];
    for (const edge of edges) {
      const isTransfer = current.lineId !== null && current.lineId !== edge.lineId;
      // 徒歩乗り換えエッジの場合はコストにwalkMinutesが既に含まれているため
      // 追加ペナルティは不要。通常の同一駅乗り換えにはペナルティを付与。
      const transferPenalty = isTransfer
        ? (edge.isWalkingTransfer ? 0 : TRANSFER_PENALTY_MINUTES)
        : 0;
      const newTransfers = current.transfers + (isTransfer ? 1 : 0);

      // 4回以上の乗り換えは実用的でないためスキップ
      if (newTransfers >= 4) continue;

      const newCost = current.cost + edge.cost + transferPenalty;

      const newNode: PathNode = {
        stationId: edge.to,
        lineId: edge.lineId,
        cost: newCost,
        transfers: newTransfers,
        parent: current,
      };

      const newStateKey = `${edge.to}:${edge.lineId}`;
      const existingBest = bestCost.get(newStateKey);
      if (existingBest !== undefined && existingBest <= newCost) continue;

      open.push(newNode);
    }
  }

  return results;
}

/** パスノードから経由駅IDリストを取得する */
function getPathStationIds(node: PathNode): string[] {
  const ids: string[] = [];
  let current: PathNode | null = node;
  while (current) {
    if (!ids.includes(current.stationId)) {
      ids.push(current.stationId);
    }
    current = current.parent;
  }
  return ids;
}

// ============================================================
// パス → セグメント変換
// ============================================================

interface RouteSegment {
  lineId: string;
  stations: Station[];
}

function extractSegments(node: PathNode): RouteSegment[] {
  const nodes: PathNode[] = [];
  let current: PathNode | null = node;
  while (current) {
    nodes.push(current);
    current = current.parent;
  }
  nodes.reverse();

  const segments: RouteSegment[] = [];
  let currentSegment: RouteSegment | null = null;

  for (const n of nodes) {
    const station = STATION_LOOKUP.get(n.stationId);
    if (!station) continue;

    if (n.lineId === null) {
      // 始点ノード（路線未確定）- 次のノードで路線が確定した際に追加される
      continue;
    }

    if (!currentSegment || currentSegment.lineId !== n.lineId) {
      // 新しいセグメント開始: 乗り換え駅を始点として追加
      const parentStation = n.parent ? STATION_LOOKUP.get(n.parent.stationId) : null;
      if (parentStation) {
        // 乗り換え駅が前セグメントの終点と同じ場合のみ追加（重複回避）
        currentSegment = { lineId: n.lineId, stations: [parentStation] };
      } else {
        currentSegment = { lineId: n.lineId, stations: [] };
      }
      segments.push(currentSegment);
    }

    // 現在のノードの駅を追加（前のノードと同じ駅でない場合のみ）
    const lastStation = currentSegment.stations[currentSegment.stations.length - 1];
    if (!lastStation || lastStation.id !== station.id) {
      currentSegment.stations.push(station);
    }
  }

  return segments;
}

// ============================================================
// MultiModalRoute 構築
// ============================================================

function buildMultiModalRoute(
  origin: LatLng,
  destination: LatLng,
  originStation: Station,
  destStation: Station,
  walkToDistance: number,
  walkFromDistance: number,
  segments: RouteSegment[],
  transitCostMinutes: number,
  userProfile?: UserProfile,
): MultiModalRoute {
  const legs: WaypointLeg[] = [];
  let legIndex = 0;

  // Leg 1: 徒歩（出発地 → 最寄り駅）
  const walkToMinutes = walkingMinutes(walkToDistance);
  legs.push({
    legIndex,
    mode: 'walking',
    origin: { lat: origin.lat, lng: origin.lng },
    destination: { lat: originStation.lat, lng: originStation.lng },
    originName: '出発地',
    destinationName: `${originStation.name}駅`,
    distanceMeters: Math.round(walkToDistance),
    durationMinutes: Math.round(walkToMinutes * 10) / 10,
    steps: buildWalkingSteps(origin, { lat: originStation.lat, lng: originStation.lng }, walkToDistance, walkToMinutes),
  });
  legIndex++;

  // 電車区間のLeg
  for (const segment of segments) {
    const line = LINE_LOOKUP.get(segment.lineId);
    if (!line || segment.stations.length < 2) continue;

    const firstStation = segment.stations[0];
    const lastStation = segment.stations[segment.stations.length - 1];
    const numStops = segment.stations.length - 1;
    const intervalMinutes = line.avgIntervalMinutes ?? 2;
    const segmentDuration = numStops * intervalMinutes;
    // 各駅間の距離を合算（直線距離ではなく経路距離を近似）
    let segmentDistance = 0;
    for (let si = 0; si < segment.stations.length - 1; si++) {
      segmentDistance += safeHaversine(
        segment.stations[si].lat, segment.stations[si].lng,
        segment.stations[si + 1].lat, segment.stations[si + 1].lng,
      );
    }

    const vehicleType = line.vehicleType === 'shinkansen' ? 'train' : line.vehicleType;

    const transitDetail: TransitDetail = {
      lineName: line.name,
      lineShortName: line.id,
      lineColor: line.color,
      vehicleType: vehicleType as TransitDetail['vehicleType'],
      departureStop: `${firstStation.name}駅`,
      arrivalStop: `${lastStation.name}駅`,
      numStops,
      headSign: lastStation.name,
    };

    legs.push({
      legIndex,
      mode: 'transit',
      origin: { lat: firstStation.lat, lng: firstStation.lng },
      destination: { lat: lastStation.lat, lng: lastStation.lng },
      originName: `${firstStation.name}駅`,
      destinationName: `${lastStation.name}駅`,
      distanceMeters: Math.round(segmentDistance),
      durationMinutes: segmentDuration,
      steps: buildTransitSteps(segment.stations, line),
      transitDetails: [transitDetail],
    });
    legIndex++;
  }

  // 最終Leg: 徒歩（最寄り駅 → 目的地）
  const walkFromMinutes = walkingMinutes(walkFromDistance);
  legs.push({
    legIndex,
    mode: 'walking',
    origin: { lat: destStation.lat, lng: destStation.lng },
    destination: { lat: destination.lat, lng: destination.lng },
    originName: `${destStation.name}駅`,
    destinationName: '目的地',
    distanceMeters: Math.round(walkFromDistance),
    durationMinutes: Math.round(walkFromMinutes * 10) / 10,
    steps: buildWalkingSteps({ lat: destStation.lat, lng: destStation.lng }, destination, walkFromDistance, walkFromMinutes),
  });

  const totalDistance = legs.reduce((sum, leg) => sum + leg.distanceMeters, 0);
  const totalDuration = Math.round(
    walkToMinutes + transitCostMinutes + walkFromMinutes,
  );

  // アクセシビリティスコアを動的に計算
  const transferCount = segments.length > 0 ? segments.length - 1 : 0;
  let accessibilityScore = 90;

  // 乗り換えペナルティ（プロファイルに応じて重み付け）
  const isHighImpactUser = userProfile && (
    userProfile.mobilityType === 'wheelchair' ||
    userProfile.mobilityType === 'stroller' ||
    userProfile.companions?.includes('elderly') ||
    userProfile.companions?.includes('disability')
  );
  const transferPenaltyPerCount = isHighImpactUser ? 10 : 5;
  accessibilityScore -= transferCount * transferPenaltyPerCount;

  // 徒歩距離ペナルティ（高齢者同行時は距離ペナルティを強化）
  const maxWalkDistance = Math.max(walkToDistance, walkFromDistance);
  const isElderlyRoute = userProfile?.companions?.includes('elderly');
  if (maxWalkDistance > 1000) {
    accessibilityScore -= isElderlyRoute ? 25 : 15;
  } else if (maxWalkDistance > 500) {
    accessibilityScore -= isElderlyRoute ? 15 : 10;
  }

  // 経由駅のバリアフリー情報に基づくペナルティ
  if (userProfile && (userProfile.mobilityType === 'wheelchair' || userProfile.mobilityType === 'stroller')) {
    for (const segment of segments) {
      for (const station of segment.stations) {
        if (station.hasElevator === false) {
          accessibilityScore -= 10;
        }
        if (userProfile.mobilityType === 'wheelchair' && station.isWheelchairAccessible === false) {
          accessibilityScore -= 5;
        }
      }
    }
  }

  accessibilityScore = Math.max(accessibilityScore, 10);

  // ユーザープロファイルに基づく警告を追加
  const warnings = buildWarnings(legs, userProfile);

  return {
    routeId: generateRouteId(),
    totalDistanceMeters: totalDistance,
    totalDurationMinutes: totalDuration,
    accessibilityScore,
    legs,
    warnings,
  };
}

function buildDirectWalkRoute(origin: LatLng, destination: LatLng): MultiModalRoute {
  const dist = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  const minutes = walkingMinutes(dist);

  return {
    routeId: generateRouteId(),
    totalDistanceMeters: Math.round(dist),
    totalDurationMinutes: Math.round(minutes),
    accessibilityScore: 70,
    legs: [
      {
        legIndex: 0,
        mode: 'walking',
        origin,
        destination,
        originName: '出発地',
        destinationName: '目的地',
        distanceMeters: Math.round(dist),
        durationMinutes: Math.round(minutes),
        steps: buildWalkingSteps(origin, destination, dist, minutes),
      },
    ],
    warnings: ['電車ルートが見つからなかったため、徒歩ルートを表示しています。'],
  };
}

// ============================================================
// Google Encoded Polyline エンコーダ
// ============================================================

function encodeNumber(num: number): string {
  let encoded = '';
  while (num >= 0x20) {
    encoded += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
    num >>= 5;
  }
  encoded += String.fromCharCode(num + 63);
  return encoded;
}

function encodeSignedNumber(num: number): string {
  let sgn_num = num << 1;
  if (num < 0) sgn_num = ~sgn_num;
  return encodeNumber(sgn_num);
}

function encodePolyline(points: Array<{ lat: number; lng: number }>): string {
  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;
  for (const point of points) {
    const lat = Math.round(point.lat * 1e5);
    const lng = Math.round(point.lng * 1e5);
    encoded += encodeSignedNumber(lat - prevLat);
    encoded += encodeSignedNumber(lng - prevLng);
    prevLat = lat;
    prevLng = lng;
  }
  return encoded;
}

// ============================================================
// 駅座標間の補間（線路カーブの視覚化）
// ============================================================

/**
 * Catmull-Rom スプライン補間で2点間の中間点を生成する。
 *
 * Catmull-Rom スプラインは全ての制御点を通過するため、
 * 駅間の補間に適している（ベジェ曲線は制御点を通過しない）。
 *
 * @param p0 前の駅（カーブ方向推定用）
 * @param p1 始点駅
 * @param p2 終点駅
 * @param p3 次の駅（カーブ方向推定用）
 * @param numPoints 生成する中間点数
 * @param tension テンション値（0.0〜1.0、鉄道は0.3〜0.5が適切）
 */
function catmullRomInterpolate(
  p0: { lat: number; lng: number },
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
  p3: { lat: number; lng: number },
  numPoints: number,
  tension: number = 0.4,
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  const alpha = tension;

  for (let j = 1; j <= numPoints; j++) {
    const t = j / (numPoints + 1);
    const t2 = t * t;
    const t3 = t2 * t;

    // Catmull-Rom 基底関数（tension パラメータ付き）
    // 参考: https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
    const h1 = -alpha * t3 + 2 * alpha * t2 - alpha * t;
    const h2 = (2 - alpha) * t3 + (alpha - 3) * t2 + 1;
    const h3 = (alpha - 2) * t3 + (3 - 2 * alpha) * t2 + alpha * t;
    const h4 = alpha * t3 - alpha * t2;

    points.push({
      lat: h1 * p0.lat + h2 * p1.lat + h3 * p2.lat + h4 * p3.lat,
      lng: h1 * p0.lng + h2 * p1.lng + h3 * p2.lng + h4 * p3.lng,
    });
  }
  return points;
}

/**
 * 駅間に補間ポイントを挿入して滑らかなポリラインを生成する。
 *
 * 改良点:
 * 1. Catmull-Rom スプライン: 全制御点を通過するため、駅座標を正確に通る
 *    滑らかなカーブを生成できる（旧: 2次ベジェ曲線は制御点を通過しない）
 * 2. trackPoints 対応: LineData に実際の線路形状データ（中間座標点）が
 *    定義されている場合はそれを使用し、Catmull-Rom で滑らかに接続する
 * 3. 距離適応的な補間密度: 駅間距離に応じて中間点数を調整
 * 4. 地下鉄特化: 地下鉄路線は直線的なセグメントが多いため tension を低く設定
 *
 * @param stations 駅リスト（順序は路線上の並び順）
 * @param line オプショナルな路線データ（trackPoints・vehicleType の参照用）
 */
function interpolateStationPoints(
  stations: Station[],
  line?: LineData,
): Array<{ lat: number; lng: number }> {
  if (stations.length < 2) {
    return stations.map((s) => ({ lat: s.lat, lng: s.lng }));
  }

  // 路線タイプに基づいてテンション値を調整
  // 地下鉄: 直線的な区間が多い → 低テンション
  // 新幹線: 緩やかな大カーブ → 中テンション
  // 在来線: 住宅地を縫うカーブ → やや高テンション
  let tension = 0.4;
  if (line) {
    switch (line.vehicleType) {
      case 'subway':
        tension = 0.2; // 地下鉄は直線的
        break;
      case 'shinkansen':
        tension = 0.35; // 新幹線は緩やかなカーブ
        break;
      case 'monorail':
        tension = 0.3;
        break;
      default:
        tension = 0.4; // 在来線
    }
  }

  const trackPoints = line?.trackPoints;
  const points: Array<{ lat: number; lng: number }> = [];

  for (let i = 0; i < stations.length; i++) {
    // 現在の駅座標を追加
    points.push({ lat: stations[i].lat, lng: stations[i].lng });

    if (i < stations.length - 1) {
      const cur = stations[i];
      const next = stations[i + 1];

      // trackPoints にこの区間の実線路形状データがあるか確認
      const segKey = `${cur.id}:${next.id}`;
      const segKeyReverse = `${next.id}:${cur.id}`;
      let segTrackPoints = trackPoints?.[segKey];
      if (!segTrackPoints && trackPoints?.[segKeyReverse]) {
        segTrackPoints = [...trackPoints[segKeyReverse]].reverse();
      }

      if (segTrackPoints && segTrackPoints.length > 0) {
        // 実線路形状データがある場合: trackPoints を使用して
        // さらに各区間を Catmull-Rom で滑らかに補間する
        const allSegPoints = [
          { lat: cur.lat, lng: cur.lng },
          ...segTrackPoints,
          { lat: next.lat, lng: next.lng },
        ];
        for (let k = 0; k < allSegPoints.length - 1; k++) {
          const sp0 = k > 0 ? allSegPoints[k - 1] : mirrorPoint(allSegPoints[k], allSegPoints[k + 1]);
          const sp1 = allSegPoints[k];
          const sp2 = allSegPoints[k + 1];
          const sp3 = k < allSegPoints.length - 2 ? allSegPoints[k + 2] : mirrorPoint(allSegPoints[k + 1], allSegPoints[k]);

          // trackPoints 間は短い距離なので少なめの補間点
          const subDist = Math.sqrt(
            (sp2.lat - sp1.lat) ** 2 + (sp2.lng - sp1.lng) ** 2,
          );
          const subPoints = Math.max(1, Math.min(4, Math.round(subDist / 0.003)));
          const interpolated = catmullRomInterpolate(sp0, sp1, sp2, sp3, subPoints, tension);
          points.push(...interpolated);

          // 最後の区間でなければ次の trackPoint も追加
          if (k < allSegPoints.length - 2) {
            points.push({ lat: sp2.lat, lng: sp2.lng });
          }
        }
      } else {
        // trackPoints がない場合: Catmull-Rom スプラインで駅間を補間
        const dLat = next.lat - cur.lat;
        const dLng = next.lng - cur.lng;
        const segDist = Math.sqrt(dLat * dLat + dLng * dLng);

        // 補間点数: 距離に応じて調整（約0.004度≒400mごとに1点、最低2・最大10）
        const numIntermediatePoints = Math.max(2, Math.min(10, Math.round(segDist / 0.004)));

        // Catmull-Rom の前後制御点（p0, p3）を決定
        // 前の駅がない場合は現在の駅を中心に次の駅を鏡像反転
        // 次の次の駅がない場合も同様
        const p0 = i > 0
          ? { lat: stations[i - 1].lat, lng: stations[i - 1].lng }
          : mirrorPoint({ lat: cur.lat, lng: cur.lng }, { lat: next.lat, lng: next.lng });

        const p3 = i < stations.length - 2
          ? { lat: stations[i + 2].lat, lng: stations[i + 2].lng }
          : mirrorPoint({ lat: next.lat, lng: next.lng }, { lat: cur.lat, lng: cur.lng });

        const interpolated = catmullRomInterpolate(
          p0,
          { lat: cur.lat, lng: cur.lng },
          { lat: next.lat, lng: next.lng },
          p3,
          numIntermediatePoints,
          tension,
        );
        points.push(...interpolated);
      }
    }
  }

  return points;
}

/**
 * 点 p を基準点 center の対称位置に鏡像反転する。
 * Catmull-Rom スプラインの端点処理で使用。
 */
function mirrorPoint(
  center: { lat: number; lng: number },
  other: { lat: number; lng: number },
): { lat: number; lng: number } {
  return {
    lat: 2 * center.lat - other.lat,
    lng: 2 * center.lng - other.lng,
  };
}

// ============================================================
// Google Directions API 経由の実ポリライン取得（キャッシュ付き）
// ============================================================

/**
 * 取得済みの Google Directions ポリラインをキャッシュするマップ。
 * キー: "lineId:stationA_id:stationB_id"
 * 値: デコード済み座標点配列
 */
const transitPolylineCache = new Map<string, Array<{ lat: number; lng: number }>>();

/**
 * Google Directions API（WebView 経由）から取得した transit ポリラインで
 * 既存のルートステップを強化する。
 *
 * この関数はルート構築後に非同期で呼ばれ、Google Directions API の
 * transit モードから実際の線路ポリラインを取得してキャッシュする。
 * 2回目以降はキャッシュから即座に返す。
 *
 * @param steps ルートステップ配列（polyline フィールドを上書き更新する）
 * @param originStation 出発駅
 * @param destStation 到着駅
 * @param requestDirectionsFn WebView 経由で Directions API を呼ぶ関数
 * @returns 更新されたステップ配列を resolve する Promise
 */
export async function enhanceTransitPolylines(
  steps: RouteStep[],
  originStation: { lat: number; lng: number; name: string },
  destStation: { lat: number; lng: number; name: string },
  fetchPolylineFn?: (
    origin: { lat: number; lng: number },
    dest: { lat: number; lng: number },
  ) => Promise<string | null>,
): Promise<RouteStep[]> {
  if (!fetchPolylineFn) return steps;

  const cacheKey = `${originStation.lat},${originStation.lng}:${destStation.lat},${destStation.lng}`;
  const cached = transitPolylineCache.get(cacheKey);

  if (cached && cached.length > 0) {
    // キャッシュから全区間のポリラインを分配
    distributePolylineToSteps(steps, cached);
    return steps;
  }

  try {
    const encodedPolyline = await fetchPolylineFn(
      { lat: originStation.lat, lng: originStation.lng },
      { lat: destStation.lat, lng: destStation.lng },
    );

    if (encodedPolyline) {
      const decoded = decodePolylinePoints(encodedPolyline);
      if (decoded.length > 0) {
        transitPolylineCache.set(cacheKey, decoded);
        distributePolylineToSteps(steps, decoded);
      }
    }
  } catch (err) {
    // API エラー時はフォールバック（既存の補間ポリライン）をそのまま使用
    console.warn('[transitRouter] enhanceTransitPolylines failed:', err);
  }

  return steps;
}

/**
 * Google Directions API から取得した全体ポリラインを、
 * 各ステップの始点・終点に基づいて分配する。
 */
function distributePolylineToSteps(
  steps: RouteStep[],
  fullPolyline: Array<{ lat: number; lng: number }>,
): void {
  if (steps.length === 0 || fullPolyline.length < 2) return;

  for (const step of steps) {
    const startLat = step.startLocation.lat;
    const startLng = step.startLocation.lng;
    const endLat = step.endLocation.lat;
    const endLng = step.endLocation.lng;

    // 全体ポリラインから最も近い開始・終了インデックスを検索
    let bestStartIdx = 0;
    let bestStartDist = Infinity;
    let bestEndIdx = fullPolyline.length - 1;
    let bestEndDist = Infinity;

    for (let i = 0; i < fullPolyline.length; i++) {
      const d = (fullPolyline[i].lat - startLat) ** 2 + (fullPolyline[i].lng - startLng) ** 2;
      if (d < bestStartDist) {
        bestStartDist = d;
        bestStartIdx = i;
      }
    }

    for (let i = bestStartIdx; i < fullPolyline.length; i++) {
      const d = (fullPolyline[i].lat - endLat) ** 2 + (fullPolyline[i].lng - endLng) ** 2;
      if (d < bestEndDist) {
        bestEndDist = d;
        bestEndIdx = i;
      }
    }

    if (bestStartIdx <= bestEndIdx) {
      const segmentPoints = fullPolyline.slice(bestStartIdx, bestEndIdx + 1);
      if (segmentPoints.length >= 2) {
        step.polyline = encodePolyline(segmentPoints);
      }
    }
  }
}

/**
 * Google Encoded Polyline をデコードする（enhanceTransitPolylines 用）
 */
function decodePolylinePoints(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

// ============================================================
// Steps 構築ヘルパー
// ============================================================

function buildWalkingSteps(
  start: LatLng, end: LatLng,
  distanceMeters: number, durationMinutes: number,
): RouteStep[] {
  // 始点と終点の2点でポリラインを生成
  const polyline = encodePolyline([
    { lat: start.lat, lng: start.lng },
    { lat: end.lat, lng: end.lng },
  ]);

  return [
    {
      stepId: `walk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      instruction: `目的地まで徒歩 約${Math.round(distanceMeters)}m`,
      distanceMeters: Math.round(distanceMeters),
      durationSeconds: Math.round(durationMinutes * 60),
      startLocation: start,
      endLocation: end,
      polyline,
      hasStairs: false,
      hasSlope: false,
    },
  ];
}

function buildTransitSteps(stations: Station[], line: LineData): RouteStep[] {
  const steps: RouteStep[] = [];
  const intervalMinutes = line.avgIntervalMinutes ?? 2;
  const vehicleType = line.vehicleType === 'shinkansen' ? 'train' : line.vehicleType;

  // 全駅を一括で Catmull-Rom スプライン補間し、滑らかなカーブを生成
  // 路線データを渡すことで trackPoints や vehicleType に応じた最適な補間を行う
  const allPolylinePoints = interpolateStationPoints(stations, line);

  // 各駅の座標に対応するインデックスを記録（区間切り出し用）
  const stationPointIndices: number[] = [];
  let searchFrom = 0;
  for (const station of stations) {
    let foundIdx = -1;
    for (let pi = searchFrom; pi < allPolylinePoints.length; pi++) {
      if (Math.abs(allPolylinePoints[pi].lat - station.lat) < 1e-9 &&
          Math.abs(allPolylinePoints[pi].lng - station.lng) < 1e-9) {
        foundIdx = pi;
        break;
      }
    }
    if (foundIdx >= 0) {
      stationPointIndices.push(foundIdx);
      searchFrom = foundIdx + 1; // 次の駅は現在の駅より後ろから検索開始
    } else {
      // フォールバック: 前のインデックスを使用
      stationPointIndices.push(searchFrom > 0 ? searchFrom - 1 : 0);
    }
  }

  for (let i = 0; i < stations.length - 1; i++) {
    const from = stations[i];
    const to = stations[i + 1];
    const dist = safeHaversine(from.lat, from.lng, to.lat, to.lng);

    // 全体の補間済みポイントからこの区間を切り出す
    const startIdx = stationPointIndices[i];
    const endIdx = stationPointIndices[i + 1];
    const segmentPoints = startIdx < endIdx
      ? allPolylinePoints.slice(startIdx, endIdx + 1)
      : [{ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng }];

    const polyline = encodePolyline(segmentPoints);

    steps.push({
      stepId: `transit_${line.id}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      instruction: `${line.name} ${from.name} → ${to.name}`,
      distanceMeters: Math.round(dist),
      durationSeconds: intervalMinutes * 60,
      startLocation: { lat: from.lat, lng: from.lng },
      endLocation: { lat: to.lat, lng: to.lng },
      polyline,
      hasStairs: false,
      hasSlope: false,
      transitDetail: {
        lineName: line.name,
        lineColor: line.color,
        vehicleType: vehicleType as TransitDetail['vehicleType'],
        departureStop: from.name,
        arrivalStop: to.name,
        numStops: 1,
      },
    });
  }
  return steps;
}

function buildWarnings(legs: WaypointLeg[], userProfile?: UserProfile): string[] {
  const warnings: string[] = [];

  const isWheelchair = userProfile?.mobilityType === 'wheelchair';
  const isStroller = userProfile?.mobilityType === 'stroller';
  const hasElderlyCompanion = userProfile?.companions?.includes('elderly') ?? false;

  for (const leg of legs) {
    if (leg.mode === 'walking' && leg.distanceMeters > 1000) {
      warnings.push(`${leg.originName}から${leg.destinationName}まで約${Math.round(leg.distanceMeters)}mの徒歩区間があります。`);
    }
    // 高齢者同行時は500m超の徒歩でも警告
    if (leg.mode === 'walking' && leg.distanceMeters > 500 && leg.distanceMeters <= 1000 && hasElderlyCompanion) {
      warnings.push(`${leg.originName}から${leg.destinationName}まで約${Math.round(leg.distanceMeters)}mの徒歩区間があります（高齢者同行にご注意ください）。`);
    }
  }

  const transitLegs = legs.filter((l) => l.mode === 'transit');
  const transferCount = transitLegs.length > 0 ? transitLegs.length - 1 : 0;
  if (transferCount === 0 && transitLegs.length > 0) {
    warnings.push('乗り換えなしの直通ルートです。');
  } else if (transferCount === 1) {
    warnings.push('1回の乗り換えがあります。');
  } else if (transferCount >= 2) {
    warnings.push(`このルートは${transferCount}回の乗り換えがあります。乗り換えの少ないルートも検討してください。`);
  }

  // 車椅子・ベビーカーユーザー向けのバリアフリー警告
  if (isWheelchair || isStroller) {
    const mobilityLabel = isWheelchair ? '車椅子' : 'ベビーカー';

    if (transferCount > 0) {
      warnings.push(`${mobilityLabel}での乗り換えが${transferCount}回あります。エレベーターの位置を事前にご確認ください。`);
    }
  }

  // 高齢者同行時の乗り換え警告
  if (hasElderlyCompanion && transferCount >= 2) {
    warnings.push('高齢者同行の場合、乗り換えの少ないルートをおすすめします。');
  }

  return warnings;
}

// ============================================================
// テスト用エクスポート（内部関数へのアクセス）
// ============================================================

/** @internal テスト専用。プロダクションコードでは使用しないこと。 */
export const __test__ = {
  MinHeap,
  haversineDistance,
  safeHaversine,
  extractSegments,
  buildAdjacencyGraph,
  findPaths,
  walkingMinutes,
};
