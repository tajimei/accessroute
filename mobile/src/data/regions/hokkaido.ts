/**
 * 北海道地方 鉄道データ
 *
 * 札幌市営地下鉄・札幌市電・JR北海道の駅・路線情報。
 * 駅IDは hk_ プレフィクス。
 */

import { StationData, LineData, RegionData } from '../types';

// ---------------------------------------------------------------------------
// 駅データ
// ---------------------------------------------------------------------------

const stations: StationData[] = [
  // ========== 札幌市営地下鉄 南北線 ==========
  { id: 'hk_asabu', name: '麻生', lat: 43.0978, lng: 141.3406, lines: ['hk_subway_namboku'], prefecture: '北海道' },
  { id: 'hk_kita34jo', name: '北34条', lat: 43.0917, lng: 141.3406, lines: ['hk_subway_namboku'], prefecture: '北海道' },
  { id: 'hk_kita24jo', name: '北24条', lat: 43.0836, lng: 141.3406, lines: ['hk_subway_namboku'], prefecture: '北海道' },
  { id: 'hk_kita18jo', name: '北18条', lat: 43.0783, lng: 141.3456, lines: ['hk_subway_namboku'], prefecture: '北海道' },
  { id: 'hk_kita12jo', name: '北12条', lat: 43.0731, lng: 141.3475, lines: ['hk_subway_namboku'], prefecture: '北海道' },
  { id: 'hk_sapporo', name: 'さっぽろ', lat: 43.0686, lng: 141.3508, lines: ['hk_subway_namboku', 'hk_subway_toho'], prefecture: '北海道' },
  { id: 'hk_odori', name: '大通', lat: 43.0603, lng: 141.3547, lines: ['hk_subway_namboku', 'hk_subway_tozai', 'hk_subway_toho'], prefecture: '北海道' },
  { id: 'hk_susukino', name: 'すすきの', lat: 43.0553, lng: 141.3536, lines: ['hk_subway_namboku'], prefecture: '北海道' },
  { id: 'hk_nakajima_koen', name: '中島公園', lat: 43.0489, lng: 141.3536, lines: ['hk_subway_namboku'], prefecture: '北海道' },
  { id: 'hk_horohirabashi', name: '幌平橋', lat: 43.0428, lng: 141.3531, lines: ['hk_subway_namboku'], prefecture: '北海道' },
  { id: 'hk_nakanoshima', name: '中の島', lat: 43.0367, lng: 141.3567, lines: ['hk_subway_namboku'], prefecture: '北海道' },
  { id: 'hk_hiragishi', name: '平岸', lat: 43.0303, lng: 141.3672, lines: ['hk_subway_namboku'], prefecture: '北海道' },
  { id: 'hk_minami_hiragishi', name: '南平岸', lat: 43.0233, lng: 141.3717, lines: ['hk_subway_namboku'], prefecture: '北海道' },
  { id: 'hk_sumikawa', name: '澄川', lat: 43.0147, lng: 141.3711, lines: ['hk_subway_namboku'], prefecture: '北海道' },
  { id: 'hk_jieitaimae', name: '自衛隊前', lat: 43.0072, lng: 141.3681, lines: ['hk_subway_namboku'], prefecture: '北海道' },
  { id: 'hk_makomanai', name: '真駒内', lat: 42.9969, lng: 141.3578, lines: ['hk_subway_namboku'], prefecture: '北海道' },

  // ========== 札幌市営地下鉄 東西線 ==========
  { id: 'hk_miyanosawa', name: '宮の沢', lat: 43.0747, lng: 141.2928, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_hassamu_minami', name: '発寒南', lat: 43.0736, lng: 141.3028, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_kotoni', name: '琴似', lat: 43.0742, lng: 141.3133, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_nijuyonken', name: '二十四軒', lat: 43.0711, lng: 141.3222, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_nishi28chome', name: '西28丁目', lat: 43.0639, lng: 141.3267, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_maruyama_koen', name: '円山公園', lat: 43.0536, lng: 141.3292, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_nishi18chome', name: '西18丁目', lat: 43.0583, lng: 141.3381, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_nishi11chome', name: '西11丁目', lat: 43.0594, lng: 141.3464, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  // 大通は共有
  { id: 'hk_bus_center_mae', name: 'バスセンター前', lat: 43.0589, lng: 141.3631, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_kikusui', name: '菊水', lat: 43.0567, lng: 141.3722, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_higashi_sapporo', name: '東札幌', lat: 43.0536, lng: 141.3822, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_shiroishi_subway', name: '白石', lat: 43.0508, lng: 141.3933, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_nango7chome', name: '南郷7丁目', lat: 43.0478, lng: 141.4039, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_nango13chome', name: '南郷13丁目', lat: 43.0444, lng: 141.4147, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_nango18chome', name: '南郷18丁目', lat: 43.0414, lng: 141.4264, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_oyachi', name: '大谷地', lat: 43.0375, lng: 141.4378, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_hibarigaoka', name: 'ひばりが丘', lat: 43.0342, lng: 141.4489, lines: ['hk_subway_tozai'], prefecture: '北海道' },
  { id: 'hk_shin_sapporo', name: '新さっぽろ', lat: 43.0325, lng: 141.4614, lines: ['hk_subway_tozai'], prefecture: '北海道' },

  // ========== 札幌市営地下鉄 東豊線 ==========
  { id: 'hk_sakaemachi', name: '栄町', lat: 43.0947, lng: 141.3731, lines: ['hk_subway_toho'], prefecture: '北海道' },
  { id: 'hk_shindo_higashi', name: '新道東', lat: 43.0886, lng: 141.3694, lines: ['hk_subway_toho'], prefecture: '北海道' },
  { id: 'hk_motomachi', name: '元町', lat: 43.0822, lng: 141.3658, lines: ['hk_subway_toho'], prefecture: '北海道' },
  { id: 'hk_kanjo_dori_higashi', name: '環状通東', lat: 43.0764, lng: 141.3636, lines: ['hk_subway_toho'], prefecture: '北海道' },
  { id: 'hk_higashi_kuyakushomae', name: '東区役所前', lat: 43.0722, lng: 141.3614, lines: ['hk_subway_toho'], prefecture: '北海道' },
  { id: 'hk_kita13jo_higashi', name: '北13条東', lat: 43.0703, lng: 141.3578, lines: ['hk_subway_toho'], prefecture: '北海道' },
  // さっぽろ・大通は共有
  { id: 'hk_hosui_susukino', name: '豊水すすきの', lat: 43.0536, lng: 141.3569, lines: ['hk_subway_toho'], prefecture: '北海道' },
  { id: 'hk_gakuen_mae', name: '学園前', lat: 43.0456, lng: 141.3611, lines: ['hk_subway_toho'], prefecture: '北海道' },
  { id: 'hk_toyohira_koen', name: '豊平公園', lat: 43.0394, lng: 141.3689, lines: ['hk_subway_toho'], prefecture: '北海道' },
  { id: 'hk_misono', name: '美園', lat: 43.0322, lng: 141.3750, lines: ['hk_subway_toho'], prefecture: '北海道' },
  { id: 'hk_tsukisamu_chuo', name: '月寒中央', lat: 43.0247, lng: 141.3831, lines: ['hk_subway_toho'], prefecture: '北海道' },
  { id: 'hk_fukuzumi', name: '福住', lat: 43.0164, lng: 141.3889, lines: ['hk_subway_toho'], prefecture: '北海道' },

  // ========== 札幌市電（ループ線） ==========
  { id: 'hk_susukino_tram', name: 'すすきの', lat: 43.0547, lng: 141.3531, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_shiseikan_shogakkomae', name: '資生館小学校前', lat: 43.0525, lng: 141.3503, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_higashi_honganji_mae', name: '東本願寺前', lat: 43.0500, lng: 141.3486, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_yamanose_9jo', name: '山鼻9条', lat: 43.0469, lng: 141.3472, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_yamanose_19jo', name: '山鼻19条', lat: 43.0364, lng: 141.3458, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_seishu_gakuenmae', name: '静修学園前', lat: 43.0328, lng: 141.3447, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_gyokei_dori', name: '行啓通', lat: 43.0453, lng: 141.3514, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_nakajima_koen_dori', name: '中島公園通', lat: 43.0475, lng: 141.3522, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_konan_shogakkomae', name: '幌南小学校前', lat: 43.0297, lng: 141.3442, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_higashi_tonden_dori', name: '東屯田通', lat: 43.0267, lng: 141.3439, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_nishisen_9jo', name: '西線9条旭山公園通', lat: 43.0483, lng: 141.3397, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_nishisen_11jo', name: '西線11条', lat: 43.0439, lng: 141.3383, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_nishisen_14jo', name: '西線14条', lat: 43.0386, lng: 141.3367, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_nishisen_16jo', name: '西線16条', lat: 43.0344, lng: 141.3356, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_ropeway_iriguchi', name: 'ロープウェイ入口', lat: 43.0308, lng: 141.3344, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_densha_jigyoshomae', name: '電車事業所前', lat: 43.0269, lng: 141.3336, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_chuo_toshokanmae', name: '中央図書館前', lat: 43.0236, lng: 141.3369, lines: ['hk_sapporo_tram'], prefecture: '北海道' },
  { id: 'hk_ishiyama_dori', name: '石山通', lat: 43.0233, lng: 141.3406, lines: ['hk_sapporo_tram'], prefecture: '北海道' },

  // ========== JR函館本線（札幌近郊） ==========
  { id: 'hk_otaru', name: '小樽', lat: 43.1972, lng: 140.9944, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_minami_otaru', name: '南小樽', lat: 43.1897, lng: 141.0053, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_otaru_chikko', name: '小樽築港', lat: 43.1847, lng: 141.0192, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_asari', name: '朝里', lat: 43.1717, lng: 141.0478, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_zenibako', name: '銭函', lat: 43.1583, lng: 141.1047, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_hoshimi', name: 'ほしみ', lat: 43.1278, lng: 141.1561, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_hoshioki', name: '星置', lat: 43.1189, lng: 141.1756, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_inaho', name: '稲穂', lat: 43.1069, lng: 141.2003, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_teine', name: '手稲', lat: 43.1058, lng: 141.2236, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_inazumi_koen', name: '稲積公園', lat: 43.0986, lng: 141.2453, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_hassamu', name: '発寒', lat: 43.0914, lng: 141.2672, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_hassamu_chuo', name: '発寒中央', lat: 43.0872, lng: 141.2836, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_kotoni_jr', name: '琴似', lat: 43.0806, lng: 141.3036, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_soen', name: '桑園', lat: 43.0697, lng: 141.3369, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_sapporo_jr', name: '札幌', lat: 43.0687, lng: 141.3508, lines: ['hk_jr_hakodate', 'hk_jr_chitose'], prefecture: '北海道' },
  { id: 'hk_naebo', name: '苗穂', lat: 43.0669, lng: 141.3672, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_shiroishi_jr', name: '白石', lat: 43.0583, lng: 141.3889, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_atsubetsu', name: '厚別', lat: 43.0453, lng: 141.4311, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_shinrin_koen', name: '森林公園', lat: 43.0417, lng: 141.4472, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_oasa', name: '大麻', lat: 43.0389, lng: 141.4622, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_nopporo', name: '野幌', lat: 43.0467, lng: 141.4886, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_takasago', name: '高砂', lat: 43.0508, lng: 141.5019, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_ebetsu', name: '江別', lat: 43.0539, lng: 141.5211, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_toyohoro', name: '豊幌', lat: 43.0628, lng: 141.5553, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_horomui', name: '幌向', lat: 43.0894, lng: 141.5861, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_kami_horomui', name: '上幌向', lat: 43.1069, lng: 141.6083, lines: ['hk_jr_hakodate'], prefecture: '北海道' },
  { id: 'hk_iwamizawa', name: '岩見沢', lat: 43.1961, lng: 141.7756, lines: ['hk_jr_hakodate'], prefecture: '北海道' },

  // ========== JR千歳線 ==========
  // 札幌は共有
  { id: 'hk_shin_sapporo_jr', name: '新札幌', lat: 43.0322, lng: 141.4619, lines: ['hk_jr_chitose'], prefecture: '北海道' },
  { id: 'hk_kami_nopporo', name: '上野幌', lat: 43.0158, lng: 141.4778, lines: ['hk_jr_chitose'], prefecture: '北海道' },
  { id: 'hk_kita_hiroshima', name: '北広島', lat: 43.0025, lng: 141.5114, lines: ['hk_jr_chitose'], prefecture: '北海道' },
  { id: 'hk_eniwa', name: '恵庭', lat: 42.8803, lng: 141.5797, lines: ['hk_jr_chitose'], prefecture: '北海道' },
  { id: 'hk_chitose', name: '千歳', lat: 42.8236, lng: 141.6500, lines: ['hk_jr_chitose'], prefecture: '北海道' },
  { id: 'hk_minami_chitose', name: '南千歳', lat: 42.7958, lng: 141.6722, lines: ['hk_jr_chitose'], prefecture: '北海道' },
  { id: 'hk_shin_chitose_airport', name: '新千歳空港', lat: 42.7753, lng: 141.6803, lines: ['hk_jr_chitose'], prefecture: '北海道' },
];

// ---------------------------------------------------------------------------
// 路線データ
// ---------------------------------------------------------------------------

const lines: LineData[] = [
  // 札幌市営地下鉄 南北線
  {
    id: 'hk_subway_namboku',
    name: '札幌市営地下鉄南北線',
    company: '札幌市交通局',
    color: '#009944',
    vehicleType: 'subway',
    stationIds: [
      'hk_asabu', 'hk_kita34jo', 'hk_kita24jo', 'hk_kita18jo', 'hk_kita12jo',
      'hk_sapporo', 'hk_odori', 'hk_susukino', 'hk_nakajima_koen',
      'hk_horohirabashi', 'hk_nakanoshima', 'hk_hiragishi', 'hk_minami_hiragishi',
      'hk_sumikawa', 'hk_jieitaimae', 'hk_makomanai',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },

  // 札幌市営地下鉄 東西線
  {
    id: 'hk_subway_tozai',
    name: '札幌市営地下鉄東西線',
    company: '札幌市交通局',
    color: '#009BBF',
    vehicleType: 'subway',
    stationIds: [
      'hk_miyanosawa', 'hk_hassamu_minami', 'hk_kotoni', 'hk_nijuyonken',
      'hk_nishi28chome', 'hk_maruyama_koen', 'hk_nishi18chome', 'hk_nishi11chome',
      'hk_odori', 'hk_bus_center_mae', 'hk_kikusui', 'hk_higashi_sapporo',
      'hk_shiroishi_subway', 'hk_nango7chome', 'hk_nango13chome',
      'hk_nango18chome', 'hk_oyachi', 'hk_hibarigaoka', 'hk_shin_sapporo',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },

  // 札幌市営地下鉄 東豊線
  {
    id: 'hk_subway_toho',
    name: '札幌市営地下鉄東豊線',
    company: '札幌市交通局',
    color: '#0072BC',
    vehicleType: 'subway',
    stationIds: [
      'hk_sakaemachi', 'hk_shindo_higashi', 'hk_motomachi',
      'hk_kanjo_dori_higashi', 'hk_higashi_kuyakushomae', 'hk_kita13jo_higashi',
      'hk_sapporo', 'hk_odori', 'hk_hosui_susukino', 'hk_gakuen_mae',
      'hk_toyohira_koen', 'hk_misono', 'hk_tsukisamu_chuo', 'hk_fukuzumi',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },

  // 札幌市電（ループ線）
  {
    id: 'hk_sapporo_tram',
    name: '札幌市電',
    company: '札幌市交通局',
    color: '#228B22',
    vehicleType: 'tram',
    stationIds: [
      'hk_susukino_tram', 'hk_shiseikan_shogakkomae', 'hk_higashi_honganji_mae',
      'hk_yamanose_9jo', 'hk_gyokei_dori', 'hk_nakajima_koen_dori',
      'hk_yamanose_19jo', 'hk_seishu_gakuenmae', 'hk_konan_shogakkomae',
      'hk_higashi_tonden_dori', 'hk_ishiyama_dori', 'hk_chuo_toshokanmae',
      'hk_densha_jigyoshomae', 'hk_ropeway_iriguchi', 'hk_nishisen_16jo',
      'hk_nishisen_14jo', 'hk_nishisen_11jo', 'hk_nishisen_9jo',
    ],
    isLoop: true,
    avgIntervalMinutes: 7,
  },

  // JR函館本線（札幌近郊）
  {
    id: 'hk_jr_hakodate',
    name: 'JR函館本線',
    company: 'JR北海道',
    color: '#00B261',
    vehicleType: 'train',
    stationIds: [
      'hk_otaru', 'hk_minami_otaru', 'hk_otaru_chikko', 'hk_asari',
      'hk_zenibako', 'hk_hoshimi', 'hk_hoshioki', 'hk_inaho', 'hk_teine',
      'hk_inazumi_koen', 'hk_hassamu', 'hk_hassamu_chuo', 'hk_kotoni_jr',
      'hk_soen', 'hk_sapporo_jr', 'hk_naebo', 'hk_shiroishi_jr',
      'hk_atsubetsu', 'hk_shinrin_koen', 'hk_oasa', 'hk_nopporo',
      'hk_takasago', 'hk_ebetsu', 'hk_toyohoro', 'hk_horomui',
      'hk_kami_horomui', 'hk_iwamizawa',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },

  // JR千歳線
  {
    id: 'hk_jr_chitose',
    name: 'JR千歳線',
    company: 'JR北海道',
    color: '#00B261',
    vehicleType: 'train',
    stationIds: [
      'hk_sapporo_jr', 'hk_shin_sapporo_jr', 'hk_kami_nopporo',
      'hk_kita_hiroshima', 'hk_eniwa', 'hk_chitose', 'hk_minami_chitose',
      'hk_shin_chitose_airport',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },
];

// ---------------------------------------------------------------------------
// エクスポート
// ---------------------------------------------------------------------------

export const hokkaidoData: RegionData = { stations, lines };
