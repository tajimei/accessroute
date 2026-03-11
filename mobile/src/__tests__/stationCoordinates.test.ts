/**
 * 全駅座標バリデーションテスト
 *
 * 全国鉄道データベースの座標データの整合性を検証する。
 */

import { ALL_STATIONS, ALL_LINES, STATION_LOOKUP } from '../data/index';
import { shinkansenData } from '../data/regions/shinkansen';
import { kantoJrData } from '../data/regions/kanto_jr';
import { kantoPrivateData } from '../data/regions/kanto_private';
import { kantoMetroData } from '../data/regions/kanto_metro';
import { kansaiData } from '../data/regions/kansai';
import { chubuData } from '../data/regions/chubu';
import { kyushuData } from '../data/regions/kyushu';
import { hokkaidoData } from '../data/regions/hokkaido';
import { RegionData, StationData } from '../data/types';

/**
 * 2点間の距離をメートルで計算（Haversine公式）
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // 地球の半径（メートル）
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

describe('全駅座標バリデーション', () => {
  test('データが正しく読み込まれていること', () => {
    expect(ALL_STATIONS.length).toBeGreaterThan(0);
    expect(ALL_LINES.length).toBeGreaterThan(0);
    console.log(`総駅数: ${ALL_STATIONS.length}, 総路線数: ${ALL_LINES.length}`);
  });

  test('全駅の座標が日本国内（lat: 24-46, lng: 122-146）であること', () => {
    const outOfRange: string[] = [];
    for (const station of ALL_STATIONS) {
      if (
        station.lat < 24 ||
        station.lat > 46 ||
        station.lng < 122 ||
        station.lng > 146
      ) {
        outOfRange.push(
          `${station.name}(${station.id}): lat=${station.lat}, lng=${station.lng}`
        );
      }
    }
    if (outOfRange.length > 0) {
      console.error('日本国外の座標を持つ駅:\n' + outOfRange.join('\n'));
    }
    expect(outOfRange).toEqual([]);
  });

  test('(0,0)座標の駅がないこと', () => {
    const zeroCoords: string[] = [];
    for (const station of ALL_STATIONS) {
      if (station.lat === 0 && station.lng === 0) {
        zeroCoords.push(`${station.name}(${station.id})`);
      }
    }
    if (zeroCoords.length > 0) {
      console.error('(0,0)座標の駅:\n' + zeroCoords.join('\n'));
    }
    expect(zeroCoords).toEqual([]);
  });

  test('隣接駅間の距離が50km以下であること（50km超は欠落駅の疑い、新幹線は100km）', () => {
    const violations: string[] = [];
    for (const line of ALL_LINES) {
      // 新幹線は駅間距離が長いため閾値を100kmに緩和
      const maxDistance = line.vehicleType === 'shinkansen' ? 100000 : 50000;
      for (let i = 0; i < line.stationIds.length - 1; i++) {
        const stA = STATION_LOOKUP.get(line.stationIds[i]);
        const stB = STATION_LOOKUP.get(line.stationIds[i + 1]);
        if (!stA || !stB) continue;
        const dist = haversineDistance(stA.lat, stA.lng, stB.lat, stB.lng);
        if (dist > maxDistance) {
          violations.push(
            `[${line.name}] ${stA.name}(${stA.id}) → ${stB.name}(${stB.id}): ${(dist / 1000).toFixed(1)}km`
          );
        }
      }
    }
    if (violations.length > 0) {
      console.error(
        '隣接駅間距離が50km超:\n' + violations.join('\n')
      );
    }
    expect(violations).toEqual([]);
  });

  test('隣接駅間の距離が50m以上であること（50m未満は座標重複の疑い）', () => {
    const violations: string[] = [];
    for (const line of ALL_LINES) {
      for (let i = 0; i < line.stationIds.length - 1; i++) {
        const stA = STATION_LOOKUP.get(line.stationIds[i]);
        const stB = STATION_LOOKUP.get(line.stationIds[i + 1]);
        if (!stA || !stB) continue;
        // 同じ駅IDの場合はスキップ
        if (stA.id === stB.id) continue;
        const dist = haversineDistance(stA.lat, stA.lng, stB.lat, stB.lng);
        if (dist < 50) {
          violations.push(
            `[${line.name}] ${stA.name}(${stA.id}) → ${stB.name}(${stB.id}): ${dist.toFixed(1)}m`
          );
        }
      }
    }
    if (violations.length > 0) {
      console.error(
        '隣接駅間距離が50m未満:\n' + violations.join('\n')
      );
    }
    expect(violations).toEqual([]);
  });

  test('同じIDの駅が複数ファイルで定義されている場合、座標差が500m以内であること', () => {
    const allRegions: { name: string; data: RegionData }[] = [
      { name: 'shinkansen', data: shinkansenData },
      { name: 'kanto_jr', data: kantoJrData },
      { name: 'kanto_private', data: kantoPrivateData },
      { name: 'kanto_metro', data: kantoMetroData },
      { name: 'kansai', data: kansaiData },
      { name: 'chubu', data: chubuData },
      { name: 'kyushu', data: kyushuData },
      { name: 'hokkaido', data: hokkaidoData },
    ];

    // 駅IDごとに、どのリージョンでどの座標で定義されているかを収集
    const stationDefs = new Map<
      string,
      Array<{ region: string; station: StationData }>
    >();
    for (const { name, data } of allRegions) {
      for (const station of data.stations) {
        if (!stationDefs.has(station.id)) {
          stationDefs.set(station.id, []);
        }
        stationDefs.get(station.id)!.push({ region: name, station });
      }
    }

    const violations: string[] = [];
    for (const [id, defs] of stationDefs) {
      if (defs.length < 2) continue;
      // 全ペアを比較
      for (let i = 0; i < defs.length; i++) {
        for (let j = i + 1; j < defs.length; j++) {
          const a = defs[i];
          const b = defs[j];
          const dist = haversineDistance(
            a.station.lat,
            a.station.lng,
            b.station.lat,
            b.station.lng
          );
          if (dist > 500) {
            violations.push(
              `${a.station.name}(${id}): ${a.region}(${a.station.lat},${a.station.lng}) vs ${b.region}(${b.station.lat},${b.station.lng}) → ${(dist).toFixed(0)}m`
            );
          }
        }
      }
    }
    if (violations.length > 0) {
      console.error(
        '同一IDで座標差500m超:\n' + violations.join('\n')
      );
    }
    expect(violations).toEqual([]);
  });
});
