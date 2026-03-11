/**
 * 四国地方 鉄道データ
 *
 * JR予讃線・土讃線・高徳線、伊予鉄道、ことでん（高松琴平電鉄）の
 * 駅・路線情報。駅IDは si_ プレフィクス。
 */

import { StationData, LineData, RegionData } from '../types';

// ---------------------------------------------------------------------------
// 駅データ
// ---------------------------------------------------------------------------

const stations: StationData[] = [
  // ========== JR予讃線（高松-松山 主要駅） ==========
  { id: 'si_takamatsu', name: '高松', lat: 34.3503, lng: 134.0466, lines: ['jr_yosan', 'jr_kotoku'], prefecture: '香川県' },
  { id: 'si_sakaide', name: '坂出', lat: 34.3164, lng: 133.8551, lines: ['jr_yosan', 'jr_dosan'], prefecture: '香川県' },
  { id: 'si_utazu', name: '宇多津', lat: 34.3110, lng: 133.8266, lines: ['jr_yosan', 'jr_dosan'], prefecture: '香川県' },
  { id: 'si_marugame', name: '丸亀', lat: 34.2905, lng: 133.7980, lines: ['jr_yosan'], prefecture: '香川県' },
  { id: 'si_tadotsu', name: '多度津', lat: 34.2749, lng: 133.7518, lines: ['jr_yosan', 'jr_dosan'], prefecture: '香川県' },
  { id: 'si_kannonji', name: '観音寺', lat: 34.0680, lng: 133.6596, lines: ['jr_yosan'], prefecture: '香川県' },
  { id: 'si_kawanoe', name: '川之江', lat: 33.9824, lng: 133.5584, lines: ['jr_yosan'], prefecture: '愛媛県' },
  { id: 'si_iyomishima', name: '伊予三島', lat: 33.9759, lng: 133.5320, lines: ['jr_yosan'], prefecture: '愛媛県' },
  { id: 'si_niihama', name: '新居浜', lat: 33.9540, lng: 133.2827, lines: ['jr_yosan'], prefecture: '愛媛県' },
  { id: 'si_iyosaijo', name: '伊予西条', lat: 33.9198, lng: 133.1825, lines: ['jr_yosan'], prefecture: '愛媛県' },
  { id: 'si_iyokomatsu', name: '伊予小松', lat: 33.8945, lng: 133.1041, lines: ['jr_yosan'], prefecture: '愛媛県' },
  { id: 'si_imabari', name: '今治', lat: 34.0630, lng: 132.9978, lines: ['jr_yosan'], prefecture: '愛媛県' },
  { id: 'si_iyohojo', name: '伊予北条', lat: 33.9513, lng: 132.7685, lines: ['jr_yosan'], prefecture: '愛媛県' },
  { id: 'si_matsuyama', name: '松山', lat: 33.8389, lng: 132.7655, lines: ['jr_yosan'], prefecture: '愛媛県' },

  // ========== JR土讃線（多度津-高知 主要駅） ==========
  // si_tadotsu は予讃線で定義済み
  { id: 'si_kotohira', name: '琴平', lat: 34.1905, lng: 133.8212, lines: ['jr_dosan'], prefecture: '香川県' },
  { id: 'si_awa_ikeda', name: '阿波池田', lat: 34.0320, lng: 133.8059, lines: ['jr_dosan'], prefecture: '徳島県' },
  { id: 'si_oboke', name: '大歩危', lat: 33.9426, lng: 133.8213, lines: ['jr_dosan'], prefecture: '徳島県' },
  { id: 'si_tosa_yamada', name: '土佐山田', lat: 33.6119, lng: 133.6886, lines: ['jr_dosan'], prefecture: '高知県' },
  { id: 'si_gomen', name: '後免', lat: 33.5669, lng: 133.6388, lines: ['jr_dosan'], prefecture: '高知県' },
  { id: 'si_kochi', name: '高知', lat: 33.5672, lng: 133.5437, lines: ['jr_dosan'], prefecture: '高知県' },

  // ========== JR高徳線（高松-徳島 主要駅） ==========
  // si_takamatsu は予讃線で定義済み
  { id: 'si_yashima', name: '屋島', lat: 34.3542, lng: 134.0920, lines: ['jr_kotoku'], prefecture: '香川県' },
  { id: 'si_shidoguchi', name: '志度口', lat: 34.3268, lng: 134.1787, lines: ['jr_kotoku'], prefecture: '香川県' },
  { id: 'si_shido', name: '志度', lat: 34.3241, lng: 134.1814, lines: ['jr_kotoku'], prefecture: '香川県' },
  { id: 'si_sanuki_tsuda', name: 'さぬき津田', lat: 34.2960, lng: 134.2704, lines: ['jr_kotoku'], prefecture: '香川県' },
  { id: 'si_nagao', name: '長尾', lat: 34.2662, lng: 134.1648, lines: ['jr_kotoku'], prefecture: '香川県' },
  { id: 'si_hiketa', name: '引田', lat: 34.2235, lng: 134.3842, lines: ['jr_kotoku'], prefecture: '香川県' },
  { id: 'si_ban_sanagochi', name: '板野', lat: 34.1522, lng: 134.4692, lines: ['jr_kotoku'], prefecture: '徳島県' },
  { id: 'si_itano', name: '板東', lat: 34.1613, lng: 134.4832, lines: ['jr_kotoku'], prefecture: '徳島県' },
  { id: 'si_yoshinari', name: '吉成', lat: 34.0925, lng: 134.5315, lines: ['jr_kotoku'], prefecture: '徳島県' },
  { id: 'si_sakamoto', name: '佐古', lat: 34.0750, lng: 134.5386, lines: ['jr_kotoku'], prefecture: '徳島県' },
  { id: 'si_tokushima', name: '徳島', lat: 34.0743, lng: 134.5515, lines: ['jr_kotoku'], prefecture: '徳島県' },

  // ========== 伊予鉄道（松山市内） ==========
  { id: 'si_iyotetsu_matsuyama_shi', name: '松山市', lat: 33.8372, lng: 132.7597, lines: ['iyotetsu_takahama', 'iyotetsu_yokogawara', 'iyotetsu_gunchu'], prefecture: '愛媛県' },
  { id: 'si_otemachi', name: '大手町', lat: 33.8430, lng: 132.7614, lines: ['iyotetsu_takahama'], prefecture: '愛媛県' },
  { id: 'si_iyotetsu_matsuyama', name: 'JR松山駅前', lat: 33.8389, lng: 132.7548, lines: ['iyotetsu_takahama'], prefecture: '愛媛県' },
  { id: 'si_mitsumachi', name: '三津浜', lat: 33.8494, lng: 132.7226, lines: ['iyotetsu_takahama'], prefecture: '愛媛県' },
  { id: 'si_takahama', name: '高浜', lat: 33.8662, lng: 132.7024, lines: ['iyotetsu_takahama'], prefecture: '愛媛県' },
  { id: 'si_ishite_gawa_koen', name: '石手川公園', lat: 33.8380, lng: 132.7757, lines: ['iyotetsu_yokogawara'], prefecture: '愛媛県' },
  { id: 'si_idaimae', name: 'いよ立花', lat: 33.8395, lng: 132.7892, lines: ['iyotetsu_yokogawara'], prefecture: '愛媛県' },
  { id: 'si_yokogawara', name: '横河原', lat: 33.8068, lng: 132.8893, lines: ['iyotetsu_yokogawara'], prefecture: '愛媛県' },
  { id: 'si_mitsukoshi_mae', name: '松山市駅前', lat: 33.8365, lng: 132.7595, lines: ['iyotetsu_gunchu'], prefecture: '愛媛県' },
  { id: 'si_minami_machi', name: '南町', lat: 33.8340, lng: 132.7620, lines: ['iyotetsu_gunchu'], prefecture: '愛媛県' },
  { id: 'si_dogo_onsen', name: '道後温泉', lat: 33.8520, lng: 132.7888, lines: ['iyotetsu_gunchu'], prefecture: '愛媛県' },
  { id: 'si_okaido', name: '大街道', lat: 33.8432, lng: 132.7721, lines: ['iyotetsu_gunchu'], prefecture: '愛媛県' },
  { id: 'si_matsuyama_shieki_mae', name: '松山市駅', lat: 33.8365, lng: 132.7595, lines: ['iyotetsu_gunchu'], prefecture: '愛媛県' },

  // ========== ことでん（高松琴平電鉄） ==========
  // 琴平線
  { id: 'si_kawaramachi', name: '瓦町', lat: 34.3416, lng: 134.0519, lines: ['kotoden_kotohira', 'kotoden_nagao', 'kotoden_shido'], prefecture: '香川県' },
  { id: 'si_katahara_machi', name: '片原町', lat: 34.3460, lng: 134.0486, lines: ['kotoden_kotohira'], prefecture: '香川県' },
  { id: 'si_kotoden_takamatsu_chikko', name: '高松築港', lat: 34.3506, lng: 134.0471, lines: ['kotoden_kotohira'], prefecture: '香川県' },
  { id: 'si_ritsurin_koen', name: '栗林公園', lat: 34.3310, lng: 134.0476, lines: ['kotoden_kotohira'], prefecture: '香川県' },
  { id: 'si_busshozan', name: '仏生山', lat: 34.2980, lng: 134.0319, lines: ['kotoden_kotohira'], prefecture: '香川県' },
  { id: 'si_ichinogu', name: '一宮', lat: 34.2786, lng: 134.0148, lines: ['kotoden_kotohira'], prefecture: '香川県' },
  { id: 'si_enoguchi', name: '円座', lat: 34.2612, lng: 133.9918, lines: ['kotoden_kotohira'], prefecture: '香川県' },
  { id: 'si_okuda', name: '岡田', lat: 34.2408, lng: 133.9533, lines: ['kotoden_kotohira'], prefecture: '香川県' },
  { id: 'si_kotoden_kotohira', name: '琴電琴平', lat: 34.1917, lng: 133.8180, lines: ['kotoden_kotohira'], prefecture: '香川県' },
  // 長尾線
  { id: 'si_hana_zono', name: '花園', lat: 34.3382, lng: 134.0582, lines: ['kotoden_nagao'], prefecture: '香川県' },
  { id: 'si_hayashimichi', name: '林道', lat: 34.3347, lng: 134.0653, lines: ['kotoden_nagao'], prefecture: '香川県' },
  { id: 'si_takinomiya', name: '滝宮', lat: 34.2630, lng: 134.0550, lines: ['kotoden_nagao'], prefecture: '香川県' },
  { id: 'si_kotoden_nagao', name: '長尾', lat: 34.2607, lng: 134.1644, lines: ['kotoden_nagao'], prefecture: '香川県' },
  // 志度線
  { id: 'si_imashio', name: '今橋', lat: 34.3430, lng: 134.0555, lines: ['kotoden_shido'], prefecture: '香川県' },
  { id: 'si_kotoden_yashima', name: '琴電屋島', lat: 34.3542, lng: 134.1000, lines: ['kotoden_shido'], prefecture: '香川県' },
  { id: 'si_hagio', name: '八栗', lat: 34.3452, lng: 134.1240, lines: ['kotoden_shido'], prefecture: '香川県' },
  { id: 'si_kotoden_shido', name: '琴電志度', lat: 34.3240, lng: 134.1790, lines: ['kotoden_shido'], prefecture: '香川県' },
];

// ---------------------------------------------------------------------------
// 路線データ
// ---------------------------------------------------------------------------

const lines: LineData[] = [
  // JR予讃線
  {
    id: 'jr_yosan',
    name: 'JR予讃線',
    company: 'JR四国',
    color: '#0072BC',
    vehicleType: 'train',
    stationIds: [
      'si_takamatsu', 'si_sakaide', 'si_utazu', 'si_marugame', 'si_tadotsu',
      'si_kannonji', 'si_kawanoe', 'si_iyomishima', 'si_niihama', 'si_iyosaijo',
      'si_iyokomatsu', 'si_imabari', 'si_iyohojo', 'si_matsuyama',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },

  // JR土讃線
  {
    id: 'jr_dosan',
    name: 'JR土讃線',
    company: 'JR四国',
    color: '#00A650',
    vehicleType: 'train',
    stationIds: [
      'si_utazu', 'si_sakaide', 'si_tadotsu', 'si_kotohira', 'si_awa_ikeda',
      'si_oboke', 'si_tosa_yamada', 'si_gomen', 'si_kochi',
    ],
    isLoop: false,
    avgIntervalMinutes: 6,
  },

  // JR高徳線
  {
    id: 'jr_kotoku',
    name: 'JR高徳線',
    company: 'JR四国',
    color: '#F39800',
    vehicleType: 'train',
    stationIds: [
      'si_takamatsu', 'si_yashima', 'si_shidoguchi', 'si_shido',
      'si_sanuki_tsuda', 'si_nagao', 'si_hiketa', 'si_ban_sanagochi',
      'si_itano', 'si_yoshinari', 'si_sakamoto', 'si_tokushima',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },

  // 伊予鉄道 高浜線
  {
    id: 'iyotetsu_takahama',
    name: '伊予鉄道高浜線',
    company: '伊予鉄道',
    color: '#FF6600',
    vehicleType: 'train',
    stationIds: [
      'si_takahama', 'si_mitsumachi', 'si_iyotetsu_matsuyama',
      'si_otemachi', 'si_iyotetsu_matsuyama_shi',
    ],
    isLoop: false,
  },

  // 伊予鉄道 横河原線
  {
    id: 'iyotetsu_yokogawara',
    name: '伊予鉄道横河原線',
    company: '伊予鉄道',
    color: '#FF6600',
    vehicleType: 'train',
    stationIds: [
      'si_iyotetsu_matsuyama_shi', 'si_ishite_gawa_koen',
      'si_idaimae', 'si_yokogawara',
    ],
    isLoop: false,
  },

  // 伊予鉄道 市内電車（郡中線区間含む簡易表現）
  {
    id: 'iyotetsu_gunchu',
    name: '伊予鉄道市内電車',
    company: '伊予鉄道',
    color: '#FF6600',
    vehicleType: 'tram',
    stationIds: [
      'si_matsuyama_shieki_mae', 'si_minami_machi', 'si_okaido',
      'si_dogo_onsen',
    ],
    isLoop: false,
  },

  // ことでん 琴平線
  {
    id: 'kotoden_kotohira',
    name: 'ことでん琴平線',
    company: '高松琴平電気鉄道',
    color: '#FFD700',
    vehicleType: 'train',
    stationIds: [
      'si_kotoden_takamatsu_chikko', 'si_katahara_machi', 'si_kawaramachi',
      'si_ritsurin_koen', 'si_busshozan', 'si_ichinogu', 'si_enoguchi',
      'si_okuda', 'si_kotoden_kotohira',
    ],
    isLoop: false,
  },

  // ことでん 長尾線
  {
    id: 'kotoden_nagao',
    name: 'ことでん長尾線',
    company: '高松琴平電気鉄道',
    color: '#00A650',
    vehicleType: 'train',
    stationIds: [
      'si_kawaramachi', 'si_hana_zono', 'si_hayashimichi',
      'si_takinomiya', 'si_kotoden_nagao',
    ],
    isLoop: false,
  },

  // ことでん 志度線
  {
    id: 'kotoden_shido',
    name: 'ことでん志度線',
    company: '高松琴平電気鉄道',
    color: '#E4002B',
    vehicleType: 'train',
    stationIds: [
      'si_kawaramachi', 'si_imashio', 'si_kotoden_yashima',
      'si_hagio', 'si_kotoden_shido',
    ],
    isLoop: false,
  },
];

// ---------------------------------------------------------------------------
// エクスポート
// ---------------------------------------------------------------------------

export const shikokuData: RegionData = { stations, lines };
