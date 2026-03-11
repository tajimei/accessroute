/**
 * 関東地方 私鉄データ
 *
 * 東急電鉄（東横線、田園都市線、目黒線、大井町線、池上線）
 * 小田急電鉄（小田原線、江ノ島線、多摩線）
 * 京王電鉄（京王線、井の頭線、相模原線）
 * 西武鉄道、東武鉄道、京急電鉄、京成電鉄、
 * 相模鉄道（本線、いずみ野線）
 *
 * 駅IDプレフィックス: kt_（kanto_jr.ts と共通名前空間）
 * JR路線と共有する駅は同一IDを使用
 */

import { StationData, LineData, RegionData } from '../types';

// ============================================================
// 駅データ（全路線共通・重複統合済み）
// ============================================================

const stations: StationData[] = [
  // --------------------------------------------------------
  // 東急東横線
  // --------------------------------------------------------
  { id: 'kt_shibuya', name: '渋谷', lat: 35.6580, lng: 139.7016, lines: ['tokyu_toyoko', 'tokyu_dento', 'keio_inokashira'], prefecture: '東京都' },
  { id: 'kt_daikanyama', name: '代官山', lat: 35.6487, lng: 139.7030, lines: ['tokyu_toyoko'], prefecture: '東京都' },
  { id: 'kt_nakameguro', name: '中目黒', lat: 35.6441, lng: 139.6987, lines: ['tokyu_toyoko'], prefecture: '東京都' },
  { id: 'kt_yutenji', name: '祐天寺', lat: 35.6367, lng: 139.6919, lines: ['tokyu_toyoko'], prefecture: '東京都' },
  { id: 'kt_gakugeidaigaku', name: '学芸大学', lat: 35.6285, lng: 139.6852, lines: ['tokyu_toyoko'], prefecture: '東京都' },
  { id: 'kt_toritsudaigaku', name: '都立大学', lat: 35.6202, lng: 139.6791, lines: ['tokyu_toyoko'], prefecture: '東京都' },
  { id: 'kt_jiyugaoka', name: '自由が丘', lat: 35.6076, lng: 139.6688, lines: ['tokyu_toyoko', 'tokyu_oimachi'], prefecture: '東京都' },
  { id: 'kt_denenchofu', name: '田園調布', lat: 35.5976, lng: 139.6693, lines: ['tokyu_toyoko', 'tokyu_meguro'], prefecture: '東京都' },
  { id: 'kt_tamagawa', name: '多摩川', lat: 35.5899, lng: 139.6682, lines: ['tokyu_toyoko', 'tokyu_meguro'], prefecture: '東京都' },
  { id: 'kt_shinmaruko', name: '新丸子', lat: 35.5842, lng: 139.6594, lines: ['tokyu_toyoko', 'tokyu_meguro'], prefecture: '神奈川県' },
  { id: 'kt_musashi_kosugi', name: '武蔵小杉', lat: 35.5764, lng: 139.6596, lines: ['tokyu_toyoko', 'tokyu_meguro'], prefecture: '神奈川県' },
  { id: 'kt_motosumiyoshi', name: '元住吉', lat: 35.5688, lng: 139.6546, lines: ['tokyu_toyoko', 'tokyu_meguro'], prefecture: '神奈川県' },
  { id: 'kt_hiyoshi', name: '日吉', lat: 35.5536, lng: 139.6468, lines: ['tokyu_toyoko', 'tokyu_meguro'], prefecture: '神奈川県' },
  { id: 'kt_tsunashima', name: '綱島', lat: 35.5414, lng: 139.6352, lines: ['tokyu_toyoko'], prefecture: '神奈川県' },
  { id: 'kt_okurayama', name: '大倉山', lat: 35.5320, lng: 139.6303, lines: ['tokyu_toyoko'], prefecture: '神奈川県' },
  { id: 'kt_kikuna', name: '菊名', lat: 35.5101, lng: 139.6310, lines: ['tokyu_toyoko'], prefecture: '神奈川県' },
  { id: 'kt_myorenji', name: '妙蓮寺', lat: 35.5025, lng: 139.6301, lines: ['tokyu_toyoko'], prefecture: '神奈川県' },
  { id: 'kt_hakuraku', name: '白楽', lat: 35.4940, lng: 139.6312, lines: ['tokyu_toyoko'], prefecture: '神奈川県' },
  { id: 'kt_higashihakuraku', name: '東白楽', lat: 35.4878, lng: 139.6310, lines: ['tokyu_toyoko'], prefecture: '神奈川県' },
  { id: 'kt_tammachi', name: '反町', lat: 35.4759, lng: 139.6275, lines: ['tokyu_toyoko'], prefecture: '神奈川県' },
  { id: 'kt_yokohama', name: '横浜', lat: 35.4660, lng: 139.6223, lines: ['tokyu_toyoko', 'keikyu_main', 'sotetsu_main'], prefecture: '神奈川県' },

  // --------------------------------------------------------
  // 東急田園都市線（渋谷は定義済み）
  // --------------------------------------------------------
  { id: 'kt_ikejiriohashi', name: '池尻大橋', lat: 35.6508, lng: 139.6846, lines: ['tokyu_dento'], prefecture: '東京都' },
  { id: 'kt_sangenjaya', name: '三軒茶屋', lat: 35.6436, lng: 139.6708, lines: ['tokyu_dento'], prefecture: '東京都' },
  { id: 'kt_komazawadaigaku', name: '駒沢大学', lat: 35.6345, lng: 139.6612, lines: ['tokyu_dento'], prefecture: '東京都' },
  { id: 'kt_sakurashinmachi', name: '桜新町', lat: 35.6280, lng: 139.6462, lines: ['tokyu_dento'], prefecture: '東京都' },
  { id: 'kt_yoga', name: '用賀', lat: 35.6266, lng: 139.6338, lines: ['tokyu_dento'], prefecture: '東京都' },
  { id: 'kt_futakotamagawa', name: '二子玉川', lat: 35.6115, lng: 139.6264, lines: ['tokyu_dento', 'tokyu_oimachi'], prefecture: '東京都' },
  { id: 'kt_mizonokuchi', name: '溝の口', lat: 35.6006, lng: 139.6105, lines: ['tokyu_dento', 'tokyu_oimachi'], prefecture: '神奈川県' },
  { id: 'kt_saginuma', name: '鷺沼', lat: 35.5787, lng: 139.5864, lines: ['tokyu_dento'], prefecture: '神奈川県' },
  { id: 'kt_tamaplaza', name: 'たまプラーザ', lat: 35.5714, lng: 139.5580, lines: ['tokyu_dento'], prefecture: '神奈川県' },
  { id: 'kt_azamino', name: 'あざみ野', lat: 35.5684, lng: 139.5534, lines: ['tokyu_dento'], prefecture: '神奈川県' },
  { id: 'kt_aobadai', name: '青葉台', lat: 35.5455, lng: 139.5172, lines: ['tokyu_dento'], prefecture: '神奈川県' },
  { id: 'kt_nagatsuta', name: '長津田', lat: 35.5316, lng: 139.4940, lines: ['tokyu_dento'], prefecture: '神奈川県' },
  { id: 'kt_chuorinkan', name: '中央林間', lat: 35.5087, lng: 139.4446, lines: ['tokyu_dento', 'odakyu_enoshima'], prefecture: '神奈川県' },

  // --------------------------------------------------------
  // 東急目黒線（田園調布〜日吉は定義済み）
  // --------------------------------------------------------
  { id: 'kt_meguro', name: '目黒', lat: 35.6340, lng: 139.7158, lines: ['tokyu_meguro'], prefecture: '東京都' },
  { id: 'kt_fudomae', name: '不動前', lat: 35.6282, lng: 139.7124, lines: ['tokyu_meguro'], prefecture: '東京都' },
  { id: 'kt_musashikoyama', name: '武蔵小山', lat: 35.6224, lng: 139.7044, lines: ['tokyu_meguro'], prefecture: '東京都' },
  { id: 'kt_nishikoyama', name: '西小山', lat: 35.6168, lng: 139.6986, lines: ['tokyu_meguro'], prefecture: '東京都' },
  { id: 'kt_senzoku', name: '洗足', lat: 35.6098, lng: 139.6923, lines: ['tokyu_meguro'], prefecture: '東京都' },
  { id: 'kt_ookayama', name: '大岡山', lat: 35.6073, lng: 139.6856, lines: ['tokyu_meguro', 'tokyu_oimachi'], prefecture: '東京都' },
  { id: 'kt_okusawa', name: '奥沢', lat: 35.6036, lng: 139.6772, lines: ['tokyu_meguro'], prefecture: '東京都' },
  // 田園調布・多摩川・新丸子・武蔵小杉・元住吉・日吉は東横線で定義済み

  // --------------------------------------------------------
  // 小田急小田原線
  // --------------------------------------------------------
  { id: 'kt_shinjuku', name: '新宿', lat: 35.6896, lng: 139.7006, lines: ['odakyu_odawara', 'keio_main'], prefecture: '東京都' },
  { id: 'kt_yoyogiuehara', name: '代々木上原', lat: 35.6686, lng: 139.6792, lines: ['odakyu_odawara'], prefecture: '東京都' },
  { id: 'kt_shimokitazawa', name: '下北沢', lat: 35.6614, lng: 139.6679, lines: ['odakyu_odawara', 'keio_inokashira'], prefecture: '東京都' },
  { id: 'kt_kyodo', name: '経堂', lat: 35.6464, lng: 139.6364, lines: ['odakyu_odawara'], prefecture: '東京都' },
  { id: 'kt_seijogakuenmae', name: '成城学園前', lat: 35.6380, lng: 139.6044, lines: ['odakyu_odawara'], prefecture: '東京都' },
  { id: 'kt_noborito', name: '登戸', lat: 35.6308, lng: 139.5703, lines: ['odakyu_odawara'], prefecture: '神奈川県' },
  { id: 'kt_mukogaokayuen', name: '向ヶ丘遊園', lat: 35.6302, lng: 139.5637, lines: ['odakyu_odawara'], prefecture: '神奈川県' },
  { id: 'kt_shinyurigaoka', name: '新百合ヶ丘', lat: 35.6038, lng: 139.5084, lines: ['odakyu_odawara', 'odakyu_tama'], prefecture: '神奈川県' },
  { id: 'kt_machida', name: '町田', lat: 35.5424, lng: 139.4456, lines: ['odakyu_odawara'], prefecture: '東京都' },
  { id: 'kt_sagamiono', name: '相模大野', lat: 35.5303, lng: 139.4381, lines: ['odakyu_odawara', 'odakyu_enoshima'], prefecture: '神奈川県' },
  { id: 'kt_ebina', name: '海老名', lat: 35.4461, lng: 139.3910, lines: ['odakyu_odawara', 'sotetsu_main'], prefecture: '神奈川県' },
  { id: 'kt_honatsugi', name: '本厚木', lat: 35.4392, lng: 139.3652, lines: ['odakyu_odawara'], prefecture: '神奈川県' },
  { id: 'kt_odawara', name: '小田原', lat: 35.2564, lng: 139.1553, lines: ['odakyu_odawara'], prefecture: '神奈川県' },

  // --------------------------------------------------------
  // 京王線（新宿は定義済み）
  // --------------------------------------------------------
  { id: 'kt_sasazuka', name: '笹塚', lat: 35.6741, lng: 139.6672, lines: ['keio_main'], prefecture: '東京都' },
  { id: 'kt_meidaimae', name: '明大前', lat: 35.6688, lng: 139.6506, lines: ['keio_main', 'keio_inokashira'], prefecture: '東京都' },
  { id: 'kt_chitosekarasuyama', name: '千歳烏山', lat: 35.6680, lng: 139.6013, lines: ['keio_main'], prefecture: '東京都' },
  { id: 'kt_chofu', name: '調布', lat: 35.6519, lng: 139.5417, lines: ['keio_main', 'keio_sagamihara'], prefecture: '東京都' },
  { id: 'kt_fuchu', name: '府中', lat: 35.6716, lng: 139.4798, lines: ['keio_main'], prefecture: '東京都' },
  { id: 'kt_seisekisakuragaoka', name: '聖蹟桜ヶ丘', lat: 35.6506, lng: 139.4460, lines: ['keio_main'], prefecture: '東京都' },
  { id: 'kt_takahatabudo', name: '高幡不動', lat: 35.6602, lng: 139.4078, lines: ['keio_main'], prefecture: '東京都' },
  { id: 'kt_kitano', name: '北野', lat: 35.6557, lng: 139.3457, lines: ['keio_main'], prefecture: '東京都' },
  { id: 'kt_keiohachioji', name: '京王八王子', lat: 35.6572, lng: 139.3389, lines: ['keio_main'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 京王井の頭線（渋谷・下北沢・明大前は定義済み）
  // --------------------------------------------------------
  { id: 'kt_komabatodaimae', name: '駒場東大前', lat: 35.6596, lng: 139.6850, lines: ['keio_inokashira'], prefecture: '東京都' },
  { id: 'kt_eifukucho', name: '永福町', lat: 35.6675, lng: 139.6384, lines: ['keio_inokashira'], prefecture: '東京都' },
  { id: 'kt_kugayama', name: '久我山', lat: 35.6866, lng: 139.6062, lines: ['keio_inokashira'], prefecture: '東京都' },
  { id: 'kt_kichijoji', name: '吉祥寺', lat: 35.7024, lng: 139.5796, lines: ['keio_inokashira'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 西武池袋線
  // --------------------------------------------------------
  { id: 'kt_ikebukuro', name: '池袋', lat: 35.7295, lng: 139.7109, lines: ['seibu_ikebukuro', 'tobu_tojo'], prefecture: '東京都' },
  { id: 'kt_nerima', name: '練馬', lat: 35.7379, lng: 139.6536, lines: ['seibu_ikebukuro'], prefecture: '東京都' },
  { id: 'kt_shakujiikoen', name: '石神井公園', lat: 35.7432, lng: 139.6097, lines: ['seibu_ikebukuro'], prefecture: '東京都' },
  { id: 'kt_hibarigaoka', name: 'ひばりヶ丘', lat: 35.7497, lng: 139.5471, lines: ['seibu_ikebukuro'], prefecture: '東京都' },
  { id: 'kt_tokorozawa', name: '所沢', lat: 35.7718, lng: 139.4669, lines: ['seibu_ikebukuro', 'seibu_shinjuku'], prefecture: '埼玉県' },
  { id: 'kt_kotesashi', name: '小手指', lat: 35.7869, lng: 139.4343, lines: ['seibu_ikebukuro'], prefecture: '埼玉県' },
  { id: 'kt_irumashi', name: '入間市', lat: 35.7862, lng: 139.3909, lines: ['seibu_ikebukuro'], prefecture: '埼玉県' },
  { id: 'kt_hanno', name: '飯能', lat: 35.8565, lng: 139.3286, lines: ['seibu_ikebukuro'], prefecture: '埼玉県' },

  // --------------------------------------------------------
  // 西武新宿線（所沢は定義済み）
  // --------------------------------------------------------
  { id: 'kt_seibu_shinjuku', name: '西武新宿', lat: 35.6943, lng: 139.7003, lines: ['seibu_shinjuku'], prefecture: '東京都' },
  { id: 'kt_takadanobaba', name: '高田馬場', lat: 35.7127, lng: 139.7038, lines: ['seibu_shinjuku', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_saginomiya', name: '鷺ノ宮', lat: 35.7233, lng: 139.6407, lines: ['seibu_shinjuku'], prefecture: '東京都' },
  { id: 'kt_kamiishigami', name: '上石神井', lat: 35.7289, lng: 139.5952, lines: ['seibu_shinjuku'], prefecture: '東京都' },
  { id: 'kt_tanashi', name: '田無', lat: 35.7265, lng: 139.5440, lines: ['seibu_shinjuku'], prefecture: '東京都' },
  { id: 'kt_kodaira', name: '小平', lat: 35.7285, lng: 139.4906, lines: ['seibu_shinjuku'], prefecture: '東京都' },
  { id: 'kt_higashimurayama', name: '東村山', lat: 35.7636, lng: 139.4684, lines: ['seibu_shinjuku'], prefecture: '東京都' },
  // 所沢はkt_tokorozawaで定義済み
  { id: 'kt_shintokorozawa', name: '新所沢', lat: 35.8001, lng: 139.4568, lines: ['seibu_shinjuku'], prefecture: '埼玉県' },

  // --------------------------------------------------------
  // 東武東上線（池袋は定義済み）
  // --------------------------------------------------------
  { id: 'kt_oyama', name: '大山', lat: 35.7502, lng: 139.7065, lines: ['tobu_tojo'], prefecture: '東京都' },
  { id: 'kt_narimasu', name: '成増', lat: 35.7784, lng: 139.6345, lines: ['tobu_tojo'], prefecture: '東京都' },
  { id: 'kt_wakoshi', name: '和光市', lat: 35.7875, lng: 139.6122, lines: ['tobu_tojo'], prefecture: '埼玉県' },
  { id: 'kt_asakadai', name: '朝霞台', lat: 35.8063, lng: 139.5831, lines: ['tobu_tojo'], prefecture: '埼玉県' },
  { id: 'kt_shiki', name: '志木', lat: 35.8185, lng: 139.5752, lines: ['tobu_tojo'], prefecture: '埼玉県' },
  { id: 'kt_fujimino', name: 'ふじみ野', lat: 35.8470, lng: 139.5286, lines: ['tobu_tojo'], prefecture: '埼玉県' },
  { id: 'kt_kawagoe', name: '川越', lat: 35.9078, lng: 139.4832, lines: ['tobu_tojo'], prefecture: '埼玉県' },
  { id: 'kt_kawagoeshi', name: '川越市', lat: 35.9103, lng: 139.4784, lines: ['tobu_tojo'], prefecture: '埼玉県' },
  { id: 'kt_sakado', name: '坂戸', lat: 35.9573, lng: 139.3986, lines: ['tobu_tojo'], prefecture: '埼玉県' },
  { id: 'kt_higashimatsuyama', name: '東松山', lat: 36.0310, lng: 139.3990, lines: ['tobu_tojo'], prefecture: '埼玉県' },

  // --------------------------------------------------------
  // 東武スカイツリーライン
  // --------------------------------------------------------
  { id: 'kt_asakusa', name: '浅草', lat: 35.7108, lng: 139.7988, lines: ['tobu_skytree'], prefecture: '東京都' },
  { id: 'kt_tokyo_skytree', name: 'とうきょうスカイツリー', lat: 35.7101, lng: 139.8107, lines: ['tobu_skytree'], prefecture: '東京都' },
  { id: 'kt_oshiage', name: '押上', lat: 35.7109, lng: 139.8132, lines: ['tobu_skytree', 'keisei_oshiage'], prefecture: '東京都' },
  { id: 'kt_kita_senju', name: '北千住', lat: 35.7497, lng: 139.8049, lines: ['tobu_skytree'], prefecture: '東京都' },
  { id: 'kt_nishiarai', name: '西新井', lat: 35.7755, lng: 139.7887, lines: ['tobu_skytree'], prefecture: '東京都' },
  { id: 'kt_takenotsuka', name: '竹ノ塚', lat: 35.7943, lng: 139.7914, lines: ['tobu_skytree'], prefecture: '東京都' },
  { id: 'kt_soka', name: '草加', lat: 35.8265, lng: 139.8058, lines: ['tobu_skytree'], prefecture: '埼玉県' },
  { id: 'kt_shinkoshigaya', name: '新越谷', lat: 35.8706, lng: 139.7903, lines: ['tobu_skytree'], prefecture: '埼玉県' },
  { id: 'kt_koshigaya', name: '越谷', lat: 35.8832, lng: 139.7908, lines: ['tobu_skytree'], prefecture: '埼玉県' },
  { id: 'kt_sengendai', name: 'せんげん台', lat: 35.9193, lng: 139.7931, lines: ['tobu_skytree'], prefecture: '埼玉県' },
  { id: 'kt_kasukabe', name: '春日部', lat: 35.9757, lng: 139.7524, lines: ['tobu_skytree', 'tobu_noda'], prefecture: '埼玉県' },
  { id: 'kt_tobu_dobutsukoen', name: '東武動物公園', lat: 36.0220, lng: 139.7083, lines: ['tobu_skytree'], prefecture: '埼玉県' },

  // --------------------------------------------------------
  // 京急本線（横浜は定義済み）
  // --------------------------------------------------------
  { id: 'kt_sengakuji', name: '泉岳寺', lat: 35.6381, lng: 139.7399, lines: ['keikyu_main'], prefecture: '東京都' },
  { id: 'kt_shinagawa', name: '品川', lat: 35.6285, lng: 139.7388, lines: ['keikyu_main', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_keikyu_kamata', name: '京急蒲田', lat: 35.5622, lng: 139.7240, lines: ['keikyu_main', 'keikyu_airport'], prefecture: '東京都' },
  { id: 'kt_keikyu_kawasaki', name: '京急川崎', lat: 35.5313, lng: 139.6990, lines: ['keikyu_main'], prefecture: '神奈川県' },
  // 横浜はkt_yokohamaで定義済み
  { id: 'kt_kamiooka', name: '上大岡', lat: 35.4021, lng: 139.5960, lines: ['keikyu_main'], prefecture: '神奈川県' },
  { id: 'kt_kanazawabunko', name: '金沢文庫', lat: 35.3399, lng: 139.6174, lines: ['keikyu_main'], prefecture: '神奈川県' },
  { id: 'kt_kanazawahakkei', name: '金沢八景', lat: 35.3331, lng: 139.6210, lines: ['keikyu_main'], prefecture: '神奈川県' },
  { id: 'kt_yokosukachuo', name: '横須賀中央', lat: 35.2780, lng: 139.6702, lines: ['keikyu_main'], prefecture: '神奈川県' },
  { id: 'kt_horinouchi', name: '堀ノ内', lat: 35.2535, lng: 139.6760, lines: ['keikyu_main'], prefecture: '神奈川県' },
  { id: 'kt_uraga', name: '浦賀', lat: 35.2500, lng: 139.7116, lines: ['keikyu_main'], prefecture: '神奈川県' },

  // --------------------------------------------------------
  // 京急空港線（京急蒲田は定義済み）
  // --------------------------------------------------------
  { id: 'kt_kojiya', name: '糀谷', lat: 35.5570, lng: 139.7273, lines: ['keikyu_airport'], prefecture: '東京都' },
  { id: 'kt_otorii', name: '大鳥居', lat: 35.5530, lng: 139.7332, lines: ['keikyu_airport'], prefecture: '東京都' },
  { id: 'kt_anamoriinari', name: '穴守稲荷', lat: 35.5500, lng: 139.7418, lines: ['keikyu_airport'], prefecture: '東京都' },
  { id: 'kt_tenkubashi', name: '天空橋', lat: 35.5480, lng: 139.7494, lines: ['keikyu_airport'], prefecture: '東京都' },
  { id: 'kt_haneda_t3', name: '羽田空港第3ターミナル', lat: 35.5494, lng: 139.7798, lines: ['keikyu_airport'], prefecture: '東京都' },
  { id: 'kt_haneda_t1t2', name: '羽田空港第1・第2ターミナル', lat: 35.5432, lng: 139.7670, lines: ['keikyu_airport'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 京成本線
  // --------------------------------------------------------
  { id: 'kt_keisei_ueno', name: '京成上野', lat: 35.7144, lng: 139.7741, lines: ['keisei_main'], prefecture: '東京都' },
  { id: 'kt_nippori', name: '日暮里', lat: 35.7280, lng: 139.7710, lines: ['keisei_main'], prefecture: '東京都' },
  { id: 'kt_aoto', name: '青砥', lat: 35.7448, lng: 139.8505, lines: ['keisei_main', 'keisei_oshiage'], prefecture: '東京都' },
  { id: 'kt_keisei_takasago', name: '京成高砂', lat: 35.7532, lng: 139.8680, lines: ['keisei_main', 'keisei_sky'], prefecture: '東京都' },
  { id: 'kt_keisei_funabashi', name: '京成船橋', lat: 35.7010, lng: 139.9849, lines: ['keisei_main'], prefecture: '千葉県' },
  { id: 'kt_keisei_tsudanuma', name: '京成津田沼', lat: 35.6839, lng: 140.0253, lines: ['keisei_main'], prefecture: '千葉県' },
  { id: 'kt_keisei_sakura', name: '京成佐倉', lat: 35.7237, lng: 140.2178, lines: ['keisei_main'], prefecture: '千葉県' },
  { id: 'kt_keisei_narita', name: '京成成田', lat: 35.7748, lng: 140.3181, lines: ['keisei_main'], prefecture: '千葉県' },
  { id: 'kt_airport2bldg', name: '空港第2ビル', lat: 35.7699, lng: 140.3861, lines: ['keisei_main', 'keisei_sky'], prefecture: '千葉県' },
  { id: 'kt_narita_airport', name: '成田空港', lat: 35.7647, lng: 140.3864, lines: ['keisei_main', 'keisei_sky'], prefecture: '千葉県' },

  // --------------------------------------------------------
  // 京成スカイアクセス（京成高砂・空港第2ビル・成田空港は定義済み）
  // --------------------------------------------------------
  { id: 'kt_higashimatsudo', name: '東松戸', lat: 35.7669, lng: 139.9118, lines: ['keisei_sky'], prefecture: '千葉県' },
  { id: 'kt_shinkamagaya', name: '新鎌ヶ谷', lat: 35.7911, lng: 139.9506, lines: ['keisei_sky'], prefecture: '千葉県' },
  { id: 'kt_chibant_chuo', name: '千葉ニュータウン中央', lat: 35.7918, lng: 140.1063, lines: ['keisei_sky'], prefecture: '千葉県' },
  { id: 'kt_inba_nihon_idai', name: '印旛日本医大', lat: 35.7937, lng: 140.1636, lines: ['keisei_sky'], prefecture: '千葉県' },
  { id: 'kt_narita_yukawa', name: '成田湯川', lat: 35.7956, lng: 140.2880, lines: ['keisei_sky'], prefecture: '千葉県' },

  // --------------------------------------------------------
  // 京成押上線（青砥→押上）
  // --------------------------------------------------------
  // 青砥はkt_aotoで定義済み
  { id: 'kt_keisei_tateishi', name: '京成立石', lat: 35.7396, lng: 139.8379, lines: ['keisei_oshiage'], prefecture: '東京都' },
  { id: 'kt_keisei_yotsugi', name: '四ツ木', lat: 35.7334, lng: 139.8254, lines: ['keisei_oshiage'], prefecture: '東京都' },
  // 押上はkt_oshiageで定義済み

  // --------------------------------------------------------
  // 東武アーバンパークライン（野田線）主要駅
  // --------------------------------------------------------
  // 大宮はkt_omiyaで定義済み
  { id: 'kt_iwatsuki', name: '岩槻', lat: 35.9500, lng: 139.6938, lines: ['tobu_noda'], prefecture: '埼玉県' },
  // 春日部はkt_kasukabeで定義済み（tobu_skytreeと共有）
  // 流山おおたかの森はkt_nagareyama_otakanomoriで定義済み（txと共有）
  // 柏はkt_kashiwaで定義済み（jr_jobanと共有）
  // 船橋はkt_funabashiで定義済み（jr_sobu_localと共有）

  // --------------------------------------------------------
  // 相鉄本線（横浜・海老名は定義済み）
  // --------------------------------------------------------
  { id: 'kt_hoshikawa', name: '星川', lat: 35.4633, lng: 139.5956, lines: ['sotetsu_main'], prefecture: '神奈川県' },
  { id: 'kt_nishiya', name: '西谷', lat: 35.4676, lng: 139.5622, lines: ['sotetsu_main'], prefecture: '神奈川県' },
  { id: 'kt_futamatagawa', name: '二俣川', lat: 35.4621, lng: 139.5333, lines: ['sotetsu_main', 'sotetsu_izumino'], prefecture: '神奈川県' },
  { id: 'kt_yamato', name: '大和', lat: 35.4676, lng: 139.4608, lines: ['sotetsu_main', 'odakyu_enoshima'], prefecture: '神奈川県' },
  // 海老名はkt_ebinaで定義済み

  // --------------------------------------------------------
  // 東急大井町線（重複しない駅）
  // --------------------------------------------------------
  // 大井町はkt_oimachiでkanto_jr.ts定義済み（JR京浜東北線・りんかい線と共有）
  { id: 'kt_hatanodai', name: '旗の台', lat: 35.6054, lng: 139.7033, lines: ['tokyu_oimachi', 'tokyu_ikegami'], prefecture: '東京都' },
  // 大岡山はkt_ookayamaで定義済み（東急目黒線）
  // 自由が丘はkt_jiyugaokaで定義済み（東急東横線）
  // 二子玉川はkt_futakotamagawaで定義済み（東急田園都市線）
  // 溝の口はkt_mizonokuchiで定義済み（東急田園都市線）

  // --------------------------------------------------------
  // 東急池上線（重複しない駅）
  // --------------------------------------------------------
  // 五反田はkt_gotandaでkanto_metro.ts定義済み（都営浅草線・JR山手線と共有）
  { id: 'kt_togoshiginza', name: '戸越銀座', lat: 35.6148, lng: 139.7153, lines: ['tokyu_ikegami'], prefecture: '東京都' },
  // 旗の台はkt_hatanodaiで定義済み（東急大井町線と共有）
  { id: 'kt_yukigayaotsuka', name: '雪が谷大塚', lat: 35.5958, lng: 139.6816, lines: ['tokyu_ikegami'], prefecture: '東京都' },
  // 蒲田はkt_kamataでkanto_jr.ts定義済み（JR京浜東北線と共有）

  // --------------------------------------------------------
  // 小田急江ノ島線（重複しない駅）
  // --------------------------------------------------------
  // 相模大野はkt_sagamionoで定義済み
  // 中央林間はkt_chuorinkanで定義済み（東急田園都市線と共有）
  // 大和はkt_yamatoで定義済み（相鉄本線と共有）
  // 藤沢はkt_fujisawaでkanto_jr.ts定義済み（JR東海道線と共有）
  { id: 'kt_kataseenoshima', name: '片瀬江ノ島', lat: 35.3091, lng: 139.4817, lines: ['odakyu_enoshima'], prefecture: '神奈川県' },

  // --------------------------------------------------------
  // 小田急多摩線（重複しない駅）
  // --------------------------------------------------------
  // 新百合ヶ丘はkt_shinyurigaokaで定義済み
  { id: 'kt_kurihira', name: '栗平', lat: 35.6037, lng: 139.4775, lines: ['odakyu_tama'], prefecture: '神奈川県' },
  { id: 'kt_odakyu_nagayama', name: '小田急永山', lat: 35.6274, lng: 139.4501, lines: ['odakyu_tama'], prefecture: '東京都' },
  { id: 'kt_odakyu_tama_center', name: '小田急多摩センター', lat: 35.6241, lng: 139.4248, lines: ['odakyu_tama'], prefecture: '東京都' },
  { id: 'kt_karakida', name: '唐木田', lat: 35.6193, lng: 139.4085, lines: ['odakyu_tama'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 京王相模原線（重複しない駅）
  // --------------------------------------------------------
  // 調布はkt_chofuで定義済み
  { id: 'kt_keio_inagi', name: '京王稲田堤', lat: 35.6367, lng: 139.5186, lines: ['keio_sagamihara'], prefecture: '神奈川県' },
  { id: 'kt_keio_nagayama', name: '京王永山', lat: 35.6275, lng: 139.4493, lines: ['keio_sagamihara'], prefecture: '東京都' },
  { id: 'kt_keio_tama_center', name: '京王多摩センター', lat: 35.6244, lng: 139.4246, lines: ['keio_sagamihara'], prefecture: '東京都' },
  { id: 'kt_minami_osawa', name: '南大沢', lat: 35.6113, lng: 139.3791, lines: ['keio_sagamihara'], prefecture: '東京都' },
  // 橋本はkt_hashimotoでkanto_jr.ts定義済み（JR横浜線・相模線と共有）

  // --------------------------------------------------------
  // 相鉄いずみ野線（重複しない駅）
  // --------------------------------------------------------
  // 二俣川はkt_futamatagawaで定義済み
  { id: 'kt_izumino', name: 'いずみ野', lat: 35.4364, lng: 139.5002, lines: ['sotetsu_izumino'], prefecture: '神奈川県' },
  { id: 'kt_izumichuo', name: 'いずみ中央', lat: 35.4157, lng: 139.4848, lines: ['sotetsu_izumino'], prefecture: '神奈川県' },
  // 湘南台はkt_shonandaiでkanto_jr.ts定義済み（横浜市営ブルーラインと共有）
];

// ============================================================
// 路線データ
// ============================================================

const lines: LineData[] = [
  // --------------------------------------------------------
  // 東急電鉄
  // --------------------------------------------------------
  {
    id: 'tokyu_toyoko',
    name: '東急東横線',
    company: '東急電鉄',
    color: '#DA0442',
    vehicleType: 'train',
    stationIds: [
      'kt_shibuya', 'kt_daikanyama', 'kt_nakameguro', 'kt_yutenji',
      'kt_gakugeidaigaku', 'kt_toritsudaigaku', 'kt_jiyugaoka',
      'kt_denenchofu', 'kt_tamagawa', 'kt_shinmaruko', 'kt_musashi_kosugi',
      'kt_motosumiyoshi', 'kt_hiyoshi', 'kt_tsunashima', 'kt_okurayama',
      'kt_kikuna', 'kt_myorenji', 'kt_hakuraku', 'kt_higashihakuraku',
      'kt_tammachi', 'kt_yokohama',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },
  {
    id: 'tokyu_dento',
    name: '東急田園都市線',
    company: '東急電鉄',
    color: '#00A54F',
    vehicleType: 'train',
    stationIds: [
      'kt_shibuya', 'kt_ikejiriohashi', 'kt_sangenjaya',
      'kt_komazawadaigaku', 'kt_sakurashinmachi', 'kt_yoga',
      'kt_futakotamagawa', 'kt_mizonokuchi', 'kt_saginuma',
      'kt_tamaplaza', 'kt_azamino', 'kt_aobadai', 'kt_nagatsuta',
      'kt_chuorinkan',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },
  {
    id: 'tokyu_meguro',
    name: '東急目黒線',
    company: '東急電鉄',
    color: '#009CD2',
    vehicleType: 'train',
    stationIds: [
      'kt_meguro', 'kt_fudomae', 'kt_musashikoyama', 'kt_nishikoyama',
      'kt_senzoku', 'kt_ookayama', 'kt_okusawa', 'kt_denenchofu', 'kt_tamagawa',
      'kt_shinmaruko', 'kt_musashi_kosugi', 'kt_motosumiyoshi', 'kt_hiyoshi',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },

  {
    id: 'tokyu_oimachi',
    name: '東急大井町線',
    company: '東急電鉄',
    color: '#F18C43',
    vehicleType: 'train',
    stationIds: [
      'kt_oimachi', 'kt_hatanodai', 'kt_ookayama', 'kt_jiyugaoka',
      'kt_futakotamagawa', 'kt_mizonokuchi',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },
  {
    id: 'tokyu_ikegami',
    name: '東急池上線',
    company: '東急電鉄',
    color: '#EE86A7',
    vehicleType: 'train',
    stationIds: [
      'kt_gotanda', 'kt_togoshiginza', 'kt_hatanodai',
      'kt_yukigayaotsuka', 'kt_kamata',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },

  // --------------------------------------------------------
  // 小田急電鉄
  // --------------------------------------------------------
  {
    id: 'odakyu_odawara',
    name: '小田急小田原線',
    company: '小田急電鉄',
    color: '#0078C9',
    vehicleType: 'train',
    stationIds: [
      'kt_shinjuku', 'kt_yoyogiuehara', 'kt_shimokitazawa', 'kt_kyodo',
      'kt_seijogakuenmae', 'kt_noborito', 'kt_mukogaokayuen',
      'kt_shinyurigaoka', 'kt_machida', 'kt_sagamiono', 'kt_ebina',
      'kt_honatsugi', 'kt_odawara',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },

  {
    id: 'odakyu_enoshima',
    name: '小田急江ノ島線',
    company: '小田急電鉄',
    color: '#0078C9',
    vehicleType: 'train',
    stationIds: [
      'kt_sagamiono', 'kt_chuorinkan', 'kt_yamato',
      'kt_fujisawa', 'kt_kataseenoshima',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },
  {
    id: 'odakyu_tama',
    name: '小田急多摩線',
    company: '小田急電鉄',
    color: '#0078C9',
    vehicleType: 'train',
    stationIds: [
      'kt_shinyurigaoka', 'kt_kurihira', 'kt_odakyu_nagayama',
      'kt_odakyu_tama_center', 'kt_karakida',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },

  // --------------------------------------------------------
  // 京王電鉄
  // --------------------------------------------------------
  {
    id: 'keio_main',
    name: '京王線',
    company: '京王電鉄',
    color: '#DD0077',
    vehicleType: 'train',
    stationIds: [
      'kt_shinjuku', 'kt_sasazuka', 'kt_meidaimae', 'kt_chitosekarasuyama',
      'kt_chofu', 'kt_fuchu', 'kt_seisekisakuragaoka', 'kt_takahatabudo',
      'kt_kitano', 'kt_keiohachioji',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },
  {
    id: 'keio_inokashira',
    name: '京王井の頭線',
    company: '京王電鉄',
    color: '#DD0077',
    vehicleType: 'train',
    stationIds: [
      'kt_shibuya', 'kt_komabatodaimae', 'kt_shimokitazawa',
      'kt_meidaimae', 'kt_eifukucho', 'kt_kugayama', 'kt_kichijoji',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },

  {
    id: 'keio_sagamihara',
    name: '京王相模原線',
    company: '京王電鉄',
    color: '#DD0077',
    vehicleType: 'train',
    stationIds: [
      'kt_chofu', 'kt_keio_inagi', 'kt_keio_nagayama',
      'kt_keio_tama_center', 'kt_minami_osawa', 'kt_hashimoto',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },

  // --------------------------------------------------------
  // 西武鉄道
  // --------------------------------------------------------
  {
    id: 'seibu_ikebukuro',
    name: '西武池袋線',
    company: '西武鉄道',
    color: '#009944',
    vehicleType: 'train',
    stationIds: [
      'kt_ikebukuro', 'kt_nerima', 'kt_shakujiikoen', 'kt_hibarigaoka',
      'kt_tokorozawa', 'kt_kotesashi', 'kt_irumashi', 'kt_hanno',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },
  {
    id: 'seibu_shinjuku',
    name: '西武新宿線',
    company: '西武鉄道',
    color: '#009944',
    vehicleType: 'train',
    stationIds: [
      'kt_seibu_shinjuku', 'kt_takadanobaba', 'kt_saginomiya',
      'kt_kamiishigami', 'kt_tanashi', 'kt_kodaira', 'kt_higashimurayama',
      'kt_tokorozawa', 'kt_shintokorozawa',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },

  // --------------------------------------------------------
  // 東武鉄道
  // --------------------------------------------------------
  {
    id: 'tobu_tojo',
    name: '東武東上線',
    company: '東武鉄道',
    color: '#0079C2',
    vehicleType: 'train',
    stationIds: [
      'kt_ikebukuro', 'kt_oyama', 'kt_narimasu', 'kt_wakoshi',
      'kt_asakadai', 'kt_shiki', 'kt_fujimino', 'kt_kawagoe',
      'kt_kawagoeshi', 'kt_sakado', 'kt_higashimatsuyama',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },
  {
    id: 'tobu_skytree',
    name: '東武スカイツリーライン',
    company: '東武鉄道',
    color: '#0079C2',
    vehicleType: 'train',
    stationIds: [
      'kt_asakusa', 'kt_tokyo_skytree', 'kt_oshiage', 'kt_kita_senju',
      'kt_nishiarai', 'kt_takenotsuka', 'kt_soka', 'kt_shinkoshigaya',
      'kt_koshigaya', 'kt_sengendai', 'kt_kasukabe', 'kt_tobu_dobutsukoen',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },

  // --------------------------------------------------------
  // 京急電鉄
  // --------------------------------------------------------
  {
    id: 'keikyu_main',
    name: '京急本線',
    company: '京急電鉄',
    color: '#E60033',
    vehicleType: 'train',
    stationIds: [
      'kt_sengakuji', 'kt_shinagawa', 'kt_keikyu_kamata',
      'kt_keikyu_kawasaki', 'kt_yokohama', 'kt_kamiooka',
      'kt_kanazawabunko', 'kt_kanazawahakkei', 'kt_yokosukachuo',
      'kt_horinouchi', 'kt_uraga',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },
  {
    id: 'keikyu_airport',
    name: '京急空港線',
    company: '京急電鉄',
    color: '#E60033',
    vehicleType: 'train',
    stationIds: [
      'kt_keikyu_kamata', 'kt_kojiya', 'kt_otorii', 'kt_anamoriinari',
      'kt_tenkubashi', 'kt_haneda_t3', 'kt_haneda_t1t2',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },

  // --------------------------------------------------------
  // 京成電鉄
  // --------------------------------------------------------
  {
    id: 'keisei_main',
    name: '京成本線',
    company: '京成電鉄',
    color: '#003DA5',
    vehicleType: 'train',
    stationIds: [
      'kt_keisei_ueno', 'kt_nippori', 'kt_aoto', 'kt_keisei_takasago',
      'kt_keisei_funabashi', 'kt_keisei_tsudanuma', 'kt_keisei_sakura',
      'kt_keisei_narita', 'kt_airport2bldg', 'kt_narita_airport',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },
  {
    id: 'keisei_sky',
    name: '京成スカイアクセス',
    company: '京成電鉄',
    color: '#003DA5',
    vehicleType: 'train',
    stationIds: [
      'kt_keisei_takasago', 'kt_higashimatsudo', 'kt_shinkamagaya',
      'kt_chibant_chuo', 'kt_inba_nihon_idai', 'kt_narita_yukawa',
      'kt_airport2bldg', 'kt_narita_airport',
    ],
    isLoop: false,
    avgIntervalMinutes: 10,
  },

  // --------------------------------------------------------
  // 京成押上線
  // --------------------------------------------------------
  {
    id: 'keisei_oshiage',
    name: '京成押上線',
    company: '京成電鉄',
    color: '#003DA5',
    vehicleType: 'train',
    stationIds: [
      'kt_aoto', 'kt_keisei_tateishi', 'kt_keisei_yotsugi', 'kt_oshiage',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },

  // --------------------------------------------------------
  // 東武アーバンパークライン（野田線）
  // --------------------------------------------------------
  {
    id: 'tobu_noda',
    name: '東武アーバンパークライン',
    company: '東武鉄道',
    color: '#0079C2',
    vehicleType: 'train',
    stationIds: [
      'kt_omiya', 'kt_iwatsuki', 'kt_kasukabe',
      'kt_nagareyama_otakanomori', 'kt_kashiwa', 'kt_funabashi',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },

  // --------------------------------------------------------
  // 相模鉄道
  // --------------------------------------------------------
  {
    id: 'sotetsu_main',
    name: '相鉄本線',
    company: '相模鉄道',
    color: '#2F5597',
    vehicleType: 'train',
    stationIds: [
      'kt_yokohama', 'kt_hoshikawa', 'kt_nishiya', 'kt_futamatagawa',
      'kt_yamato', 'kt_ebina',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },
  {
    id: 'sotetsu_izumino',
    name: '相鉄いずみ野線',
    company: '相模鉄道',
    color: '#2F5597',
    vehicleType: 'train',
    stationIds: [
      'kt_futamatagawa', 'kt_izumino', 'kt_izumichuo',
      'kt_shonandai',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },
];

// ============================================================
// エクスポート
// ============================================================

export const kantoPrivateData: RegionData = { stations, lines };
