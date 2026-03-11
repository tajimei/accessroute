/**
 * 東北地方 鉄道データ
 *
 * JR在来線（仙石線・仙山線・奥羽本線）および仙台市営地下鉄の駅・路線情報。
 * 駅IDは th_ プレフィクス。
 * 路線IDは jr_（JR在来線）、sendai_（仙台地下鉄）プレフィクス。
 */

import { StationData, LineData, RegionData } from '../types';

// ---------------------------------------------------------------------------
// 駅データ
// ---------------------------------------------------------------------------

const stations: StationData[] = [
  // ========== JR仙石線（あおば通-石巻 主要駅） ==========
  { id: 'th_aoba_dori', name: 'あおば通', lat: 38.2607, lng: 140.8760, lines: ['jr_senseki'], prefecture: '宮城県' },
  { id: 'th_sendai', name: '仙台', lat: 38.2601, lng: 140.8822, lines: ['jr_senseki', 'jr_senzan', 'jr_ou_honsen'], prefecture: '宮城県' },
  { id: 'th_rikuzen_haranomachi', name: '陸前原ノ町', lat: 38.2649, lng: 140.9010, lines: ['jr_senseki'], prefecture: '宮城県' },
  { id: 'th_miyagino_hara', name: '宮城野原', lat: 38.2594, lng: 140.9040, lines: ['jr_senseki'], prefecture: '宮城県' },
  { id: 'th_rikuzen_takasago', name: '陸前高砂', lat: 38.2667, lng: 140.9422, lines: ['jr_senseki'], prefecture: '宮城県' },
  { id: 'th_nakanosakae', name: '中野栄', lat: 38.2700, lng: 140.9611, lines: ['jr_senseki'], prefecture: '宮城県' },
  { id: 'th_tagajo', name: '多賀城', lat: 38.2939, lng: 140.9889, lines: ['jr_senseki'], prefecture: '宮城県' },
  { id: 'th_shiogama', name: '下馬', lat: 38.3100, lng: 141.0025, lines: ['jr_senseki'], prefecture: '宮城県' },
  { id: 'th_hon_shiogama', name: '本塩釜', lat: 38.3167, lng: 141.0197, lines: ['jr_senseki'], prefecture: '宮城県' },
  { id: 'th_higashi_shiogama', name: '東塩釜', lat: 38.3236, lng: 141.0375, lines: ['jr_senseki'], prefecture: '宮城県' },
  { id: 'th_matsushima_kaigan', name: '松島海岸', lat: 38.3711, lng: 141.0622, lines: ['jr_senseki'], prefecture: '宮城県' },
  { id: 'th_nobiru', name: '野蒜', lat: 38.3581, lng: 141.1369, lines: ['jr_senseki'], prefecture: '宮城県' },
  { id: 'th_yamoto', name: '矢本', lat: 38.4189, lng: 141.2094, lines: ['jr_senseki'], prefecture: '宮城県' },
  { id: 'th_ishinomaki', name: '石巻', lat: 38.4347, lng: 141.3067, lines: ['jr_senseki'], prefecture: '宮城県' },

  // ========== JR仙山線（仙台-山形 主要駅） ==========
  // 仙台は共有（上記で定義済み）
  { id: 'th_kita_sendai', name: '北仙台', lat: 38.2806, lng: 140.8719, lines: ['jr_senzan'], prefecture: '宮城県' },
  { id: 'th_kunimigaoka', name: '国見', lat: 38.2869, lng: 140.8489, lines: ['jr_senzan'], prefecture: '宮城県' },
  { id: 'th_rikuzen_ochiai', name: '陸前落合', lat: 38.2911, lng: 140.8044, lines: ['jr_senzan'], prefecture: '宮城県' },
  { id: 'th_ayashi', name: '愛子', lat: 38.2892, lng: 140.7703, lines: ['jr_senzan'], prefecture: '宮城県' },
  { id: 'th_sakunami', name: '作並', lat: 38.3072, lng: 140.6464, lines: ['jr_senzan'], prefecture: '宮城県' },
  { id: 'th_yamadera', name: '山寺', lat: 38.3125, lng: 140.4369, lines: ['jr_senzan'], prefecture: '山形県' },
  { id: 'th_takase', name: '高瀬', lat: 38.2828, lng: 140.3936, lines: ['jr_senzan'], prefecture: '山形県' },
  { id: 'th_yamagata', name: '山形', lat: 38.2486, lng: 140.3282, lines: ['jr_senzan', 'jr_ou_honsen'], prefecture: '山形県' },

  // ========== JR奥羽本線（福島-秋田 主要駅） ==========
  { id: 'th_fukushima', name: '福島', lat: 37.7542, lng: 140.4599, lines: ['jr_ou_honsen'], prefecture: '福島県' },
  { id: 'th_yonezawa', name: '米沢', lat: 37.9121, lng: 140.1151, lines: ['jr_ou_honsen'], prefecture: '山形県' },
  { id: 'th_akayu', name: '赤湯', lat: 38.0547, lng: 140.1475, lines: ['jr_ou_honsen'], prefecture: '山形県' },
  { id: 'th_kaminoyama_onsen', name: 'かみのやま温泉', lat: 38.1527, lng: 140.2742, lines: ['jr_ou_honsen'], prefecture: '山形県' },
  // 山形は共有（上記で定義済み）
  { id: 'th_tendo', name: '天童', lat: 38.3583, lng: 140.3794, lines: ['jr_ou_honsen'], prefecture: '山形県' },
  { id: 'th_higashine', name: '東根', lat: 38.4264, lng: 140.3892, lines: ['jr_ou_honsen'], prefecture: '山形県' },
  { id: 'th_murayama', name: '村山', lat: 38.4824, lng: 140.3828, lines: ['jr_ou_honsen'], prefecture: '山形県' },
  { id: 'th_oishida', name: '大石田', lat: 38.5922, lng: 140.3755, lines: ['jr_ou_honsen'], prefecture: '山形県' },
  { id: 'th_shinjo', name: '新庄', lat: 38.7640, lng: 140.3155, lines: ['jr_ou_honsen'], prefecture: '山形県' },
  { id: 'th_mamurogawa', name: '真室川', lat: 38.8561, lng: 140.2548, lines: ['jr_ou_honsen'], prefecture: '山形県' },
  { id: 'th_innai', name: '院内', lat: 38.9814, lng: 140.3366, lines: ['jr_ou_honsen'], prefecture: '秋田県' },
  { id: 'th_yuzawa', name: '湯沢', lat: 39.1635, lng: 140.4943, lines: ['jr_ou_honsen'], prefecture: '秋田県' },
  { id: 'th_yokote', name: '横手', lat: 39.3133, lng: 140.5536, lines: ['jr_ou_honsen'], prefecture: '秋田県' },
  { id: 'th_omagari', name: '大曲', lat: 39.4467, lng: 140.4767, lines: ['jr_ou_honsen'], prefecture: '秋田県' },
  { id: 'th_akita', name: '秋田', lat: 39.7177, lng: 140.1034, lines: ['jr_ou_honsen'], prefecture: '秋田県' },

  // ========== 仙台市営地下鉄 南北線（泉中央-富沢） ==========
  { id: 'th_izumi_chuo', name: '泉中央', lat: 38.3200, lng: 140.8817, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_yaotome', name: '八乙女', lat: 38.3100, lng: 140.8817, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_kurosaki', name: '黒松', lat: 38.2994, lng: 140.8811, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_asahigaoka', name: '旭ヶ丘', lat: 38.2917, lng: 140.8764, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_dainohara', name: '台原', lat: 38.2856, lng: 140.8753, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_kita_yobancho', name: '北四番丁', lat: 38.2728, lng: 140.8708, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_kita_sendai_subway', name: '北仙台', lat: 38.2792, lng: 140.8714, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_kotodai_koen', name: '勾当台公園', lat: 38.2672, lng: 140.8703, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_hirose_dori', name: '広瀬通', lat: 38.2617, lng: 140.8733, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_sendai_subway', name: '仙台', lat: 38.2601, lng: 140.8822, lines: ['sendai_namboku', 'sendai_tozai'], prefecture: '宮城県' },
  { id: 'th_itsutsubashi', name: '五橋', lat: 38.2536, lng: 140.8828, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_atagobashi', name: '愛宕橋', lat: 38.2461, lng: 140.8772, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_kawara_machi', name: '河原町', lat: 38.2378, lng: 140.8731, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_nagamachi_icchome', name: '長町一丁目', lat: 38.2306, lng: 140.8756, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_nagamachi', name: '長町', lat: 38.2228, lng: 140.8783, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_nagamachi_minami', name: '長町南', lat: 38.2147, lng: 140.8794, lines: ['sendai_namboku'], prefecture: '宮城県' },
  { id: 'th_tomizawa', name: '富沢', lat: 38.2047, lng: 140.8756, lines: ['sendai_namboku'], prefecture: '宮城県' },

  // ========== 仙台市営地下鉄 東西線（八木山動物公園-荒井） ==========
  { id: 'th_yagiyama_zoo', name: '八木山動物公園', lat: 38.2425, lng: 140.8356, lines: ['sendai_tozai'], prefecture: '宮城県' },
  { id: 'th_aobayama', name: '青葉山', lat: 38.2536, lng: 140.8406, lines: ['sendai_tozai'], prefecture: '宮城県' },
  { id: 'th_kawauchi', name: '川内', lat: 38.2586, lng: 140.8497, lines: ['sendai_tozai'], prefecture: '宮城県' },
  { id: 'th_kokusai_center', name: '国際センター', lat: 38.2608, lng: 140.8564, lines: ['sendai_tozai'], prefecture: '宮城県' },
  { id: 'th_omachi_nishikoen', name: '大町西公園', lat: 38.2611, lng: 140.8619, lines: ['sendai_tozai'], prefecture: '宮城県' },
  { id: 'th_aobadori', name: '青葉通一番町', lat: 38.2608, lng: 140.8683, lines: ['sendai_tozai'], prefecture: '宮城県' },
  // 仙台は共有（上記で定義済み）
  { id: 'th_miyaginohara', name: '宮城野通', lat: 38.2589, lng: 140.8922, lines: ['sendai_tozai'], prefecture: '宮城県' },
  { id: 'th_renbo', name: '連坊', lat: 38.2539, lng: 140.8969, lines: ['sendai_tozai'], prefecture: '宮城県' },
  { id: 'th_yakushido', name: '薬師堂', lat: 38.2483, lng: 140.9083, lines: ['sendai_tozai'], prefecture: '宮城県' },
  { id: 'th_oroshimachi', name: '卸町', lat: 38.2503, lng: 140.9258, lines: ['sendai_tozai'], prefecture: '宮城県' },
  { id: 'th_rikuzen_takasago_subway', name: '六丁の目', lat: 38.2536, lng: 140.9417, lines: ['sendai_tozai'], prefecture: '宮城県' },
  { id: 'th_arai', name: '荒井', lat: 38.2531, lng: 140.9594, lines: ['sendai_tozai'], prefecture: '宮城県' },
];

// ---------------------------------------------------------------------------
// 路線データ
// ---------------------------------------------------------------------------

const lines: LineData[] = [
  // JR仙石線
  {
    id: 'jr_senseki',
    name: 'JR仙石線',
    company: 'JR東日本',
    color: '#00A1E9',
    vehicleType: 'train',
    stationIds: [
      'th_aoba_dori', 'th_sendai', 'th_rikuzen_haranomachi', 'th_miyagino_hara',
      'th_rikuzen_takasago', 'th_nakanosakae', 'th_tagajo', 'th_shiogama',
      'th_hon_shiogama', 'th_higashi_shiogama', 'th_matsushima_kaigan',
      'th_nobiru', 'th_yamoto', 'th_ishinomaki',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },

  // JR仙山線
  {
    id: 'jr_senzan',
    name: 'JR仙山線',
    company: 'JR東日本',
    color: '#008000',
    vehicleType: 'train',
    stationIds: [
      'th_sendai', 'th_kita_sendai', 'th_kunimigaoka', 'th_rikuzen_ochiai',
      'th_ayashi', 'th_sakunami', 'th_yamadera', 'th_takase', 'th_yamagata',
    ],
    isLoop: false,
    avgIntervalMinutes: 8,
  },

  // JR奥羽本線（福島-秋田）
  {
    id: 'jr_ou_honsen',
    name: 'JR奥羽本線',
    company: 'JR東日本',
    color: '#E45E00',
    vehicleType: 'train',
    stationIds: [
      'th_fukushima', 'th_yonezawa', 'th_akayu', 'th_kaminoyama_onsen',
      'th_yamagata', 'th_tendo', 'th_higashine', 'th_murayama', 'th_oishida',
      'th_shinjo', 'th_mamurogawa', 'th_innai', 'th_yuzawa', 'th_yokote', 'th_omagari', 'th_akita',
    ],
    isLoop: false,
    avgIntervalMinutes: 10,
  },

  // 仙台市営地下鉄 南北線
  {
    id: 'sendai_namboku',
    name: '仙台市営地下鉄南北線',
    company: '仙台市交通局',
    color: '#009944',
    vehicleType: 'subway',
    stationIds: [
      'th_izumi_chuo', 'th_yaotome', 'th_kurosaki', 'th_asahigaoka',
      'th_dainohara', 'th_kita_sendai_subway', 'th_kita_yobancho',
      'th_kotodai_koen', 'th_hirose_dori', 'th_sendai_subway',
      'th_itsutsubashi', 'th_atagobashi', 'th_kawara_machi',
      'th_nagamachi_icchome', 'th_nagamachi', 'th_nagamachi_minami',
      'th_tomizawa',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },

  // 仙台市営地下鉄 東西線
  {
    id: 'sendai_tozai',
    name: '仙台市営地下鉄東西線',
    company: '仙台市交通局',
    color: '#0072BC',
    vehicleType: 'subway',
    stationIds: [
      'th_yagiyama_zoo', 'th_aobayama', 'th_kawauchi', 'th_kokusai_center',
      'th_omachi_nishikoen', 'th_aobadori', 'th_sendai_subway',
      'th_miyaginohara', 'th_renbo', 'th_yakushido', 'th_oroshimachi',
      'th_rikuzen_takasago_subway', 'th_arai',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },
];

// ---------------------------------------------------------------------------
// エクスポート
// ---------------------------------------------------------------------------

export const tohokuData: RegionData = { stations, lines };
