/**
 * 北陸地方 鉄道データ
 *
 * IRいしかわ鉄道、あいの風とやま鉄道、福井鉄道、えちぜん鉄道の
 * 駅・路線情報。駅IDは hr_ プレフィクス。
 *
 * 北陸新幹線は shinkansen.ts で定義済み。
 */

import { StationData, LineData, RegionData } from '../types';

// ---------------------------------------------------------------------------
// 駅データ
// ---------------------------------------------------------------------------

const stations: StationData[] = [
  // ========== IRいしかわ鉄道（金沢-大聖寺） ==========
  { id: 'hr_kanazawa', name: '金沢', lat: 36.5780, lng: 136.6488, lines: ['ir_ishikawa'], prefecture: '石川県' },
  { id: 'hr_nishi_kanazawa', name: '西金沢', lat: 36.5684, lng: 136.6258, lines: ['ir_ishikawa'], prefecture: '石川県' },
  { id: 'hr_nonoichi', name: '野々市', lat: 36.5548, lng: 136.6052, lines: ['ir_ishikawa'], prefecture: '石川県' },
  { id: 'hr_mattou', name: '松任', lat: 36.5368, lng: 136.5723, lines: ['ir_ishikawa'], prefecture: '石川県' },
  { id: 'hr_kaga_kasama', name: '加賀笠間', lat: 36.5221, lng: 136.5453, lines: ['ir_ishikawa'], prefecture: '石川県' },
  { id: 'hr_mikawa', name: '美川', lat: 36.4957, lng: 136.5047, lines: ['ir_ishikawa'], prefecture: '石川県' },
  { id: 'hr_komaiko', name: '小舞子', lat: 36.4810, lng: 136.4842, lines: ['ir_ishikawa'], prefecture: '石川県' },
  { id: 'hr_nouchi', name: '能美根上', lat: 36.4555, lng: 136.4695, lines: ['ir_ishikawa'], prefecture: '石川県' },
  { id: 'hr_komatsu', name: '小松', lat: 36.4078, lng: 136.4457, lines: ['ir_ishikawa'], prefecture: '石川県' },
  { id: 'hr_awazu', name: '粟津', lat: 36.3650, lng: 136.4070, lines: ['ir_ishikawa'], prefecture: '石川県' },
  { id: 'hr_kaga_onsen', name: '加賀温泉', lat: 36.3130, lng: 136.3637, lines: ['ir_ishikawa'], prefecture: '石川県' },
  { id: 'hr_daishoji', name: '大聖寺', lat: 36.3029, lng: 136.3249, lines: ['ir_ishikawa'], prefecture: '石川県' },

  // ========== あいの風とやま鉄道（倶利伽羅-市振） ==========
  { id: 'hr_kurikara', name: '倶利伽羅', lat: 36.6189, lng: 136.8167, lines: ['ainokaze'], prefecture: '石川県' },
  { id: 'hr_ishidou', name: '石動', lat: 36.6492, lng: 136.8677, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_fukuoka', name: '福岡', lat: 36.6688, lng: 136.8953, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_takaoka', name: '高岡', lat: 36.7448, lng: 137.0259, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_koshino_kata', name: '越中大門', lat: 36.7299, lng: 137.0646, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_oyabe', name: '小杉', lat: 36.7288, lng: 137.1080, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_kosugi', name: '呉羽', lat: 36.7040, lng: 137.1567, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_toyama', name: '富山', lat: 36.7013, lng: 137.2134, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_higashi_toyama', name: '東富山', lat: 36.7162, lng: 137.2622, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_mizuhashi', name: '水橋', lat: 36.7275, lng: 137.3024, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_namerikawa', name: '滑川', lat: 36.7619, lng: 137.3433, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_uozu', name: '魚津', lat: 36.8129, lng: 137.4019, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_kurobe', name: '黒部', lat: 36.8625, lng: 137.4390, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_nyuuzen', name: '入善', lat: 36.9303, lng: 137.5024, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_tomari', name: '泊', lat: 36.9538, lng: 137.5802, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_ecchuu_miyazaki', name: '越中宮崎', lat: 36.9762, lng: 137.6679, lines: ['ainokaze'], prefecture: '富山県' },
  { id: 'hr_ichiburi', name: '市振', lat: 36.9892, lng: 137.7224, lines: ['ainokaze'], prefecture: '富山県' },

  // ========== 福井鉄道 福武線（田原町-越前武生） ==========
  { id: 'hr_tawaramachi', name: '田原町', lat: 36.0690, lng: 136.2102, lines: ['fukutetsu_fukubu', 'echizen_mikuni'], prefecture: '福井県' },
  { id: 'hr_nishi_betsuin', name: '西別院', lat: 36.0655, lng: 136.2139, lines: ['fukutetsu_fukubu'], prefecture: '福井県' },
  { id: 'hr_fukui_ekimae', name: '福井駅前', lat: 36.0617, lng: 136.2207, lines: ['fukutetsu_fukubu'], prefecture: '福井県' },
  { id: 'hr_fukui_jo_mae', name: '福井城址大名町', lat: 36.0650, lng: 136.2225, lines: ['fukutetsu_fukubu'], prefecture: '福井県' },
  { id: 'hr_shiyakusho_mae', name: '仁愛女子高校', lat: 36.0596, lng: 136.2252, lines: ['fukutetsu_fukubu'], prefecture: '福井県' },
  { id: 'hr_asuwa_yama_koen_guchi', name: '足羽山公園口', lat: 36.0541, lng: 136.2277, lines: ['fukutetsu_fukubu'], prefecture: '福井県' },
  { id: 'hr_akadaimae', name: '赤十字前', lat: 36.0441, lng: 136.2310, lines: ['fukutetsu_fukubu'], prefecture: '福井県' },
  { id: 'hr_bell_mae', name: 'ベル前', lat: 36.0340, lng: 136.2306, lines: ['fukutetsu_fukubu'], prefecture: '福井県' },
  { id: 'hr_hanikawa', name: '花堂', lat: 36.0280, lng: 136.2253, lines: ['fukutetsu_fukubu'], prefecture: '福井県' },
  { id: 'hr_asahi_mae', name: 'あさひ前', lat: 36.0107, lng: 136.2211, lines: ['fukutetsu_fukubu'], prefecture: '福井県' },
  { id: 'hr_sabae', name: '鯖江', lat: 35.9565, lng: 136.1918, lines: ['fukutetsu_fukubu'], prefecture: '福井県' },
  { id: 'hr_nishi_sabae', name: '西鯖江', lat: 35.9505, lng: 136.1840, lines: ['fukutetsu_fukubu'], prefecture: '福井県' },
  { id: 'hr_echizen_takefu', name: '越前武生', lat: 35.9027, lng: 136.1694, lines: ['fukutetsu_fukubu'], prefecture: '福井県' },

  // ========== えちぜん鉄道 勝山永平寺線（福井-勝山） ==========
  { id: 'hr_fukui_echizen', name: '福井', lat: 36.0623, lng: 136.2234, lines: ['echizen_katsuyama', 'echizen_mikuni'], prefecture: '福井県' },
  { id: 'hr_shin_fukui', name: '新福井', lat: 36.0666, lng: 136.2201, lines: ['echizen_katsuyama', 'echizen_mikuni'], prefecture: '福井県' },
  { id: 'hr_fukuidaigaku_mae', name: '福大前西福井', lat: 36.0700, lng: 136.2106, lines: ['echizen_katsuyama'], prefecture: '福井県' },
  { id: 'hr_eiheijiguchi', name: '永平寺口', lat: 36.1089, lng: 136.2907, lines: ['echizen_katsuyama'], prefecture: '福井県' },
  { id: 'hr_katsuyama', name: '勝山', lat: 36.0638, lng: 136.5014, lines: ['echizen_katsuyama'], prefecture: '福井県' },

  // ========== えちぜん鉄道 三国芦原線（福井-三国港） ==========
  // hr_fukui_echizen, hr_shin_fukui は勝山永平寺線で定義済み
  // hr_tawaramachi は福井鉄道で定義済み
  { id: 'hr_nishi_nagata', name: '西長田', lat: 36.1076, lng: 136.1595, lines: ['echizen_mikuni'], prefecture: '福井県' },
  { id: 'hr_awara_yunomachi', name: 'あわら湯のまち', lat: 36.2123, lng: 136.2067, lines: ['echizen_mikuni'], prefecture: '福井県' },
  { id: 'hr_mikuni', name: '三国', lat: 36.2236, lng: 136.1534, lines: ['echizen_mikuni'], prefecture: '福井県' },
  { id: 'hr_mikuniminato', name: '三国港', lat: 36.2303, lng: 136.1468, lines: ['echizen_mikuni'], prefecture: '福井県' },
];

// ---------------------------------------------------------------------------
// 路線データ
// ---------------------------------------------------------------------------

const lines: LineData[] = [
  // IRいしかわ鉄道
  {
    id: 'ir_ishikawa',
    name: 'IRいしかわ鉄道線',
    company: 'IRいしかわ鉄道',
    color: '#0075C2',
    vehicleType: 'train',
    stationIds: [
      'hr_kanazawa', 'hr_nishi_kanazawa', 'hr_nonoichi', 'hr_mattou',
      'hr_kaga_kasama', 'hr_mikawa', 'hr_komaiko', 'hr_nouchi',
      'hr_komatsu', 'hr_awazu', 'hr_kaga_onsen', 'hr_daishoji',
    ],
    isLoop: false,
  },

  // あいの風とやま鉄道
  {
    id: 'ainokaze',
    name: 'あいの風とやま鉄道線',
    company: 'あいの風とやま鉄道',
    color: '#00A0E9',
    vehicleType: 'train',
    stationIds: [
      'hr_kurikara', 'hr_ishidou', 'hr_fukuoka', 'hr_takaoka',
      'hr_koshino_kata', 'hr_oyabe', 'hr_kosugi', 'hr_toyama',
      'hr_higashi_toyama', 'hr_mizuhashi', 'hr_namerikawa', 'hr_uozu',
      'hr_kurobe', 'hr_nyuuzen', 'hr_tomari', 'hr_ecchuu_miyazaki',
      'hr_ichiburi',
    ],
    isLoop: false,
  },

  // 福井鉄道 福武線
  {
    id: 'fukutetsu_fukubu',
    name: '福井鉄道福武線',
    company: '福井鉄道',
    color: '#E60012',
    vehicleType: 'tram',
    stationIds: [
      'hr_tawaramachi', 'hr_nishi_betsuin', 'hr_fukui_ekimae',
      'hr_fukui_jo_mae', 'hr_shiyakusho_mae', 'hr_asuwa_yama_koen_guchi',
      'hr_akadaimae', 'hr_bell_mae', 'hr_hanikawa', 'hr_asahi_mae',
      'hr_sabae', 'hr_nishi_sabae', 'hr_echizen_takefu',
    ],
    isLoop: false,
  },

  // えちぜん鉄道 勝山永平寺線
  {
    id: 'echizen_katsuyama',
    name: 'えちぜん鉄道勝山永平寺線',
    company: 'えちぜん鉄道',
    color: '#009944',
    vehicleType: 'train',
    stationIds: [
      'hr_fukui_echizen', 'hr_shin_fukui', 'hr_fukuidaigaku_mae',
      'hr_eiheijiguchi', 'hr_katsuyama',
    ],
    isLoop: false,
  },

  // えちぜん鉄道 三国芦原線
  {
    id: 'echizen_mikuni',
    name: 'えちぜん鉄道三国芦原線',
    company: 'えちぜん鉄道',
    color: '#009944',
    vehicleType: 'train',
    stationIds: [
      'hr_fukui_echizen', 'hr_shin_fukui', 'hr_tawaramachi',
      'hr_nishi_nagata', 'hr_awara_yunomachi', 'hr_mikuni', 'hr_mikuniminato',
    ],
    isLoop: false,
  },
];

// ---------------------------------------------------------------------------
// エクスポート
// ---------------------------------------------------------------------------

export const hokurikuData: RegionData = { stations, lines };
