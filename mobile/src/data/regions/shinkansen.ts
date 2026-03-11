/**
 * 新幹線 全路線・全駅データ
 *
 * 日本全国の新幹線路線（フル規格 + ミニ新幹線）の駅・路線情報。
 * 駅IDは shk_ プレフィクス、路線IDは shinkansen_ プレフィクス。
 */

import { StationData, LineData, RegionData } from '../types';

// ---------------------------------------------------------------------------
// 駅データ
// ---------------------------------------------------------------------------

const stations: StationData[] = [
  // ========== 東海道新幹線 ==========
  { id: 'shk_tokyo', name: '東京', lat: 35.6812, lng: 139.7671, lines: ['shinkansen_tokaido', 'shinkansen_tohoku'], prefecture: '東京都' },
  { id: 'shk_shinagawa', name: '品川', lat: 35.6284, lng: 139.7387, lines: ['shinkansen_tokaido'], prefecture: '東京都' },
  { id: 'shk_shin_yokohama', name: '新横浜', lat: 35.5064, lng: 139.6176, lines: ['shinkansen_tokaido'], prefecture: '神奈川県' },
  { id: 'shk_odawara', name: '小田原', lat: 35.2564, lng: 139.1550, lines: ['shinkansen_tokaido'], prefecture: '神奈川県' },
  { id: 'shk_atami', name: '熱海', lat: 35.1040, lng: 139.0776, lines: ['shinkansen_tokaido'], prefecture: '静岡県' },
  { id: 'shk_mishima', name: '三島', lat: 35.1268, lng: 138.9109, lines: ['shinkansen_tokaido'], prefecture: '静岡県' },
  { id: 'shk_shin_fuji', name: '新富士', lat: 35.1414, lng: 138.6656, lines: ['shinkansen_tokaido'], prefecture: '静岡県' },
  { id: 'shk_shizuoka', name: '静岡', lat: 34.9716, lng: 138.3890, lines: ['shinkansen_tokaido'], prefecture: '静岡県' },
  { id: 'shk_kakegawa', name: '掛川', lat: 34.7687, lng: 138.0149, lines: ['shinkansen_tokaido'], prefecture: '静岡県' },
  { id: 'shk_hamamatsu', name: '浜松', lat: 34.7038, lng: 137.7350, lines: ['shinkansen_tokaido'], prefecture: '静岡県' },
  { id: 'shk_toyohashi', name: '豊橋', lat: 34.7631, lng: 137.3823, lines: ['shinkansen_tokaido'], prefecture: '愛知県' },
  { id: 'shk_mikawa_anjo', name: '三河安城', lat: 34.9572, lng: 137.0569, lines: ['shinkansen_tokaido'], prefecture: '愛知県' },
  { id: 'shk_nagoya', name: '名古屋', lat: 35.1709, lng: 136.8815, lines: ['shinkansen_tokaido'], prefecture: '愛知県' },
  { id: 'shk_gifu_hashima', name: '岐阜羽島', lat: 35.3155, lng: 136.6856, lines: ['shinkansen_tokaido'], prefecture: '岐阜県' },
  { id: 'shk_maibara', name: '米原', lat: 35.3148, lng: 136.2903, lines: ['shinkansen_tokaido'], prefecture: '滋賀県' },
  { id: 'shk_kyoto', name: '京都', lat: 34.9858, lng: 135.7588, lines: ['shinkansen_tokaido'], prefecture: '京都府' },
  { id: 'shk_shin_osaka', name: '新大阪', lat: 34.7334, lng: 135.5001, lines: ['shinkansen_tokaido', 'shinkansen_sanyo'], prefecture: '大阪府' },

  // ========== 山陽新幹線 ==========
  { id: 'shk_shin_kobe', name: '新神戸', lat: 34.6886, lng: 135.1975, lines: ['shinkansen_sanyo'], prefecture: '兵庫県' },
  { id: 'shk_nishi_akashi', name: '西明石', lat: 34.6490, lng: 134.9625, lines: ['shinkansen_sanyo'], prefecture: '兵庫県' },
  { id: 'shk_himeji', name: '姫路', lat: 34.8267, lng: 134.6914, lines: ['shinkansen_sanyo'], prefecture: '兵庫県' },
  { id: 'shk_aioi', name: '相生', lat: 34.8080, lng: 134.4677, lines: ['shinkansen_sanyo'], prefecture: '兵庫県' },
  { id: 'shk_okayama', name: '岡山', lat: 34.6655, lng: 133.9184, lines: ['shinkansen_sanyo'], prefecture: '岡山県' },
  { id: 'shk_shin_kurashiki', name: '新倉敷', lat: 34.5951, lng: 133.7193, lines: ['shinkansen_sanyo'], prefecture: '岡山県' },
  { id: 'shk_fukuyama', name: '福山', lat: 34.4927, lng: 133.3625, lines: ['shinkansen_sanyo'], prefecture: '広島県' },
  { id: 'shk_mihara', name: '三原', lat: 34.3997, lng: 133.0822, lines: ['shinkansen_sanyo'], prefecture: '広島県' },
  { id: 'shk_higashi_hiroshima', name: '東広島', lat: 34.4277, lng: 132.7433, lines: ['shinkansen_sanyo'], prefecture: '広島県' },
  { id: 'shk_hiroshima', name: '広島', lat: 34.3963, lng: 132.4752, lines: ['shinkansen_sanyo'], prefecture: '広島県' },
  { id: 'shk_shin_iwakuni', name: '新岩国', lat: 34.1731, lng: 132.1395, lines: ['shinkansen_sanyo'], prefecture: '山口県' },
  { id: 'shk_tokuyama', name: '徳山', lat: 34.0508, lng: 131.8064, lines: ['shinkansen_sanyo'], prefecture: '山口県' },
  { id: 'shk_shin_yamaguchi', name: '新山口', lat: 34.0962, lng: 131.4746, lines: ['shinkansen_sanyo'], prefecture: '山口県' },
  { id: 'shk_asa', name: '厚狭', lat: 34.0640, lng: 131.2466, lines: ['shinkansen_sanyo'], prefecture: '山口県' },
  { id: 'shk_shin_shimonoseki', name: '新下関', lat: 33.9979, lng: 130.9749, lines: ['shinkansen_sanyo'], prefecture: '山口県' },
  { id: 'shk_kokura', name: '小倉', lat: 33.8862, lng: 130.8828, lines: ['shinkansen_sanyo'], prefecture: '福岡県' },
  { id: 'shk_hakata', name: '博多', lat: 33.5897, lng: 130.4207, lines: ['shinkansen_sanyo', 'shinkansen_kyushu'], prefecture: '福岡県' },

  // ========== 東北新幹線 ==========
  { id: 'shk_ueno', name: '上野', lat: 35.7141, lng: 139.7774, lines: ['shinkansen_tohoku'], prefecture: '東京都' },
  { id: 'shk_omiya', name: '大宮', lat: 35.9060, lng: 139.6233, lines: ['shinkansen_tohoku', 'shinkansen_joetsu', 'shinkansen_hokuriku'], prefecture: '埼玉県' },
  { id: 'shk_oyama', name: '小山', lat: 36.3147, lng: 139.8003, lines: ['shinkansen_tohoku'], prefecture: '栃木県' },
  { id: 'shk_utsunomiya', name: '宇都宮', lat: 36.5593, lng: 139.8980, lines: ['shinkansen_tohoku'], prefecture: '栃木県' },
  { id: 'shk_nasushiobara', name: '那須塩原', lat: 36.9600, lng: 139.9312, lines: ['shinkansen_tohoku'], prefecture: '栃木県' },
  { id: 'shk_shin_shirakawa', name: '新白河', lat: 37.1243, lng: 140.1859, lines: ['shinkansen_tohoku'], prefecture: '福島県' },
  { id: 'shk_koriyama', name: '郡山', lat: 37.3980, lng: 140.3888, lines: ['shinkansen_tohoku'], prefecture: '福島県' },
  { id: 'shk_fukushima', name: '福島', lat: 37.7542, lng: 140.4599, lines: ['shinkansen_tohoku', 'shinkansen_yamagata'], prefecture: '福島県' },
  { id: 'shk_shiroishi_zao', name: '白石蔵王', lat: 38.0031, lng: 140.6186, lines: ['shinkansen_tohoku'], prefecture: '宮城県' },
  { id: 'shk_sendai', name: '仙台', lat: 38.2601, lng: 140.8822, lines: ['shinkansen_tohoku'], prefecture: '宮城県' },
  { id: 'shk_furukawa', name: '古川', lat: 38.5724, lng: 140.9578, lines: ['shinkansen_tohoku'], prefecture: '宮城県' },
  { id: 'shk_kurikoma_kogen', name: 'くりこま高原', lat: 38.7321, lng: 141.0776, lines: ['shinkansen_tohoku'], prefecture: '宮城県' },
  { id: 'shk_ichinoseki', name: '一ノ関', lat: 38.9264, lng: 141.1268, lines: ['shinkansen_tohoku'], prefecture: '岩手県' },
  { id: 'shk_mizusawa_esashi', name: '水沢江刺', lat: 39.0783, lng: 141.1222, lines: ['shinkansen_tohoku'], prefecture: '岩手県' },
  { id: 'shk_kitakami', name: '北上', lat: 39.2864, lng: 141.1129, lines: ['shinkansen_tohoku'], prefecture: '岩手県' },
  { id: 'shk_shin_hanamaki', name: '新花巻', lat: 39.3815, lng: 141.1062, lines: ['shinkansen_tohoku'], prefecture: '岩手県' },
  { id: 'shk_morioka', name: '盛岡', lat: 39.7013, lng: 141.1366, lines: ['shinkansen_tohoku', 'shinkansen_akita'], prefecture: '岩手県' },
  { id: 'shk_iwate_numakunai', name: 'いわて沼宮内', lat: 39.9415, lng: 141.2182, lines: ['shinkansen_tohoku'], prefecture: '岩手県' },
  { id: 'shk_ninohe', name: '二戸', lat: 40.2219, lng: 141.3150, lines: ['shinkansen_tohoku'], prefecture: '岩手県' },
  { id: 'shk_hachinohe', name: '八戸', lat: 40.5127, lng: 141.4886, lines: ['shinkansen_tohoku'], prefecture: '青森県' },
  { id: 'shk_shichinohe_towada', name: '七戸十和田', lat: 40.7185, lng: 141.3261, lines: ['shinkansen_tohoku'], prefecture: '青森県' },
  { id: 'shk_shin_aomori', name: '新青森', lat: 40.8249, lng: 140.7260, lines: ['shinkansen_tohoku', 'shinkansen_hokkaido'], prefecture: '青森県' },

  // ========== 北海道新幹線 ==========
  { id: 'shk_okutsugaru_imabetsu', name: '奥津軽いまべつ', lat: 41.0696, lng: 140.5371, lines: ['shinkansen_hokkaido'], prefecture: '青森県' },
  { id: 'shk_kikonai', name: '木古内', lat: 41.6816, lng: 140.4339, lines: ['shinkansen_hokkaido'], prefecture: '北海道' },
  { id: 'shk_shin_hakodate_hokuto', name: '新函館北斗', lat: 41.9046, lng: 140.6491, lines: ['shinkansen_hokkaido'], prefecture: '北海道' },

  // ========== 上越新幹線 ==========
  { id: 'shk_kumagaya', name: '熊谷', lat: 36.1472, lng: 139.3888, lines: ['shinkansen_joetsu'], prefecture: '埼玉県' },
  { id: 'shk_honjo_waseda', name: '本庄早稲田', lat: 36.2215, lng: 139.1757, lines: ['shinkansen_joetsu'], prefecture: '埼玉県' },
  { id: 'shk_takasaki', name: '高崎', lat: 36.3222, lng: 139.0120, lines: ['shinkansen_joetsu', 'shinkansen_hokuriku'], prefecture: '群馬県' },
  { id: 'shk_jomo_kogen', name: '上毛高原', lat: 36.7150, lng: 139.0517, lines: ['shinkansen_joetsu'], prefecture: '群馬県' },
  { id: 'shk_echigo_yuzawa', name: '越後湯沢', lat: 36.9338, lng: 138.8148, lines: ['shinkansen_joetsu'], prefecture: '新潟県' },
  { id: 'shk_urasa', name: '浦佐', lat: 37.0651, lng: 138.9623, lines: ['shinkansen_joetsu'], prefecture: '新潟県' },
  { id: 'shk_nagaoka', name: '長岡', lat: 37.4490, lng: 138.8530, lines: ['shinkansen_joetsu'], prefecture: '新潟県' },
  { id: 'shk_tsubame_sanjo', name: '燕三条', lat: 37.6264, lng: 138.9497, lines: ['shinkansen_joetsu'], prefecture: '新潟県' },
  { id: 'shk_niigata', name: '新潟', lat: 37.9126, lng: 139.0635, lines: ['shinkansen_joetsu'], prefecture: '新潟県' },

  // ========== 北陸新幹線 ==========
  { id: 'shk_annaka_haruna', name: '安中榛名', lat: 36.3662, lng: 138.8655, lines: ['shinkansen_hokuriku'], prefecture: '群馬県' },
  { id: 'shk_karuizawa', name: '軽井沢', lat: 36.3446, lng: 138.6369, lines: ['shinkansen_hokuriku'], prefecture: '長野県' },
  { id: 'shk_sakudaira', name: '佐久平', lat: 36.2494, lng: 138.4847, lines: ['shinkansen_hokuriku'], prefecture: '長野県' },
  { id: 'shk_ueda', name: '上田', lat: 36.4030, lng: 138.2514, lines: ['shinkansen_hokuriku'], prefecture: '長野県' },
  { id: 'shk_nagano', name: '長野', lat: 36.6433, lng: 138.1890, lines: ['shinkansen_hokuriku'], prefecture: '長野県' },
  { id: 'shk_iiyama', name: '飯山', lat: 36.8524, lng: 138.3656, lines: ['shinkansen_hokuriku'], prefecture: '長野県' },
  { id: 'shk_joetsu_myoko', name: '上越妙高', lat: 37.0824, lng: 138.2527, lines: ['shinkansen_hokuriku'], prefecture: '新潟県' },
  { id: 'shk_itoigawa', name: '糸魚川', lat: 37.0413, lng: 137.8601, lines: ['shinkansen_hokuriku'], prefecture: '新潟県' },
  { id: 'shk_kurobe_unazukionsen', name: '黒部宇奈月温泉', lat: 36.8685, lng: 137.5498, lines: ['shinkansen_hokuriku'], prefecture: '富山県' },
  { id: 'shk_toyama', name: '富山', lat: 36.7013, lng: 137.2134, lines: ['shinkansen_hokuriku'], prefecture: '富山県' },
  { id: 'shk_shin_takaoka', name: '新高岡', lat: 36.7211, lng: 137.0051, lines: ['shinkansen_hokuriku'], prefecture: '富山県' },
  { id: 'shk_kanazawa', name: '金沢', lat: 36.5780, lng: 136.6488, lines: ['shinkansen_hokuriku'], prefecture: '石川県' },
  { id: 'shk_komatsu', name: '小松', lat: 36.4078, lng: 136.4457, lines: ['shinkansen_hokuriku'], prefecture: '石川県' },
  { id: 'shk_kaga_onsen', name: '加賀温泉', lat: 36.3130, lng: 136.3637, lines: ['shinkansen_hokuriku'], prefecture: '石川県' },
  { id: 'shk_awara_onsen', name: '芦原温泉', lat: 36.2180, lng: 136.2328, lines: ['shinkansen_hokuriku'], prefecture: '福井県' },
  { id: 'shk_fukui', name: '福井', lat: 36.0623, lng: 136.2234, lines: ['shinkansen_hokuriku'], prefecture: '福井県' },
  { id: 'shk_echizen_takefu', name: '越前たけふ', lat: 35.8994, lng: 136.1786, lines: ['shinkansen_hokuriku'], prefecture: '福井県' },
  { id: 'shk_tsuruga', name: '敦賀', lat: 35.6455, lng: 136.0555, lines: ['shinkansen_hokuriku'], prefecture: '福井県' },

  // ========== 九州新幹線 ==========
  { id: 'shk_shin_tosu', name: '新鳥栖', lat: 33.3656, lng: 130.5278, lines: ['shinkansen_kyushu'], prefecture: '佐賀県' },
  { id: 'shk_kurume', name: '久留米', lat: 33.3207, lng: 130.5084, lines: ['shinkansen_kyushu'], prefecture: '福岡県' },
  { id: 'shk_chikugo_funagoya', name: '筑後船小屋', lat: 33.2144, lng: 130.4943, lines: ['shinkansen_kyushu'], prefecture: '福岡県' },
  { id: 'shk_shin_omuta', name: '新大牟田', lat: 33.0514, lng: 130.4662, lines: ['shinkansen_kyushu'], prefecture: '福岡県' },
  { id: 'shk_shin_tamana', name: '新玉名', lat: 32.9391, lng: 130.5659, lines: ['shinkansen_kyushu'], prefecture: '熊本県' },
  { id: 'shk_kumamoto', name: '熊本', lat: 32.7904, lng: 130.6860, lines: ['shinkansen_kyushu'], prefecture: '熊本県' },
  { id: 'shk_shin_yatsushiro', name: '新八代', lat: 32.5060, lng: 130.6268, lines: ['shinkansen_kyushu'], prefecture: '熊本県' },
  { id: 'shk_shin_minamata', name: '新水俣', lat: 32.2226, lng: 130.4568, lines: ['shinkansen_kyushu'], prefecture: '熊本県' },
  { id: 'shk_izumi', name: '出水', lat: 32.1015, lng: 130.3556, lines: ['shinkansen_kyushu'], prefecture: '鹿児島県' },
  { id: 'shk_sendai_kagoshima', name: '川内', lat: 31.8155, lng: 130.3035, lines: ['shinkansen_kyushu'], prefecture: '鹿児島県' },
  { id: 'shk_kagoshima_chuo', name: '鹿児島中央', lat: 31.5840, lng: 130.5414, lines: ['shinkansen_kyushu'], prefecture: '鹿児島県' },

  // ========== 西九州新幹線 ==========
  { id: 'shk_takeo_onsen', name: '武雄温泉', lat: 33.1944, lng: 130.0204, lines: ['shinkansen_nishi_kyushu'], prefecture: '佐賀県' },
  { id: 'shk_ureshino_onsen', name: '嬉野温泉', lat: 33.1016, lng: 130.0073, lines: ['shinkansen_nishi_kyushu'], prefecture: '佐賀県' },
  { id: 'shk_shin_omura', name: '新大村', lat: 32.9262, lng: 129.9646, lines: ['shinkansen_nishi_kyushu'], prefecture: '長崎県' },
  { id: 'shk_isahaya', name: '諫早', lat: 32.8434, lng: 130.0524, lines: ['shinkansen_nishi_kyushu'], prefecture: '長崎県' },
  { id: 'shk_nagasaki', name: '長崎', lat: 32.7516, lng: 129.8698, lines: ['shinkansen_nishi_kyushu'], prefecture: '長崎県' },

  // ========== 秋田新幹線 ==========
  { id: 'shk_shizukuishi', name: '雫石', lat: 39.6949, lng: 140.9720, lines: ['shinkansen_akita'], prefecture: '岩手県' },
  { id: 'shk_tazawako', name: '田沢湖', lat: 39.7023, lng: 140.7219, lines: ['shinkansen_akita'], prefecture: '秋田県' },
  { id: 'shk_kakunodate', name: '角館', lat: 39.5961, lng: 140.5575, lines: ['shinkansen_akita'], prefecture: '秋田県' },
  { id: 'shk_omagari', name: '大曲', lat: 39.4467, lng: 140.4767, lines: ['shinkansen_akita'], prefecture: '秋田県' },
  { id: 'shk_akita', name: '秋田', lat: 39.7177, lng: 140.1034, lines: ['shinkansen_akita'], prefecture: '秋田県' },

  // ========== 山形新幹線 ==========
  { id: 'shk_yonezawa', name: '米沢', lat: 37.9121, lng: 140.1151, lines: ['shinkansen_yamagata'], prefecture: '山形県' },
  { id: 'shk_takahata', name: '高畠', lat: 38.0019, lng: 140.1875, lines: ['shinkansen_yamagata'], prefecture: '山形県' },
  { id: 'shk_akayu', name: '赤湯', lat: 38.0547, lng: 140.1475, lines: ['shinkansen_yamagata'], prefecture: '山形県' },
  { id: 'shk_kaminoyama_onsen', name: 'かみのやま温泉', lat: 38.1527, lng: 140.2742, lines: ['shinkansen_yamagata'], prefecture: '山形県' },
  { id: 'shk_yamagata', name: '山形', lat: 38.2486, lng: 140.3282, lines: ['shinkansen_yamagata'], prefecture: '山形県' },
  { id: 'shk_tendo', name: '天童', lat: 38.3583, lng: 140.3794, lines: ['shinkansen_yamagata'], prefecture: '山形県' },
  { id: 'shk_sakuranbohigashine', name: 'さくらんぼ東根', lat: 38.4310, lng: 140.3922, lines: ['shinkansen_yamagata'], prefecture: '山形県' },
  { id: 'shk_murayama', name: '村山', lat: 38.4824, lng: 140.3828, lines: ['shinkansen_yamagata'], prefecture: '山形県' },
  { id: 'shk_oishida', name: '大石田', lat: 38.5922, lng: 140.3755, lines: ['shinkansen_yamagata'], prefecture: '山形県' },
  { id: 'shk_shinjo', name: '新庄', lat: 38.7640, lng: 140.3155, lines: ['shinkansen_yamagata'], prefecture: '山形県' },
];

// ---------------------------------------------------------------------------
// 路線データ
// ---------------------------------------------------------------------------

const lines: LineData[] = [
  // 東海道新幹線
  {
    id: 'shinkansen_tokaido',
    name: '東海道新幹線',
    company: 'JR東海',
    color: '#0072BC',
    vehicleType: 'shinkansen',
    stationIds: [
      'shk_tokyo', 'shk_shinagawa', 'shk_shin_yokohama', 'shk_odawara',
      'shk_atami', 'shk_mishima', 'shk_shin_fuji', 'shk_shizuoka',
      'shk_kakegawa', 'shk_hamamatsu', 'shk_toyohashi', 'shk_mikawa_anjo',
      'shk_nagoya', 'shk_gifu_hashima', 'shk_maibara', 'shk_kyoto',
      'shk_shin_osaka',
    ],
    isLoop: false,
    avgIntervalMinutes: 7,
    // 東海道新幹線の実際の線路形状（長距離区間は中間点で精度向上）
    trackPoints: {
      // 東京→品川: 南西へ直線的
      'shk_tokyo:shk_shinagawa': [
        { lat: 35.6620, lng: 139.7580 },
        { lat: 35.6450, lng: 139.7490 },
      ],
      // 品川→新横浜: 多摩川を渡って南西へ
      'shk_shinagawa:shk_shin_yokohama': [
        { lat: 35.6100, lng: 139.7250 },
        { lat: 35.5850, lng: 139.6990 },
        { lat: 35.5600, lng: 139.6700 },
        { lat: 35.5350, lng: 139.6450 },
      ],
      // 新横浜→小田原: 西南西へ（相模川沿い）
      'shk_shin_yokohama:shk_odawara': [
        { lat: 35.4800, lng: 139.5800 },
        { lat: 35.4400, lng: 139.5200 },
        { lat: 35.3900, lng: 139.4400 },
        { lat: 35.3400, lng: 139.3500 },
        { lat: 35.2900, lng: 139.2500 },
      ],
      // 小田原→熱海: 相模湾沿いに南西（急カーブ区間）
      'shk_odawara:shk_atami': [
        { lat: 35.2300, lng: 139.1400 },
        { lat: 35.2000, lng: 139.1250 },
        { lat: 35.1700, lng: 139.1100 },
        { lat: 35.1400, lng: 139.0950 },
      ],
      // 熱海→三島: 丹那トンネルを通り西へ
      'shk_atami:shk_mishima': [
        { lat: 35.1100, lng: 139.0500 },
        { lat: 35.1150, lng: 139.0100 },
        { lat: 35.1200, lng: 138.9600 },
      ],
      // 三島→新富士: 富士山南麓を西へ
      'shk_mishima:shk_shin_fuji': [
        { lat: 35.1350, lng: 138.8600 },
        { lat: 35.1400, lng: 138.8000 },
        { lat: 35.1420, lng: 138.7300 },
      ],
      // 米原→京都: 琵琶湖南岸を西南西へ（重要なカーブ）
      'shk_maibara:shk_kyoto': [
        { lat: 35.2900, lng: 136.2200 },
        { lat: 35.2500, lng: 136.1500 },
        { lat: 35.2000, lng: 136.0700 },
        { lat: 35.1500, lng: 136.0000 },
        { lat: 35.1000, lng: 135.9200 },
        { lat: 35.0400, lng: 135.8500 },
      ],
      // 京都→新大阪: 南西へ
      'shk_kyoto:shk_shin_osaka': [
        { lat: 34.9600, lng: 135.7300 },
        { lat: 34.9200, lng: 135.6900 },
        { lat: 34.8700, lng: 135.6400 },
        { lat: 34.8100, lng: 135.5700 },
        { lat: 34.7700, lng: 135.5300 },
      ],
    },
  },

  // 山陽新幹線
  {
    id: 'shinkansen_sanyo',
    name: '山陽新幹線',
    company: 'JR西日本',
    color: '#0072BC',
    vehicleType: 'shinkansen',
    stationIds: [
      'shk_shin_osaka', 'shk_shin_kobe', 'shk_nishi_akashi', 'shk_himeji',
      'shk_aioi', 'shk_okayama', 'shk_shin_kurashiki', 'shk_fukuyama',
      'shk_mihara', 'shk_higashi_hiroshima', 'shk_hiroshima', 'shk_shin_iwakuni',
      'shk_tokuyama', 'shk_shin_yamaguchi', 'shk_asa', 'shk_shin_shimonoseki',
      'shk_kokura', 'shk_hakata',
    ],
    isLoop: false,
    avgIntervalMinutes: 7,
  },

  // 東北新幹線
  {
    id: 'shinkansen_tohoku',
    name: '東北新幹線',
    company: 'JR東日本',
    color: '#00B261',
    vehicleType: 'shinkansen',
    stationIds: [
      'shk_tokyo', 'shk_ueno', 'shk_omiya', 'shk_oyama', 'shk_utsunomiya',
      'shk_nasushiobara', 'shk_shin_shirakawa', 'shk_koriyama', 'shk_fukushima',
      'shk_shiroishi_zao', 'shk_sendai', 'shk_furukawa', 'shk_kurikoma_kogen',
      'shk_ichinoseki', 'shk_mizusawa_esashi', 'shk_kitakami', 'shk_shin_hanamaki',
      'shk_morioka', 'shk_iwate_numakunai', 'shk_ninohe', 'shk_hachinohe',
      'shk_shichinohe_towada', 'shk_shin_aomori',
    ],
    isLoop: false,
    avgIntervalMinutes: 7,
  },

  // 北海道新幹線
  {
    id: 'shinkansen_hokkaido',
    name: '北海道新幹線',
    company: 'JR北海道',
    color: '#00B261',
    vehicleType: 'shinkansen',
    stationIds: [
      'shk_shin_aomori', 'shk_okutsugaru_imabetsu', 'shk_kikonai',
      'shk_shin_hakodate_hokuto',
    ],
    isLoop: false,
    avgIntervalMinutes: 8,
  },

  // 上越新幹線
  {
    id: 'shinkansen_joetsu',
    name: '上越新幹線',
    company: 'JR東日本',
    color: '#E4007F',
    vehicleType: 'shinkansen',
    stationIds: [
      'shk_omiya', 'shk_kumagaya', 'shk_honjo_waseda', 'shk_takasaki',
      'shk_jomo_kogen', 'shk_echigo_yuzawa', 'shk_urasa', 'shk_nagaoka',
      'shk_tsubame_sanjo', 'shk_niigata',
    ],
    isLoop: false,
    avgIntervalMinutes: 7,
  },

  // 北陸新幹線
  {
    id: 'shinkansen_hokuriku',
    name: '北陸新幹線',
    company: 'JR東日本・JR西日本',
    color: '#005BAC',
    vehicleType: 'shinkansen',
    stationIds: [
      'shk_takasaki', 'shk_annaka_haruna', 'shk_karuizawa', 'shk_sakudaira',
      'shk_ueda', 'shk_nagano', 'shk_iiyama', 'shk_joetsu_myoko',
      'shk_itoigawa', 'shk_kurobe_unazukionsen', 'shk_toyama', 'shk_shin_takaoka',
      'shk_kanazawa', 'shk_komatsu', 'shk_kaga_onsen', 'shk_awara_onsen',
      'shk_fukui', 'shk_echizen_takefu', 'shk_tsuruga',
    ],
    isLoop: false,
    avgIntervalMinutes: 6,
  },

  // 九州新幹線
  {
    id: 'shinkansen_kyushu',
    name: '九州新幹線',
    company: 'JR九州',
    color: '#FF0000',
    vehicleType: 'shinkansen',
    stationIds: [
      'shk_hakata', 'shk_shin_tosu', 'shk_kurume', 'shk_chikugo_funagoya',
      'shk_shin_omuta', 'shk_shin_tamana', 'shk_kumamoto', 'shk_shin_yatsushiro',
      'shk_shin_minamata', 'shk_izumi', 'shk_sendai_kagoshima', 'shk_kagoshima_chuo',
    ],
    isLoop: false,
    avgIntervalMinutes: 7,
  },

  // 西九州新幹線
  {
    id: 'shinkansen_nishi_kyushu',
    name: '西九州新幹線',
    company: 'JR九州',
    color: '#FF8C00',
    vehicleType: 'shinkansen',
    stationIds: [
      'shk_takeo_onsen', 'shk_ureshino_onsen', 'shk_shin_omura',
      'shk_isahaya', 'shk_nagasaki',
    ],
    isLoop: false,
    avgIntervalMinutes: 6,
  },

  // 秋田新幹線（ミニ新幹線）
  {
    id: 'shinkansen_akita',
    name: '秋田新幹線',
    company: 'JR東日本',
    color: '#E7380D',
    vehicleType: 'shinkansen',
    stationIds: [
      'shk_morioka', 'shk_shizukuishi', 'shk_tazawako', 'shk_kakunodate',
      'shk_omagari', 'shk_akita',
    ],
    isLoop: false,
    avgIntervalMinutes: 8,
  },

  // 山形新幹線（ミニ新幹線）
  {
    id: 'shinkansen_yamagata',
    name: '山形新幹線',
    company: 'JR東日本',
    color: '#8B008B',
    vehicleType: 'shinkansen',
    stationIds: [
      'shk_fukushima', 'shk_yonezawa', 'shk_takahata', 'shk_akayu',
      'shk_kaminoyama_onsen', 'shk_yamagata', 'shk_tendo',
      'shk_sakuranbohigashine', 'shk_murayama', 'shk_oishida', 'shk_shinjo',
    ],
    isLoop: false,
    avgIntervalMinutes: 6,
  },
];

// ---------------------------------------------------------------------------
// エクスポート
// ---------------------------------------------------------------------------

export const shinkansenData: RegionData = { stations, lines };
