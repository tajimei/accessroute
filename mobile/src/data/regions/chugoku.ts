/**
 * 中国地方 鉄道データ
 *
 * JR山陽本線・JR山陰本線・広島電鉄・アストラムラインの
 * 駅・路線情報。駅IDは cg_ プレフィクス。
 *
 * ※ JR山陰本線の京都-福知山区間は関西圏の利用が中心のため、
 *   将来的に kansai.ts で追加される可能性がある。
 *   ここでは福知山以西の主要駅を収録する。
 */

import { StationData, LineData, RegionData } from '../types';

// ---------------------------------------------------------------------------
// 駅データ
// ---------------------------------------------------------------------------

const stations: StationData[] = [
  // ========== JR山陽本線（岡山-下関 主要駅） ==========
  { id: 'cg_okayama', name: '岡山', lat: 34.6655, lng: 133.9184, lines: ['jr_sanyo'], prefecture: '岡山県' },
  { id: 'cg_kurashiki', name: '倉敷', lat: 34.6011, lng: 133.7716, lines: ['jr_sanyo'], prefecture: '岡山県' },
  { id: 'cg_shin_kurashiki', name: '新倉敷', lat: 34.5951, lng: 133.7193, lines: ['jr_sanyo'], prefecture: '岡山県' },
  { id: 'cg_kasaoka', name: '笠岡', lat: 34.5085, lng: 133.5046, lines: ['jr_sanyo'], prefecture: '岡山県' },
  { id: 'cg_fukuyama', name: '福山', lat: 34.4927, lng: 133.3625, lines: ['jr_sanyo'], prefecture: '広島県' },
  { id: 'cg_onomichi', name: '尾道', lat: 34.4119, lng: 133.2043, lines: ['jr_sanyo'], prefecture: '広島県' },
  { id: 'cg_mihara', name: '三原', lat: 34.3997, lng: 133.0822, lines: ['jr_sanyo'], prefecture: '広島県' },
  { id: 'cg_takehara', name: '竹原', lat: 34.3410, lng: 132.9080, lines: ['jr_sanyo'], prefecture: '広島県' },
  { id: 'cg_saijo', name: '西条', lat: 34.4274, lng: 132.7440, lines: ['jr_sanyo'], prefecture: '広島県' },
  { id: 'cg_hachihonmatsu', name: '八本松', lat: 34.4294, lng: 132.6807, lines: ['jr_sanyo'], prefecture: '広島県' },
  { id: 'cg_seno', name: '瀬野', lat: 34.4214, lng: 132.5945, lines: ['jr_sanyo'], prefecture: '広島県' },
  { id: 'cg_kaita_ichi', name: '海田市', lat: 34.3780, lng: 132.5341, lines: ['jr_sanyo'], prefecture: '広島県' },
  { id: 'cg_hiroshima', name: '広島', lat: 34.3963, lng: 132.4752, lines: ['jr_sanyo', 'jr_sanin_west'], prefecture: '広島県' },
  { id: 'cg_nishi_hiroshima', name: '西広島', lat: 34.3930, lng: 132.4261, lines: ['jr_sanyo'], prefecture: '広島県' },
  { id: 'cg_miyajimaguchi', name: '宮島口', lat: 34.3535, lng: 132.3186, lines: ['jr_sanyo'], prefecture: '広島県' },
  { id: 'cg_iwakuni', name: '岩国', lat: 34.1672, lng: 132.2211, lines: ['jr_sanyo', 'jr_sanin_west'], prefecture: '山口県' },
  { id: 'cg_yanai', name: '柳井', lat: 33.9655, lng: 132.1068, lines: ['jr_sanyo'], prefecture: '山口県' },
  { id: 'cg_tokuyama', name: '徳山', lat: 34.0508, lng: 131.8064, lines: ['jr_sanyo', 'jr_sanin_west'], prefecture: '山口県' },
  { id: 'cg_bofu', name: '防府', lat: 34.0520, lng: 131.5668, lines: ['jr_sanyo', 'jr_sanin_west'], prefecture: '山口県' },
  { id: 'cg_shin_yamaguchi', name: '新山口', lat: 34.0962, lng: 131.4746, lines: ['jr_sanyo', 'jr_sanin_west'], prefecture: '山口県' },
  { id: 'cg_ube', name: '宇部', lat: 33.9578, lng: 131.2468, lines: ['jr_sanyo'], prefecture: '山口県' },
  { id: 'cg_shimonoseki', name: '下関', lat: 33.9508, lng: 130.9211, lines: ['jr_sanyo'], prefecture: '山口県' },

  // ========== JR山陰本線（福知山-下関 主要駅） ==========
  { id: 'cg_fukuchiyama', name: '福知山', lat: 35.2964, lng: 135.1296, lines: ['jr_sanin'], prefecture: '京都府' },
  { id: 'cg_wadayama', name: '和田山', lat: 35.3444, lng: 134.8522, lines: ['jr_sanin'], prefecture: '兵庫県' },
  { id: 'cg_toyooka', name: '豊岡', lat: 35.5411, lng: 134.8202, lines: ['jr_sanin'], prefecture: '兵庫県' },
  { id: 'cg_kinosaki_onsen', name: '城崎温泉', lat: 35.6223, lng: 134.8116, lines: ['jr_sanin'], prefecture: '兵庫県' },
  { id: 'cg_kasumi', name: '香住', lat: 35.6373, lng: 134.6291, lines: ['jr_sanin'], prefecture: '兵庫県' },
  { id: 'cg_hamasaka', name: '浜坂', lat: 35.6256, lng: 134.4579, lines: ['jr_sanin'], prefecture: '兵庫県' },
  { id: 'cg_tottori', name: '鳥取', lat: 35.4944, lng: 134.2281, lines: ['jr_sanin'], prefecture: '鳥取県' },
  { id: 'cg_kurayoshi', name: '倉吉', lat: 35.4294, lng: 133.8264, lines: ['jr_sanin'], prefecture: '鳥取県' },
  { id: 'cg_yonago', name: '米子', lat: 35.4283, lng: 133.3341, lines: ['jr_sanin'], prefecture: '鳥取県' },
  { id: 'cg_matsue', name: '松江', lat: 35.4641, lng: 133.0608, lines: ['jr_sanin'], prefecture: '島根県' },
  { id: 'cg_izumo_shi', name: '出雲市', lat: 35.3548, lng: 132.7552, lines: ['jr_sanin'], prefecture: '島根県' },
  { id: 'cg_oda_shi', name: '大田市', lat: 35.1945, lng: 132.5007, lines: ['jr_sanin'], prefecture: '島根県' },
  { id: 'cg_gotsu', name: '江津', lat: 35.0451, lng: 132.2228, lines: ['jr_sanin'], prefecture: '島根県' },
  { id: 'cg_hamada', name: '浜田', lat: 34.8993, lng: 132.0756, lines: ['jr_sanin'], prefecture: '島根県' },
  { id: 'cg_masuda', name: '益田', lat: 34.6778, lng: 131.8402, lines: ['jr_sanin', 'jr_sanin_west'], prefecture: '島根県' },
  { id: 'cg_higashi_hagi', name: '東萩', lat: 34.4203, lng: 131.4158, lines: ['jr_sanin_west'], prefecture: '山口県' },
  { id: 'cg_nagato_shi', name: '長門市', lat: 34.3709, lng: 131.1822, lines: ['jr_sanin_west'], prefecture: '山口県' },
  { id: 'cg_kogushi', name: '小串', lat: 34.2291, lng: 130.9632, lines: ['jr_sanin_west'], prefecture: '山口県' },
  { id: 'cg_shimonoseki_sanin', name: '幡生', lat: 33.9690, lng: 130.9370, lines: ['jr_sanin_west'], prefecture: '山口県' },
  { id: 'cg_chofu', name: '長府', lat: 33.9970, lng: 131.0120, lines: ['jr_sanin_west'], prefecture: '山口県' },
  { id: 'cg_kotsuki', name: '小月', lat: 34.0040, lng: 131.0600, lines: ['jr_sanin_west'], prefecture: '山口県' },
  { id: 'cg_asa', name: '厚狭', lat: 34.0463, lng: 131.2222, lines: ['jr_sanin_west'], prefecture: '山口県' },

  // ========== 広島電鉄（広島市内 主要停留所） ==========
  { id: 'cg_hiroden_hiroshima_eki', name: '広島駅', lat: 34.3963, lng: 132.4752, lines: ['hiroden_1', 'hiroden_2', 'hiroden_6'], prefecture: '広島県' },
  { id: 'cg_matoba_cho', name: '的場町', lat: 34.3920, lng: 132.4720, lines: ['hiroden_1', 'hiroden_2', 'hiroden_6'], prefecture: '広島県' },
  { id: 'cg_inari_machi', name: '稲荷町', lat: 34.3905, lng: 132.4680, lines: ['hiroden_1', 'hiroden_2', 'hiroden_6'], prefecture: '広島県' },
  { id: 'cg_kamiyacho_nishi', name: '紙屋町西', lat: 34.3945, lng: 132.4540, lines: ['hiroden_2', 'hiroden_6', 'hiroden_3'], prefecture: '広島県' },
  { id: 'cg_kamiyacho_higashi', name: '紙屋町東', lat: 34.3941, lng: 132.4570, lines: ['hiroden_1', 'hiroden_6'], prefecture: '広島県' },
  { id: 'cg_hondori', name: '本通', lat: 34.3920, lng: 132.4540, lines: ['hiroden_1'], prefecture: '広島県' },
  { id: 'cg_hatchobori', name: '八丁堀', lat: 34.3930, lng: 132.4625, lines: ['hiroden_1', 'hiroden_2', 'hiroden_6'], prefecture: '広島県' },
  { id: 'cg_tatemachi', name: '立町', lat: 34.3932, lng: 132.4590, lines: ['hiroden_1'], prefecture: '広島県' },
  { id: 'cg_genbaku_dome_mae', name: '原爆ドーム前', lat: 34.3956, lng: 132.4530, lines: ['hiroden_2', 'hiroden_6'], prefecture: '広島県' },
  { id: 'cg_yokogawa_eki', name: '横川駅', lat: 34.4038, lng: 132.4435, lines: ['hiroden_7'], prefecture: '広島県' },
  { id: 'cg_yokogawa_ichicho_me', name: '横川一丁目', lat: 34.4015, lng: 132.4455, lines: ['hiroden_7'], prefecture: '広島県' },
  { id: 'cg_hiroden_miyajima_guchi', name: '広電宮島口', lat: 34.3535, lng: 132.3150, lines: ['hiroden_2'], prefecture: '広島県' },
  { id: 'cg_hiroden_nishi_hiroshima', name: '広電西広島', lat: 34.3947, lng: 132.4260, lines: ['hiroden_2', 'hiroden_3'], prefecture: '広島県' },
  { id: 'cg_dobashi', name: '土橋', lat: 34.3935, lng: 132.4430, lines: ['hiroden_2', 'hiroden_3'], prefecture: '広島県' },
  { id: 'cg_juutaku_mae', name: '十日市町', lat: 34.3945, lng: 132.4480, lines: ['hiroden_2', 'hiroden_3', 'hiroden_7'], prefecture: '広島県' },
  { id: 'cg_hiroden_port', name: '広島港', lat: 34.3624, lng: 132.4636, lines: ['hiroden_1', 'hiroden_3'], prefecture: '広島県' },
  { id: 'cg_minami_machi_6', name: '南区役所前', lat: 34.3815, lng: 132.4715, lines: ['hiroden_1'], prefecture: '広島県' },
  { id: 'cg_hijiyama_shita', name: '比治山下', lat: 34.3860, lng: 132.4720, lines: ['hiroden_1'], prefecture: '広島県' },

  // ========== アストラムライン（広島高速交通） ==========
  { id: 'cg_hondori_astram', name: '本通', lat: 34.3920, lng: 132.4540, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_kencho_mae', name: '県庁前', lat: 34.3963, lng: 132.4560, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_jogo_machi', name: '城北', lat: 34.4020, lng: 132.4550, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_shin_hakushima', name: '新白島', lat: 34.4040, lng: 132.4580, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_hakushima', name: '白島', lat: 34.4070, lng: 132.4600, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_ushita', name: '牛田', lat: 34.4115, lng: 132.4630, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_fudoin_mae', name: '不動院前', lat: 34.4171, lng: 132.4720, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_gion_shinhashi_kita', name: '祇園新橋北', lat: 34.4235, lng: 132.4705, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_nishi_hara', name: '西原', lat: 34.4290, lng: 132.4683, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_nakanochiru', name: '中筋', lat: 34.4340, lng: 132.4640, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_furuchi', name: '古市', lat: 34.4395, lng: 132.4580, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_omachi', name: '大町', lat: 34.4430, lng: 132.4530, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_gotouchi', name: '毘沙門台', lat: 34.4485, lng: 132.4460, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_takata', name: '安東', lat: 34.4520, lng: 132.4370, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_asakita_ku_yakusho', name: '上安', lat: 34.4565, lng: 132.4310, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_takatoriyama', name: '高取', lat: 34.4600, lng: 132.4240, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_chorakuji', name: '長楽寺', lat: 34.4620, lng: 132.4140, lines: ['astramline'], prefecture: '広島県' },
  { id: 'cg_hiroshima_koiki_koen_mae', name: '広域公園前', lat: 34.4608, lng: 132.3990, lines: ['astramline'], prefecture: '広島県' },
];

// ---------------------------------------------------------------------------
// 路線データ
// ---------------------------------------------------------------------------

const lines: LineData[] = [
  // JR山陽本線（岡山-下関）
  {
    id: 'jr_sanyo',
    name: 'JR山陽本線',
    company: 'JR西日本',
    color: '#0072BC',
    vehicleType: 'train',
    stationIds: [
      'cg_okayama', 'cg_kurashiki', 'cg_shin_kurashiki', 'cg_kasaoka',
      'cg_fukuyama', 'cg_onomichi', 'cg_mihara', 'cg_takehara', 'cg_saijo',
      'cg_hachihonmatsu', 'cg_seno', 'cg_kaita_ichi', 'cg_hiroshima',
      'cg_nishi_hiroshima', 'cg_miyajimaguchi', 'cg_iwakuni', 'cg_yanai',
      'cg_tokuyama', 'cg_bofu', 'cg_shin_yamaguchi', 'cg_ube', 'cg_shimonoseki',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },

  // JR山陰本線（福知山-益田）
  {
    id: 'jr_sanin',
    name: 'JR山陰本線（東部）',
    company: 'JR西日本',
    color: '#008000',
    vehicleType: 'train',
    stationIds: [
      'cg_fukuchiyama', 'cg_wadayama', 'cg_toyooka', 'cg_kinosaki_onsen',
      'cg_kasumi', 'cg_hamasaka', 'cg_tottori', 'cg_kurayoshi', 'cg_yonago',
      'cg_matsue', 'cg_izumo_shi', 'cg_oda_shi', 'cg_gotsu', 'cg_hamada',
      'cg_masuda',
    ],
    isLoop: false,
    avgIntervalMinutes: 8,
  },

  // JR山陰本線（益田-下関 西部区間）
  {
    id: 'jr_sanin_west',
    name: 'JR山陰本線（西部）',
    company: 'JR西日本',
    color: '#008000',
    vehicleType: 'train',
    stationIds: [
      'cg_masuda', 'cg_higashi_hagi', 'cg_nagato_shi',
      'cg_kogushi', 'cg_shimonoseki_sanin', 'cg_chofu', 'cg_kotsuki', 'cg_asa',
      'cg_shin_yamaguchi', 'cg_bofu', 'cg_tokuyama',
      'cg_iwakuni', 'cg_hiroshima',
    ],
    isLoop: false,
    avgIntervalMinutes: 10,
  },

  // 広島電鉄 1号線（広島駅-広島港）
  {
    id: 'hiroden_1',
    name: '広島電鉄1号線',
    company: '広島電鉄',
    color: '#E60012',
    vehicleType: 'tram',
    stationIds: [
      'cg_hiroden_hiroshima_eki', 'cg_matoba_cho', 'cg_inari_machi',
      'cg_hatchobori', 'cg_tatemachi', 'cg_hondori', 'cg_kamiyacho_higashi',
      'cg_hijiyama_shita', 'cg_minami_machi_6', 'cg_hiroden_port',
    ],
    isLoop: false,
  },

  // 広島電鉄 2号線（広島駅-広電宮島口）
  {
    id: 'hiroden_2',
    name: '広島電鉄2号線',
    company: '広島電鉄',
    color: '#E60012',
    vehicleType: 'tram',
    stationIds: [
      'cg_hiroden_hiroshima_eki', 'cg_matoba_cho', 'cg_inari_machi',
      'cg_hatchobori', 'cg_kamiyacho_nishi', 'cg_genbaku_dome_mae',
      'cg_juutaku_mae', 'cg_dobashi', 'cg_hiroden_nishi_hiroshima',
      'cg_hiroden_miyajima_guchi',
    ],
    isLoop: false,
  },

  // 広島電鉄 3号線（広電西広島-広島港）
  {
    id: 'hiroden_3',
    name: '広島電鉄3号線',
    company: '広島電鉄',
    color: '#E60012',
    vehicleType: 'tram',
    stationIds: [
      'cg_hiroden_nishi_hiroshima', 'cg_dobashi', 'cg_juutaku_mae',
      'cg_kamiyacho_nishi', 'cg_hiroden_port',
    ],
    isLoop: false,
  },

  // 広島電鉄 6号線（広島駅-江波 ※簡易）
  {
    id: 'hiroden_6',
    name: '広島電鉄6号線',
    company: '広島電鉄',
    color: '#E60012',
    vehicleType: 'tram',
    stationIds: [
      'cg_hiroden_hiroshima_eki', 'cg_matoba_cho', 'cg_inari_machi',
      'cg_hatchobori', 'cg_kamiyacho_higashi', 'cg_kamiyacho_nishi',
      'cg_genbaku_dome_mae',
    ],
    isLoop: false,
  },

  // 広島電鉄 7号線（横川駅-広電本社前 ※簡易）
  {
    id: 'hiroden_7',
    name: '広島電鉄7号線',
    company: '広島電鉄',
    color: '#E60012',
    vehicleType: 'tram',
    stationIds: [
      'cg_yokogawa_eki', 'cg_yokogawa_ichicho_me', 'cg_juutaku_mae',
    ],
    isLoop: false,
  },

  // アストラムライン
  {
    id: 'astramline',
    name: 'アストラムライン',
    company: '広島高速交通',
    color: '#8B4513',
    vehicleType: 'monorail',
    stationIds: [
      'cg_hondori_astram', 'cg_kencho_mae', 'cg_jogo_machi', 'cg_shin_hakushima',
      'cg_hakushima', 'cg_ushita', 'cg_fudoin_mae', 'cg_gion_shinhashi_kita',
      'cg_nishi_hara', 'cg_nakanochiru', 'cg_furuchi', 'cg_omachi',
      'cg_gotouchi', 'cg_takata', 'cg_asakita_ku_yakusho', 'cg_takatoriyama',
      'cg_chorakuji', 'cg_hiroshima_koiki_koen_mae',
    ],
    isLoop: false,
  },
];

// ---------------------------------------------------------------------------
// エクスポート
// ---------------------------------------------------------------------------

export const chugokuData: RegionData = { stations, lines };
