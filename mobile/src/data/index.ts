/**
 * 全国鉄道データ統合モジュール
 *
 * 各地域のデータを統合し、transitRouter で使用する
 * 統一された駅・路線データベースを提供する。
 */

import { StationData, LineData, RegionData } from './types';
import { shinkansenData } from './regions/shinkansen';
import { kantoJrData } from './regions/kanto_jr';
import { kantoPrivateData } from './regions/kanto_private';
import { kantoMetroData } from './regions/kanto_metro';
import { kansaiData } from './regions/kansai';
import { chubuData } from './regions/chubu';
import { kyushuData } from './regions/kyushu';
import { hokkaidoData } from './regions/hokkaido';
import { tohokuData } from './regions/tohoku';
import { hokurikuData } from './regions/hokuriku';
import { shikokuData } from './regions/shikoku';
import { chugokuData } from './regions/chugoku';

/** 既存の東京データ（transitRouter.ts 内のハードコード）用のプレフィックス無し駅IDと kt_ 駅IDの対応マップ */
const TOKYO_LEGACY_MAPPING: Record<string, string> = {
  // 山手線・JR主要駅
  'tokyo': 'kt_tokyo',
  'shinagawa': 'kt_shinagawa',
  'shibuya': 'kt_shibuya',
  'shinjuku': 'kt_shinjuku',
  'ikebukuro': 'kt_ikebukuro',
  'ueno': 'kt_ueno',
  'akihabara': 'kt_akihabara',
  'meguro': 'kt_meguro',
  'ebisu': 'kt_ebisu',
  'osaki': 'kt_osaki',
  'hamamatsucho': 'kt_hamamatsucho',
  'shimbashi': 'kt_shimbashi',
  'kanda': 'kt_kanda',
  'nippori': 'kt_nippori',
  'tabata': 'kt_tabata',
  'nishi_nippori': 'kt_nishi_nippori',
  'ochanomizu': 'kt_ochanomizu',
  'yotsuya': 'kt_yotsuya',
  'nakano': 'kt_nakano',
  'kichijoji': 'kt_kichijoji',
  'ogikubo': 'kt_ogikubo',
  'otemachi': 'kt_otemachi',
  'ginza': 'kt_ginza',
  'asakusa': 'kt_asakusa',
  'kita_senju': 'kt_kita_senju',
  'gotanda': 'kt_gotanda',
  'naka_meguro': 'kt_nakameguro',
  'oshiage': 'kt_oshiage',
  'iidabashi': 'kt_iidabashi',
  'kudanshita': 'kt_kudanshita',
  'nihombashi': 'kt_nihombashi',
  'kasumigaseki': 'kt_kasumigaseki',
  'omotesando': 'kt_omotesando',
  'roppongi': 'kt_roppongi',
};

/**
 * 全地域のデータを統合する
 */
function mergeRegionData(...regions: RegionData[]): { stations: StationData[]; lines: LineData[] } {
  const stationMap = new Map<string, StationData>();
  const lineMap = new Map<string, LineData>();
  const allLines: LineData[] = [];

  for (const region of regions) {
    // 駅の統合（同じIDの駅は路線リストをマージ）
    for (const station of region.stations) {
      const existing = stationMap.get(station.id);
      if (existing) {
        // 既存駅に路線IDを追加
        const newLines = station.lines.filter((l) => !existing.lines.includes(l));
        existing.lines.push(...newLines);
        // バリアフリーフィールドのマージ（未設定の場合のみ後から来た値で補完）
        if (station.prefecture && !existing.prefecture) existing.prefecture = station.prefecture;
        if (station.hasElevator !== undefined && existing.hasElevator === undefined) existing.hasElevator = station.hasElevator;
        if (station.isWheelchairAccessible !== undefined && existing.isWheelchairAccessible === undefined) existing.isWheelchairAccessible = station.isWheelchairAccessible;
        if (station.hasEscalator !== undefined && existing.hasEscalator === undefined) existing.hasEscalator = station.hasEscalator;
        if (station.hasAccessibleRestroom !== undefined && existing.hasAccessibleRestroom === undefined) existing.hasAccessibleRestroom = station.hasAccessibleRestroom;
      } else {
        stationMap.set(station.id, { ...station, lines: [...station.lines] });
      }
    }

    // 路線の追加（重複IDがある場合はstationIdsをマージ）
    for (const line of region.lines) {
      const existingLine = lineMap.get(line.id);
      if (existingLine) {
        // 同一IDの路線が複数リージョンにある場合、stationIds をマージ
        const newStationIds = line.stationIds.filter((sid) => !existingLine.stationIds.includes(sid));
        existingLine.stationIds.push(...newStationIds);
        console.warn(`[mergeRegionData] 重複路線ID検出: ${line.id}（stationIds をマージ）`);
      } else {
        const lineCopy = { ...line, stationIds: [...line.stationIds] };
        lineMap.set(line.id, lineCopy);
        allLines.push(lineCopy);
      }
    }
  }

  return {
    stations: Array.from(stationMap.values()),
    lines: allLines,
  };
}

/**
 * 駅IDと路線IDの名前空間衝突を検出するバリデーション関数。
 * 開発時に衝突を早期発見するために mergeRegionData 完了後に呼び出す。
 */
function validateIdNamespaces(stations: StationData[], lines: LineData[]): void {
  const stationIds = new Set(stations.map((s) => s.id));
  const lineIds = new Set(lines.map((l) => l.id));

  // 駅IDと路線IDの重複チェック
  const collisions: string[] = [];
  for (const sid of stationIds) {
    if (lineIds.has(sid)) {
      collisions.push(sid);
    }
  }

  if (collisions.length > 0) {
    console.warn(
      `[validateIdNamespaces] 駅IDと路線IDが衝突しています（${collisions.length}件）: ${collisions.join(', ')}` +
      '\n  → 駅IDまたは路線IDをリネームして名前空間の分離を維持してください。',
    );
  }
}

/** 統合済み全国鉄道データ */
const merged = mergeRegionData(
  shinkansenData,
  kantoJrData,
  kantoPrivateData,
  kantoMetroData,
  kansaiData,
  chubuData,
  kyushuData,
  hokkaidoData,
  tohokuData,
  hokurikuData,
  shikokuData,
  chugokuData,
);

// 開発時の衝突検出バリデーション
validateIdNamespaces(merged.stations, merged.lines);

export const ALL_STATIONS: StationData[] = merged.stations;
export const ALL_LINES: LineData[] = merged.lines;
export const TOKYO_LEGACY_STATION_MAP = TOKYO_LEGACY_MAPPING;

/** 駅ID → StationData のルックアップマップ */
export const STATION_LOOKUP = new Map<string, StationData>();
for (const s of ALL_STATIONS) {
  STATION_LOOKUP.set(s.id, s);
}

/** 路線ID → LineData のルックアップマップ */
export const LINE_LOOKUP = new Map<string, LineData>();
for (const l of ALL_LINES) {
  LINE_LOOKUP.set(l.id, l);
}
