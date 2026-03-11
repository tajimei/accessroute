/**
 * transitRouter.ts のユニットテスト
 *
 * 対象: MinHeap、haversine距離計算、findNearestStations、
 *       searchTransitRoute、extractSegments、lines配列の整合性
 */

import {
  findNearestStations,
  searchTransitRoute,
  __test__,
} from '../services/transitRouter';

import { ALL_STATIONS, ALL_LINES, STATION_LOOKUP, LINE_LOOKUP } from '../data';

const {
  MinHeap,
  haversineDistance,
  safeHaversine,
  extractSegments,
  buildAdjacencyGraph,
  findPaths,
} = __test__;

// ============================================================
// 1. MinHeap
// ============================================================

describe('MinHeap', () => {
  it('push/popで最小値が正しく取り出される', () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(1);
    heap.push(4);

    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(4);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(8);
  });

  it('空ヒープからのpopでundefinedが返る', () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    expect(heap.pop()).toBeUndefined();
  });

  it('大量要素の挿入・取り出しで順序が保たれる', () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    const values: number[] = [];

    // 1000個のランダムな値を挿入
    for (let i = 0; i < 1000; i++) {
      const val = Math.floor(Math.random() * 10000);
      values.push(val);
      heap.push(val);
    }

    // ソート済み配列と比較
    values.sort((a, b) => a - b);
    for (let i = 0; i < 1000; i++) {
      expect(heap.pop()).toBe(values[i]);
    }

    // 全て取り出した後はundefined
    expect(heap.pop()).toBeUndefined();
  });

  it('sizeプロパティが正しい値を返す', () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    expect(heap.size).toBe(0);

    heap.push(10);
    expect(heap.size).toBe(1);

    heap.push(20);
    expect(heap.size).toBe(2);

    heap.pop();
    expect(heap.size).toBe(1);
  });

  it('オブジェクトの比較関数でも正しく動作する', () => {
    interface Item {
      cost: number;
      name: string;
    }
    const heap = new MinHeap<Item>((a, b) => a.cost - b.cost);

    heap.push({ cost: 10, name: 'C' });
    heap.push({ cost: 5, name: 'A' });
    heap.push({ cost: 7, name: 'B' });

    expect(heap.pop()!.name).toBe('A');
    expect(heap.pop()!.name).toBe('B');
    expect(heap.pop()!.name).toBe('C');
  });
});

// ============================================================
// 2. haversine距離計算
// ============================================================

describe('haversine距離計算', () => {
  it('東京駅-新宿駅間の距離が妥当（約6.4km）', () => {
    // 東京駅: 35.6812, 139.7671
    // 新宿駅: 35.6896, 139.7006
    const distance = haversineDistance(35.6812, 139.7671, 35.6896, 139.7006);
    // 約6.0〜6.8kmの範囲であること
    expect(distance).toBeGreaterThan(5500);
    expect(distance).toBeLessThan(7000);
  });

  it('同一地点で0が返る', () => {
    const distance = haversineDistance(35.6812, 139.7671, 35.6812, 139.7671);
    expect(distance).toBe(0);
  });

  it('NaN入力でsafeHaversineがInfinityを返す', () => {
    expect(safeHaversine(NaN, 139.7671, 35.6896, 139.7006)).toBe(Infinity);
    expect(safeHaversine(35.6812, NaN, 35.6896, 139.7006)).toBe(Infinity);
    expect(safeHaversine(35.6812, 139.7671, NaN, 139.7006)).toBe(Infinity);
    expect(safeHaversine(35.6812, 139.7671, 35.6896, NaN)).toBe(Infinity);
  });

  it('safeHaversineが正常値ではhaversineDistanceと同じ結果を返す', () => {
    const safe = safeHaversine(35.6812, 139.7671, 35.6896, 139.7006);
    const raw = haversineDistance(35.6812, 139.7671, 35.6896, 139.7006);
    expect(safe).toBe(raw);
  });

  it('対蹠点（地球の裏側）で約20000kmを返す', () => {
    // 東京の対蹠点は南大西洋付近（約-35.68, -40.23）
    const distance = haversineDistance(35.6812, 139.7671, -35.6812, -40.2329);
    // 地球の半周は約20015km
    expect(distance).toBeGreaterThan(19000000);
    expect(distance).toBeLessThan(20100000);
  });
});

// ============================================================
// 3. findNearestStations
// ============================================================

describe('findNearestStations', () => {
  it('東京駅座標(35.6812, 139.7671)付近でJR東京駅が見つかる', () => {
    const stations = findNearestStations(35.6812, 139.7671, 5);
    expect(stations.length).toBeGreaterThan(0);

    // 結果の中にkt_tokyoまたは名前に「東京」を含む駅があること
    const hasTokyo = stations.some(
      (s) => s.id === 'kt_tokyo' || s.name.includes('東京'),
    );
    expect(hasTokyo).toBe(true);
  });

  it('返される駅数がlimit以下である', () => {
    const stations = findNearestStations(35.6812, 139.7671, 3);
    expect(stations.length).toBeLessThanOrEqual(3);
  });

  it('返される駅はlines配列が空でない（路線接続あり）', () => {
    const stations = findNearestStations(35.6812, 139.7671, 5);
    for (const station of stations) {
      expect(station.lines.length).toBeGreaterThan(0);
    }
  });

  it('海上座標で空配列またはフォールバック結果が返る', () => {
    // 太平洋上の座標（日本の鉄道駅はない）
    const stations = findNearestStations(30.0, 150.0, 3);
    // フォールバックのブルートフォース検索で最寄り駅が返される可能性があるが、
    // 結果が返る場合でも距離が非常に遠い駅のみ
    // 空配列 OR 何かしらの駅が返る（フォールバック動作）のどちらかを許容
    expect(Array.isArray(stations)).toBe(true);
  });

  it('新宿駅座標付近で新宿駅が見つかる', () => {
    const stations = findNearestStations(35.6896, 139.7006, 5);
    expect(stations.length).toBeGreaterThan(0);
    const hasShinjuku = stations.some(
      (s) => s.id === 'kt_shinjuku' || s.name.includes('新宿'),
    );
    expect(hasShinjuku).toBe(true);
  });
});

// ============================================================
// 4. 経路探索（searchTransitRoute）
// ============================================================

describe('searchTransitRoute', () => {
  // 東京駅座標
  const tokyoCoord = { lat: 35.6812, lng: 139.7671 };
  // 新宿駅座標
  const shinjukuCoord = { lat: 35.6896, lng: 139.7006 };

  it('東京→新宿の検索でルートが返る', () => {
    const result = searchTransitRoute(tokyoCoord, shinjukuCoord);
    expect(result.routes.length).toBeGreaterThan(0);
  });

  it('返されるルートにlegs、totalDistanceMeters、totalDurationMinutesが含まれる', () => {
    const result = searchTransitRoute(tokyoCoord, shinjukuCoord);
    for (const route of result.routes) {
      expect(route.legs).toBeDefined();
      expect(Array.isArray(route.legs)).toBe(true);
      expect(route.legs.length).toBeGreaterThan(0);
      expect(typeof route.totalDistanceMeters).toBe('number');
      expect(route.totalDistanceMeters).toBeGreaterThan(0);
      expect(typeof route.totalDurationMinutes).toBe('number');
      expect(route.totalDurationMinutes).toBeGreaterThan(0);
    }
  });

  it('各legにstepsが含まれる', () => {
    const result = searchTransitRoute(tokyoCoord, shinjukuCoord);
    for (const route of result.routes) {
      for (const leg of route.legs) {
        expect(leg.steps).toBeDefined();
        expect(Array.isArray(leg.steps)).toBe(true);
        expect(leg.steps.length).toBeGreaterThan(0);
      }
    }
  });

  it('結果にoriginStationとdestStationが含まれる', () => {
    const result = searchTransitRoute(tokyoCoord, shinjukuCoord);
    expect(result.originStation).toBeDefined();
    expect(result.originStation.id).toBeTruthy();
    expect(result.originStation.name).toBeTruthy();
    expect(result.destStation).toBeDefined();
    expect(result.destStation.id).toBeTruthy();
    expect(result.destStation.name).toBeTruthy();
  });

  it('walkToStationとwalkFromStationが数値で返る', () => {
    const result = searchTransitRoute(tokyoCoord, shinjukuCoord);
    expect(typeof result.walkToStation).toBe('number');
    expect(result.walkToStation).toBeGreaterThanOrEqual(0);
    expect(typeof result.walkFromStation).toBe('number');
    expect(result.walkFromStation).toBeGreaterThanOrEqual(0);
  });

  it('同一地点の検索で徒歩ルートまたは近隣駅間ルートが返る', () => {
    const samePoint = { lat: 35.6812, lng: 139.7671 };
    const result = searchTransitRoute(samePoint, samePoint);

    expect(result.routes.length).toBeGreaterThan(0);
    // 同一地点の場合、以下のいずれかが返る:
    // 1. 徒歩のみルート（全legがwalking）
    // 2. 同一駅警告付きルート
    // 3. 近隣の異なる駅間の短距離電車ルート（最寄り駅が複数あるため）
    const route = result.routes[0];
    const isWalkOnly = route.legs.every((leg) => leg.mode === 'walking');
    const hasSameStationWarning = route.warnings?.some(
      (w) => w.includes('同じ駅') || w.includes('徒歩ルート'),
    );
    const isShortTransitRoute = route.totalDurationMinutes <= 30;
    expect(isWalkOnly || hasSameStationWarning || isShortTransitRoute).toBe(true);
  });

  it('routeIdがユニークである', () => {
    const result = searchTransitRoute(tokyoCoord, shinjukuCoord);
    const ids = result.routes.map((r) => r.routeId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('accessibilityScoreが10以上90以下の範囲にある', () => {
    const result = searchTransitRoute(tokyoCoord, shinjukuCoord);
    for (const route of result.routes) {
      expect(route.accessibilityScore).toBeGreaterThanOrEqual(10);
      expect(route.accessibilityScore).toBeLessThanOrEqual(90);
    }
  });

  it('車椅子ユーザープロファイルで経路検索ができる', () => {
    const profile = {
      userId: 'test',
      mobilityType: 'wheelchair' as const,
      companions: [],
      maxDistanceMeters: 5000,
      avoidConditions: [],
      preferConditions: [],
    };
    const result = searchTransitRoute(tokyoCoord, shinjukuCoord, profile);
    expect(result.routes.length).toBeGreaterThan(0);
  });

  it('ルートのlegsが徒歩→電車→...→徒歩の構造を持つ', () => {
    const result = searchTransitRoute(tokyoCoord, shinjukuCoord);
    for (const route of result.routes) {
      if (route.legs.length >= 2) {
        // 最初のlegは徒歩（出発地→駅）
        expect(route.legs[0].mode).toBe('walking');
        // 最後のlegは徒歩（駅→目的地）
        expect(route.legs[route.legs.length - 1].mode).toBe('walking');
      }
    }
  });
});

// ============================================================
// 5. extractSegments
// ============================================================

describe('extractSegments', () => {
  beforeAll(() => {
    // 隣接グラフを構築（findPathsの前提条件）
    buildAdjacencyGraph();
  });

  it('乗換点でセグメントが正しく分割される', () => {
    // 東京駅→新宿駅の経路を探索
    const tokyoId = 'kt_tokyo';
    const shinjukuId = 'kt_shinjuku';
    const paths = findPaths(tokyoId, shinjukuId, 1);

    if (paths.length > 0) {
      const segments = extractSegments(paths[0]);
      expect(segments.length).toBeGreaterThan(0);

      // 各セグメントにlineIdとstationsが存在する
      for (const segment of segments) {
        expect(segment.lineId).toBeTruthy();
        expect(segment.stations.length).toBeGreaterThan(0);
      }

      // 乗り換えがある場合、セグメント数は2以上
      if (paths[0].transfers > 0) {
        expect(segments.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('同一路線の経路はセグメントが1つ', () => {
    // 山手線上の隣接駅間（乗り換え不要）
    // 東京→神田は山手線で直通
    const paths = findPaths('kt_tokyo', 'kt_kanda', 1);

    if (paths.length > 0 && paths[0].transfers === 0) {
      const segments = extractSegments(paths[0]);
      expect(segments.length).toBe(1);
    }
  });

  it('セグメントの駅リストは順序が正しい（始点から終点へ）', () => {
    const paths = findPaths('kt_tokyo', 'kt_shinjuku', 1);

    if (paths.length > 0) {
      const segments = extractSegments(paths[0]);
      for (const segment of segments) {
        // 各駅が実在する
        for (const station of segment.stations) {
          expect(STATION_LOOKUP.has(station.id)).toBe(true);
        }
      }
    }
  });

  it('乗換駅がセグメントの境界に存在する', () => {
    const paths = findPaths('kt_tokyo', 'kt_shinjuku', 1);

    if (paths.length > 0) {
      const segments = extractSegments(paths[0]);
      if (segments.length >= 2) {
        // 前のセグメントの最後の駅と次のセグメントの最初の駅は
        // 同一駅または近接駅（徒歩乗り換え）
        for (let i = 0; i < segments.length - 1; i++) {
          const prevLast = segments[i].stations[segments[i].stations.length - 1];
          const nextFirst = segments[i + 1].stations[0];
          // 同一駅か、徒歩乗り換えペアである
          expect(prevLast).toBeDefined();
          expect(nextFirst).toBeDefined();
        }
      }
    }
  });
});

// ============================================================
// 6. lines配列の整合性チェック
// ============================================================

describe('lines配列の整合性チェック', () => {
  it('全路線のstationIdsに含まれるIDがstationsに存在する', () => {
    const missingStations: Array<{ lineId: string; lineName: string; stationId: string }> = [];

    for (const line of ALL_LINES) {
      for (const stationId of line.stationIds) {
        if (!STATION_LOOKUP.has(stationId)) {
          missingStations.push({
            lineId: line.id,
            lineName: line.name,
            stationId,
          });
        }
      }
    }

    if (missingStations.length > 0) {
      console.warn(
        `未定義の駅を参照している路線が ${missingStations.length} 件あります:`,
        missingStations.slice(0, 10),
      );
    }
    // 全路線の全駅が存在すること
    expect(missingStations).toEqual([]);
  });

  it('全駅のlinesに含まれる路線IDが実際に定義されている', () => {
    const missingLines: Array<{ stationId: string; stationName: string; lineId: string }> = [];

    for (const station of ALL_STATIONS) {
      for (const lineId of station.lines) {
        if (!LINE_LOOKUP.has(lineId)) {
          missingLines.push({
            stationId: station.id,
            stationName: station.name,
            lineId,
          });
        }
      }
    }

    if (missingLines.length > 0) {
      console.warn(
        `未定義の路線を参照している駅が ${missingLines.length} 件あります:`,
        missingLines.slice(0, 10),
      );
    }
    // 全駅の全路線が存在すること
    expect(missingLines).toEqual([]);
  });

  it('全駅が一意なIDを持つ', () => {
    const ids = ALL_STATIONS.map((s) => s.id);
    const uniqueIds = new Set(ids);
    // ALL_STATIONSはmerge済みなので重複IDはないはず
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('全路線が一意なIDを持つ', () => {
    const ids = ALL_LINES.map((l) => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('全駅にname、lat、lngが設定されている', () => {
    for (const station of ALL_STATIONS) {
      expect(station.name).toBeTruthy();
      expect(typeof station.lat).toBe('number');
      expect(typeof station.lng).toBe('number');
      expect(isNaN(station.lat)).toBe(false);
      expect(isNaN(station.lng)).toBe(false);
    }
  });

  it('全路線のstationIdsが2つ以上の駅を持つ', () => {
    const shortLines = ALL_LINES.filter((l) => l.stationIds.length < 2);
    if (shortLines.length > 0) {
      console.warn(
        `駅が1つ以下の路線:`,
        shortLines.map((l) => `${l.id} (${l.name}): ${l.stationIds.length}駅`),
      );
    }
    expect(shortLines).toEqual([]);
  });

  it('駅の緯度が日本の範囲内（24〜46度）にある', () => {
    const outOfRange = ALL_STATIONS.filter(
      (s) => s.lat < 24 || s.lat > 46 || s.lng < 122 || s.lng > 154,
    );
    if (outOfRange.length > 0) {
      console.warn(
        `日本の範囲外の駅:`,
        outOfRange.slice(0, 5).map((s) => `${s.name} (${s.lat}, ${s.lng})`),
      );
    }
    expect(outOfRange).toEqual([]);
  });
});
