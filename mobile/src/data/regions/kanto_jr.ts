/**
 * 関東地方 追加路線データ（JR東日本・都営地下鉄・横浜市営地下鉄・その他）
 *
 * JR山手線、JR中央快速線、JR京浜東北線、JR東海道線、JR横須賀線、
 * JR総武線各停、JR総武快速線、JR埼京線、JR京葉線、
 * JR常磐線快速、JR常磐線各停、JR湘南新宿ライン、JR上野東京ライン、
 * JR横浜線、JR南武線、JR武蔵野線、JR青梅線、JR五日市線、JR八高線、JR相模線、
 * 都営三田線、都営新宿線、
 * 横浜市営ブルーライン、横浜市営グリーンライン、
 * つくばエクスプレス、ゆりかもめ、東京モノレール、りんかい線
 */

import { StationData, LineData, RegionData } from '../types';

// ============================================================
// 駅データ（全路線共通・重複統合済み）
// ============================================================

const stations: StationData[] = [
  // --------------------------------------------------------
  // JR山手線（他路線で未定義の駅）
  // --------------------------------------------------------
  { id: 'kt_okachimachi', name: '御徒町', lat: 35.7074, lng: 139.7746, lines: ['jr_yamanote', 'jr_keihin_tohoku'], prefecture: '東京都' },
  { id: 'kt_uguisudani', name: '鶯谷', lat: 35.7207, lng: 139.7785, lines: ['jr_yamanote', 'jr_keihin_tohoku'], prefecture: '東京都' },
  { id: 'kt_tabata', name: '田端', lat: 35.7381, lng: 139.7608, lines: ['jr_yamanote', 'jr_keihin_tohoku'], prefecture: '東京都' },
  { id: 'kt_otsuka', name: '大塚', lat: 35.7316, lng: 139.7280, lines: ['jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_mejiro', name: '目白', lat: 35.7213, lng: 139.7065, lines: ['jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_shin_okubo', name: '新大久保', lat: 35.7010, lng: 139.7002, lines: ['jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_harajuku', name: '原宿', lat: 35.6702, lng: 139.7027, lines: ['jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_takanawa_gw', name: '高輪ゲートウェイ', lat: 35.6355, lng: 139.7406, lines: ['jr_yamanote', 'jr_keihin_tohoku'], prefecture: '東京都' },
  { id: 'kt_tamachi', name: '田町', lat: 35.6457, lng: 139.7475, lines: ['jr_yamanote', 'jr_keihin_tohoku'], prefecture: '東京都' },
  // JR京浜東北線（蒲田駅 - 京急蒲田との乗り換え接続用）
  { id: 'kt_kamata', name: '蒲田', lat: 35.5627, lng: 139.7160, lines: ['jr_keihin_tohoku', 'tokyu_ikegami'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 都営三田線
  // --------------------------------------------------------
  { id: 'kt_meguro', name: '目黒', lat: 35.6337, lng: 139.7158, lines: ['toei_mita', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_shirokanedai', name: '白金台', lat: 35.6385, lng: 139.7264, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_shirokanetakanawa', name: '白金高輪', lat: 35.6432, lng: 139.7335, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_mita', name: '三田', lat: 35.6486, lng: 139.7466, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_shibakoen', name: '芝公園', lat: 35.6553, lng: 139.7513, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_onarimon', name: '御成門', lat: 35.6596, lng: 139.7509, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_uchisaiwaicho', name: '内幸町', lat: 35.6694, lng: 139.7545, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_hibiya', name: '日比谷', lat: 35.6750, lng: 139.7600, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_otemachi', name: '大手町', lat: 35.6862, lng: 139.7637, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_jimbocho', name: '神保町', lat: 35.6959, lng: 139.7578, lines: ['toei_mita', 'toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_suidobashi', name: '水道橋', lat: 35.7019, lng: 139.7537, lines: ['toei_mita', 'jr_sobu_local'], prefecture: '東京都' },
  { id: 'kt_kasuga', name: '春日', lat: 35.7081, lng: 139.7523, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_hakusan', name: '白山', lat: 35.7188, lng: 139.7518, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_sengoku', name: '千石', lat: 35.7273, lng: 139.7461, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_sugamo', name: '巣鴨', lat: 35.7334, lng: 139.7394, lines: ['toei_mita', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_nishisugamo', name: '西巣鴨', lat: 35.7408, lng: 139.7318, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_shin_itabashi', name: '新板橋', lat: 35.7475, lng: 139.7244, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_itabashi_kuyakushomae', name: '板橋区役所前', lat: 35.7518, lng: 139.7176, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_itabashi_honcho', name: '板橋本町', lat: 35.7583, lng: 139.7091, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_motohasunuma', name: '本蓮沼', lat: 35.7645, lng: 139.7008, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_shimura_sakaue', name: '志村坂上', lat: 35.7719, lng: 139.6916, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_shimura_sanchome', name: '志村三丁目', lat: 35.7773, lng: 139.6832, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_hasune', name: '蓮根', lat: 35.7843, lng: 139.6765, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_nishidai', name: '西台', lat: 35.7896, lng: 139.6693, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_takashimadaira', name: '高島平', lat: 35.7953, lng: 139.6600, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_shin_takashimadaira', name: '新高島平', lat: 35.7983, lng: 139.6523, lines: ['toei_mita'], prefecture: '東京都' },
  { id: 'kt_nishi_takashimadaira', name: '西高島平', lat: 35.8003, lng: 139.6442, lines: ['toei_mita'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 都営新宿線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_shinjuku', name: '新宿', lat: 35.6896, lng: 139.7006, lines: ['toei_shinjuku', 'jr_sobu_local', 'jr_saikyo', 'jr_shonan_shinjuku', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_shinjuku_sanchome', name: '新宿三丁目', lat: 35.6889, lng: 139.7055, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_akebonobashi', name: '曙橋', lat: 35.6930, lng: 139.7199, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_ichigaya', name: '市ヶ谷', lat: 35.6919, lng: 139.7359, lines: ['toei_shinjuku', 'jr_sobu_local'], prefecture: '東京都' },
  { id: 'kt_kudanshita', name: '九段下', lat: 35.6952, lng: 139.7508, lines: ['toei_shinjuku'], prefecture: '東京都' },
  // 神保町はkt_jimbochoで定義済み
  { id: 'kt_ogawamachi', name: '小川町', lat: 35.6955, lng: 139.7666, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_iwamotocho', name: '岩本町', lat: 35.6945, lng: 139.7748, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_bakuroyokoyama', name: '馬喰横山', lat: 35.6930, lng: 139.7837, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_hamacho', name: '浜町', lat: 35.6875, lng: 139.7871, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_morishita', name: '森下', lat: 35.6868, lng: 139.7960, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_kikukawa', name: '菊川', lat: 35.6845, lng: 139.8041, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_sumiyoshi', name: '住吉', lat: 35.6830, lng: 139.8138, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_nishiojima', name: '西大島', lat: 35.6863, lng: 139.8252, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_ojima', name: '大島', lat: 35.6876, lng: 139.8360, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_higashiojima', name: '東大島', lat: 35.6885, lng: 139.8467, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_funabori', name: '船堀', lat: 35.6867, lng: 139.8627, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_ichinoe', name: '一之江', lat: 35.6833, lng: 139.8788, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_mizue', name: '瑞江', lat: 35.6778, lng: 139.8907, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_shinozaki', name: '篠崎', lat: 35.6711, lng: 139.9064, lines: ['toei_shinjuku'], prefecture: '東京都' },
  { id: 'kt_motoyawata', name: '本八幡', lat: 35.7275, lng: 139.9237, lines: ['toei_shinjuku', 'jr_sobu_local'], prefecture: '千葉県' },

  // --------------------------------------------------------
  // JR総武線各停（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_mitaka', name: '三鷹', lat: 35.7027, lng: 139.5609, lines: ['jr_sobu_local', 'jr_chuo_rapid'], prefecture: '東京都' },
  { id: 'kt_kichijoji', name: '吉祥寺', lat: 35.7032, lng: 139.5798, lines: ['jr_sobu_local', 'jr_chuo_rapid'], prefecture: '東京都' },
  { id: 'kt_nishi_ogikubo', name: '西荻窪', lat: 35.7030, lng: 139.5993, lines: ['jr_sobu_local'], prefecture: '東京都' },
  { id: 'kt_ogikubo', name: '荻窪', lat: 35.7044, lng: 139.6201, lines: ['jr_sobu_local', 'jr_chuo_rapid'], prefecture: '東京都' },
  { id: 'kt_asagaya', name: '阿佐ヶ谷', lat: 35.7044, lng: 139.6358, lines: ['jr_sobu_local'], prefecture: '東京都' },
  { id: 'kt_koenji', name: '高円寺', lat: 35.7053, lng: 139.6497, lines: ['jr_sobu_local'], prefecture: '東京都' },
  { id: 'kt_nakano', name: '中野', lat: 35.7065, lng: 139.6659, lines: ['jr_sobu_local', 'jr_chuo_rapid'], prefecture: '東京都' },
  { id: 'kt_higashi_nakano', name: '東中野', lat: 35.7074, lng: 139.6818, lines: ['jr_sobu_local'], prefecture: '東京都' },
  { id: 'kt_okubo', name: '大久保', lat: 35.7012, lng: 139.6975, lines: ['jr_sobu_local'], prefecture: '東京都' },
  // 新宿はkt_shinjukuで定義済み
  { id: 'kt_yoyogi', name: '代々木', lat: 35.6833, lng: 139.7020, lines: ['jr_sobu_local', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_sendagaya', name: '千駄ヶ谷', lat: 35.6810, lng: 139.7110, lines: ['jr_sobu_local'], prefecture: '東京都' },
  { id: 'kt_shinanomachi', name: '信濃町', lat: 35.6802, lng: 139.7198, lines: ['jr_sobu_local'], prefecture: '東京都' },
  { id: 'kt_yotsuya', name: '四ツ谷', lat: 35.6860, lng: 139.7303, lines: ['jr_sobu_local', 'jr_chuo_rapid'], prefecture: '東京都' },
  // 市ヶ谷はkt_ichigayaで定義済み
  { id: 'kt_iidabashi', name: '飯田橋', lat: 35.7019, lng: 139.7450, lines: ['jr_sobu_local'], prefecture: '東京都' },
  // 水道橋はkt_suidobashiで定義済み
  { id: 'kt_ochanomizu', name: '御茶ノ水', lat: 35.6998, lng: 139.7651, lines: ['jr_sobu_local', 'jr_chuo_rapid'], prefecture: '東京都' },
  { id: 'kt_akihabara', name: '秋葉原', lat: 35.6984, lng: 139.7731, lines: ['jr_sobu_local', 'tx', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_asakusabashi', name: '浅草橋', lat: 35.6961, lng: 139.7858, lines: ['jr_sobu_local'], prefecture: '東京都' },
  { id: 'kt_ryogoku', name: '両国', lat: 35.6958, lng: 139.7929, lines: ['jr_sobu_local'], prefecture: '東京都' },
  { id: 'kt_kinshicho', name: '錦糸町', lat: 35.6962, lng: 139.8145, lines: ['jr_sobu_local', 'jr_sobu_rapid'], prefecture: '東京都' },
  { id: 'kt_kameido', name: '亀戸', lat: 35.6978, lng: 139.8273, lines: ['jr_sobu_local'], prefecture: '東京都' },
  { id: 'kt_hirai', name: '平井', lat: 35.7057, lng: 139.8414, lines: ['jr_sobu_local'], prefecture: '東京都' },
  { id: 'kt_shinkoiwa', name: '新小岩', lat: 35.7169, lng: 139.8583, lines: ['jr_sobu_local', 'jr_sobu_rapid'], prefecture: '東京都' },
  { id: 'kt_koiwa', name: '小岩', lat: 35.7330, lng: 139.8793, lines: ['jr_sobu_local'], prefecture: '東京都' },
  { id: 'kt_ichikawa', name: '市川', lat: 35.7319, lng: 139.9081, lines: ['jr_sobu_local', 'jr_sobu_rapid'], prefecture: '千葉県' },
  // 本八幡はkt_motoyawataで定義済み
  { id: 'kt_nishi_funabashi', name: '西船橋', lat: 35.7191, lng: 139.9528, lines: ['jr_sobu_local', 'jr_musashino'], prefecture: '千葉県' },
  { id: 'kt_funabashi', name: '船橋', lat: 35.7015, lng: 139.9856, lines: ['jr_sobu_local', 'tobu_noda', 'jr_sobu_rapid'], prefecture: '千葉県' },
  { id: 'kt_tsudanuma', name: '津田沼', lat: 35.6814, lng: 140.0229, lines: ['jr_sobu_local', 'jr_sobu_rapid'], prefecture: '千葉県' },
  { id: 'kt_makuharihongo', name: '幕張本郷', lat: 35.6730, lng: 140.0418, lines: ['jr_sobu_local'], prefecture: '千葉県' },
  { id: 'kt_makuhari', name: '幕張', lat: 35.6568, lng: 140.0520, lines: ['jr_sobu_local'], prefecture: '千葉県' },
  { id: 'kt_shin_kemigawa', name: '新検見川', lat: 35.6374, lng: 140.0604, lines: ['jr_sobu_local'], prefecture: '千葉県' },
  { id: 'kt_inage', name: '稲毛', lat: 35.6370, lng: 140.1058, lines: ['jr_sobu_local'], prefecture: '千葉県' },
  { id: 'kt_nishi_chiba', name: '西千葉', lat: 35.6245, lng: 140.1094, lines: ['jr_sobu_local'], prefecture: '千葉県' },
  { id: 'kt_chiba', name: '千葉', lat: 35.6131, lng: 140.1134, lines: ['jr_sobu_local', 'jr_sobu_rapid'], prefecture: '千葉県' },

  // --------------------------------------------------------
  // JR埼京線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_osaki', name: '大崎', lat: 35.6197, lng: 139.7284, lines: ['jr_saikyo', 'jr_shonan_shinjuku', 'rinkai', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_ebisu', name: '恵比寿', lat: 35.6467, lng: 139.7100, lines: ['jr_saikyo', 'jr_shonan_shinjuku', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_shibuya', name: '渋谷', lat: 35.6580, lng: 139.7016, lines: ['jr_saikyo', 'jr_shonan_shinjuku', 'jr_yamanote'], prefecture: '東京都' },
  // 新宿はkt_shinjukuで定義済み
  { id: 'kt_ikebukuro', name: '池袋', lat: 35.7295, lng: 139.7109, lines: ['jr_saikyo', 'jr_shonan_shinjuku', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_itabashi', name: '板橋', lat: 35.7510, lng: 139.7200, lines: ['jr_saikyo'], prefecture: '東京都' },
  { id: 'kt_jujo', name: '十条', lat: 35.7605, lng: 139.7239, lines: ['jr_saikyo'], prefecture: '東京都' },
  { id: 'kt_akabane', name: '赤羽', lat: 35.7779, lng: 139.7209, lines: ['jr_saikyo', 'jr_shonan_shinjuku', 'jr_keihin_tohoku'], prefecture: '東京都' },
  { id: 'kt_kita_akabane', name: '北赤羽', lat: 35.7870, lng: 139.7084, lines: ['jr_saikyo'], prefecture: '東京都' },
  { id: 'kt_ukimafunado', name: '浮間舟渡', lat: 35.7941, lng: 139.6905, lines: ['jr_saikyo'], prefecture: '東京都' },
  { id: 'kt_todakoen', name: '戸田公園', lat: 35.8073, lng: 139.6736, lines: ['jr_saikyo'], prefecture: '埼玉県' },
  { id: 'kt_toda', name: '戸田', lat: 35.8150, lng: 139.6680, lines: ['jr_saikyo'], prefecture: '埼玉県' },
  { id: 'kt_kitatoda', name: '北戸田', lat: 35.8243, lng: 139.6607, lines: ['jr_saikyo'], prefecture: '埼玉県' },
  { id: 'kt_musashi_urawa', name: '武蔵浦和', lat: 35.8383, lng: 139.6520, lines: ['jr_saikyo', 'jr_musashino'], prefecture: '埼玉県' },
  { id: 'kt_naka_urawa', name: '中浦和', lat: 35.8465, lng: 139.6364, lines: ['jr_saikyo'], prefecture: '埼玉県' },
  { id: 'kt_minami_yono', name: '南与野', lat: 35.8550, lng: 139.6266, lines: ['jr_saikyo'], prefecture: '埼玉県' },
  { id: 'kt_yono_honmachi', name: '与野本町', lat: 35.8646, lng: 139.6222, lines: ['jr_saikyo'], prefecture: '埼玉県' },
  { id: 'kt_kita_yono', name: '北与野', lat: 35.8731, lng: 139.6185, lines: ['jr_saikyo'], prefecture: '埼玉県' },
  { id: 'kt_omiya', name: '大宮', lat: 35.9063, lng: 139.6240, lines: ['jr_saikyo', 'jr_shonan_shinjuku', 'tobu_noda', 'jr_keihin_tohoku'], prefecture: '埼玉県' },

  // --------------------------------------------------------
  // JR京葉線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_tokyo', name: '東京', lat: 35.6812, lng: 139.7671, lines: ['jr_keiyo', 'jr_yamanote', 'jr_chuo_rapid', 'jr_keihin_tohoku', 'jr_tokaido', 'jr_yokosuka', 'jr_sobu_rapid', 'jr_ueno_tokyo'], prefecture: '東京都' },
  { id: 'kt_hacchobori', name: '八丁堀', lat: 35.6738, lng: 139.7763, lines: ['jr_keiyo'], prefecture: '東京都' },
  { id: 'kt_ecchujima', name: '越中島', lat: 35.6681, lng: 139.7859, lines: ['jr_keiyo'], prefecture: '東京都' },
  { id: 'kt_shiomi', name: '潮見', lat: 35.6584, lng: 139.8009, lines: ['jr_keiyo'], prefecture: '東京都' },
  { id: 'kt_shin_kiba', name: '新木場', lat: 35.6468, lng: 139.8269, lines: ['jr_keiyo', 'rinkai'], prefecture: '東京都' },
  { id: 'kt_kasai_rinkai_koen', name: '葛西臨海公園', lat: 35.6387, lng: 139.8612, lines: ['jr_keiyo'], prefecture: '東京都' },
  { id: 'kt_maihama', name: '舞浜', lat: 35.6326, lng: 139.8837, lines: ['jr_keiyo'], prefecture: '千葉県' },
  { id: 'kt_shin_urayasu', name: '新浦安', lat: 35.6349, lng: 139.9050, lines: ['jr_keiyo'], prefecture: '千葉県' },
  { id: 'kt_ichikawa_shiohama', name: '市川塩浜', lat: 35.6590, lng: 139.9282, lines: ['jr_keiyo'], prefecture: '千葉県' },
  { id: 'kt_futamata_shinmachi', name: '二俣新町', lat: 35.6728, lng: 139.9475, lines: ['jr_keiyo'], prefecture: '千葉県' },
  { id: 'kt_minami_funabashi', name: '南船橋', lat: 35.6680, lng: 139.9749, lines: ['jr_keiyo'], prefecture: '千葉県' },
  { id: 'kt_shin_narashino', name: '新習志野', lat: 35.6530, lng: 140.0048, lines: ['jr_keiyo'], prefecture: '千葉県' },
  { id: 'kt_kaihimmakuhari', name: '海浜幕張', lat: 35.6480, lng: 140.0380, lines: ['jr_keiyo'], prefecture: '千葉県' },
  { id: 'kt_kemigawahama', name: '検見川浜', lat: 35.6393, lng: 140.0568, lines: ['jr_keiyo'], prefecture: '千葉県' },
  { id: 'kt_inage_kaigan', name: '稲毛海岸', lat: 35.6253, lng: 140.0700, lines: ['jr_keiyo'], prefecture: '千葉県' },
  { id: 'kt_chiba_minato', name: '千葉みなと', lat: 35.6094, lng: 140.0775, lines: ['jr_keiyo'], prefecture: '千葉県' },
  { id: 'kt_soga', name: '蘇我', lat: 35.5877, lng: 140.1090, lines: ['jr_keiyo'], prefecture: '千葉県' },

  // --------------------------------------------------------
  // JR常磐線快速（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_ueno', name: '上野', lat: 35.7141, lng: 139.7774, lines: ['jr_joban', 'jr_yamanote', 'jr_keihin_tohoku', 'jr_ueno_tokyo'], prefecture: '東京都' },
  { id: 'kt_nippori', name: '日暮里', lat: 35.7280, lng: 139.7709, lines: ['jr_joban', 'jr_yamanote', 'jr_keihin_tohoku'], prefecture: '東京都' },
  { id: 'kt_mikawashima', name: '三河島', lat: 35.7343, lng: 139.7776, lines: ['jr_joban'], prefecture: '東京都' },
  { id: 'kt_minami_senju', name: '南千住', lat: 35.7388, lng: 139.7953, lines: ['jr_joban', 'tx'], prefecture: '東京都' },
  { id: 'kt_kita_senju', name: '北千住', lat: 35.7497, lng: 139.8050, lines: ['jr_joban', 'tx'], prefecture: '東京都' },
  { id: 'kt_matsudo', name: '松戸', lat: 35.7833, lng: 139.9014, lines: ['jr_joban', 'jr_joban_local'], prefecture: '千葉県' },
  { id: 'kt_kashiwa', name: '柏', lat: 35.8619, lng: 139.9714, lines: ['jr_joban', 'tobu_noda', 'jr_joban_local'], prefecture: '千葉県' },
  { id: 'kt_abiko', name: '我孫子', lat: 35.8648, lng: 140.0235, lines: ['jr_joban', 'jr_joban_local'], prefecture: '千葉県' },
  { id: 'kt_tennodai', name: '天王台', lat: 35.8719, lng: 140.0330, lines: ['jr_joban'], prefecture: '千葉県' },
  { id: 'kt_toride', name: '取手', lat: 35.9115, lng: 140.0508, lines: ['jr_joban'], prefecture: '茨城県' },

  // --------------------------------------------------------
  // JR湘南新宿ライン（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_urawa', name: '浦和', lat: 35.8585, lng: 139.6571, lines: ['jr_shonan_shinjuku', 'jr_keihin_tohoku'], prefecture: '埼玉県' },
  // 赤羽はkt_akabaneで定義済み、池袋はkt_ikebukuroで定義済み
  // 新宿はkt_shinjukuで定義済み、渋谷はkt_shibuyaで定義済み
  // 恵比寿はkt_ebisuで定義済み、大崎はkt_osakiで定義済み
  { id: 'kt_nishioi', name: '西大井', lat: 35.6070, lng: 139.7241, lines: ['jr_shonan_shinjuku', 'jr_yokosuka'], prefecture: '東京都' },
  { id: 'kt_musashi_kosugi', name: '武蔵小杉', lat: 35.5766, lng: 139.6590, lines: ['jr_shonan_shinjuku', 'jr_nambu', 'jr_yokosuka'], prefecture: '神奈川県' },
  { id: 'kt_yokohama', name: '横浜', lat: 35.4657, lng: 139.6225, lines: ['jr_shonan_shinjuku', 'jr_yokohama', 'yokohama_blue', 'jr_keihin_tohoku', 'jr_tokaido', 'jr_yokosuka', 'jr_ueno_tokyo'], prefecture: '神奈川県' },
  { id: 'kt_totsuka', name: '戸塚', lat: 35.3997, lng: 139.5347, lines: ['jr_shonan_shinjuku', 'yokohama_blue', 'jr_tokaido', 'jr_yokosuka', 'jr_ueno_tokyo'], prefecture: '神奈川県' },
  { id: 'kt_ofuna', name: '大船', lat: 35.3530, lng: 139.5355, lines: ['jr_shonan_shinjuku', 'jr_keihin_tohoku', 'jr_tokaido', 'jr_yokosuka', 'jr_ueno_tokyo'], prefecture: '神奈川県' },
  { id: 'kt_fujisawa', name: '藤沢', lat: 35.3383, lng: 139.4872, lines: ['jr_shonan_shinjuku', 'odakyu_enoshima', 'jr_tokaido'], prefecture: '神奈川県' },
  { id: 'kt_chigasaki', name: '茅ヶ崎', lat: 35.3339, lng: 139.4043, lines: ['jr_shonan_shinjuku', 'jr_tokaido', 'jr_sagami'], prefecture: '神奈川県' },
  { id: 'kt_hiratsuka', name: '平塚', lat: 35.3293, lng: 139.3502, lines: ['jr_shonan_shinjuku', 'jr_tokaido'], prefecture: '神奈川県' },

  // --------------------------------------------------------
  // JR横浜線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_higashi_kanagawa', name: '東神奈川', lat: 35.4775, lng: 139.6356, lines: ['jr_yokohama', 'jr_keihin_tohoku'], prefecture: '神奈川県' },
  { id: 'kt_kikuna', name: '菊名', lat: 35.5092, lng: 139.6314, lines: ['jr_yokohama'], prefecture: '神奈川県' },
  { id: 'kt_shin_yokohama', name: '新横浜', lat: 35.5067, lng: 139.6179, lines: ['jr_yokohama', 'yokohama_blue'], prefecture: '神奈川県' },
  { id: 'kt_kamoi', name: '鴨居', lat: 35.5108, lng: 139.5810, lines: ['jr_yokohama'], prefecture: '神奈川県' },
  { id: 'kt_nakayama', name: '中山', lat: 35.5137, lng: 139.5446, lines: ['jr_yokohama', 'yokohama_green'], prefecture: '神奈川県' },
  { id: 'kt_nagatsuta', name: '長津田', lat: 35.5310, lng: 139.4956, lines: ['jr_yokohama'], prefecture: '神奈川県' },
  { id: 'kt_machida', name: '町田', lat: 35.5413, lng: 139.4455, lines: ['jr_yokohama'], prefecture: '東京都' },
  { id: 'kt_sagamihara', name: '相模原', lat: 35.5743, lng: 139.3733, lines: ['jr_yokohama'], prefecture: '神奈川県' },
  { id: 'kt_hashimoto', name: '橋本', lat: 35.5946, lng: 139.3458, lines: ['jr_yokohama', 'keio_sagamihara', 'jr_sagami'], prefecture: '神奈川県' },
  { id: 'kt_hachioji', name: '八王子', lat: 35.6558, lng: 139.3388, lines: ['jr_yokohama', 'jr_chuo_rapid', 'jr_hachiko'], prefecture: '東京都' },

  // --------------------------------------------------------
  // JR南武線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_kawasaki', name: '川崎', lat: 35.5308, lng: 139.7020, lines: ['jr_nambu', 'jr_keihin_tohoku', 'jr_tokaido', 'jr_ueno_tokyo'], prefecture: '神奈川県' },
  { id: 'kt_kashimada', name: '鹿島田', lat: 35.5573, lng: 139.6714, lines: ['jr_nambu'], prefecture: '神奈川県' },
  // 武蔵小杉はkt_musashi_kosugiで定義済み
  { id: 'kt_musashi_nakahara', name: '武蔵中原', lat: 35.5833, lng: 139.6479, lines: ['jr_nambu'], prefecture: '神奈川県' },
  { id: 'kt_musashi_shinjo', name: '武蔵新城', lat: 35.5907, lng: 139.6337, lines: ['jr_nambu'], prefecture: '神奈川県' },
  { id: 'kt_musashi_mizonokuchi', name: '武蔵溝ノ口', lat: 35.5991, lng: 139.6134, lines: ['jr_nambu'], prefecture: '神奈川県' },
  { id: 'kt_noborito', name: '登戸', lat: 35.6308, lng: 139.5703, lines: ['jr_nambu'], prefecture: '神奈川県' },
  { id: 'kt_inadazutsumi', name: '稲田堤', lat: 35.6370, lng: 139.5218, lines: ['jr_nambu'], prefecture: '神奈川県' },
  { id: 'kt_fuchu_honmachi', name: '府中本町', lat: 35.6650, lng: 139.4773, lines: ['jr_nambu', 'jr_musashino'], prefecture: '東京都' },
  { id: 'kt_bubaigawara', name: '分倍河原', lat: 35.6690, lng: 139.4660, lines: ['jr_nambu'], prefecture: '東京都' },
  { id: 'kt_tachikawa', name: '立川', lat: 35.6979, lng: 139.4142, lines: ['jr_nambu', 'jr_chuo_rapid', 'jr_ome'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 横浜市営ブルーライン（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_azamino', name: 'あざみ野', lat: 35.5685, lng: 139.5536, lines: ['yokohama_blue'], prefecture: '神奈川県' },
  { id: 'kt_center_kita', name: 'センター北', lat: 35.5509, lng: 139.5781, lines: ['yokohama_blue', 'yokohama_green'], prefecture: '神奈川県' },
  { id: 'kt_center_minami', name: 'センター南', lat: 35.5457, lng: 139.5741, lines: ['yokohama_blue', 'yokohama_green'], prefecture: '神奈川県' },
  // 新横浜はkt_shin_yokohamaで定義済み
  // 横浜はkt_yokohamaで定義済み
  { id: 'kt_sakuragicho', name: '桜木町', lat: 35.4510, lng: 139.6311, lines: ['yokohama_blue', 'jr_keihin_tohoku'], prefecture: '神奈川県' },
  { id: 'kt_kannai', name: '関内', lat: 35.4437, lng: 139.6367, lines: ['yokohama_blue', 'jr_keihin_tohoku'], prefecture: '神奈川県' },
  { id: 'kt_kamiooka', name: '上大岡', lat: 35.4021, lng: 139.5960, lines: ['yokohama_blue'], prefecture: '神奈川県' },
  // 戸塚はkt_totsukaで定義済み
  { id: 'kt_shonandai', name: '湘南台', lat: 35.3882, lng: 139.4683, lines: ['yokohama_blue', 'sotetsu_izumino'], prefecture: '神奈川県' },

  // --------------------------------------------------------
  // 横浜市営グリーンライン（重複しない駅）
  // --------------------------------------------------------
  // 中山はkt_nakayamaで定義済み
  // センター南・センター北はkt_center_minami/kt_center_kitaで定義済み
  { id: 'kt_hiyoshi', name: '日吉', lat: 35.5528, lng: 139.6471, lines: ['yokohama_green'], prefecture: '神奈川県' },

  // --------------------------------------------------------
  // つくばエクスプレス（重複しない駅）
  // --------------------------------------------------------
  // 秋葉原はkt_akihabaraで定義済み
  { id: 'kt_shin_okachimachi', name: '新御徒町', lat: 35.7074, lng: 139.7800, lines: ['tx'], prefecture: '東京都' },
  { id: 'kt_asakusa', name: '浅草', lat: 35.7121, lng: 139.7968, lines: ['tx'], prefecture: '東京都' },
  // 北千住はkt_kita_senjuで定義済み
  { id: 'kt_yashio', name: '八潮', lat: 35.8226, lng: 139.8382, lines: ['tx'], prefecture: '埼玉県' },
  { id: 'kt_minami_nagareyama', name: '南流山', lat: 35.8432, lng: 139.8970, lines: ['tx', 'jr_musashino'], prefecture: '千葉県' },
  { id: 'kt_nagareyama_otakanomori', name: '流山おおたかの森', lat: 35.8649, lng: 139.9260, lines: ['tx', 'tobu_noda'], prefecture: '千葉県' },
  { id: 'kt_kashiwanoha_campus', name: '柏の葉キャンパス', lat: 35.8815, lng: 139.9520, lines: ['tx'], prefecture: '千葉県' },
  { id: 'kt_moriya', name: '守谷', lat: 35.9517, lng: 139.9752, lines: ['tx'], prefecture: '茨城県' },
  { id: 'kt_tsukuba', name: 'つくば', lat: 36.0827, lng: 140.1117, lines: ['tx'], prefecture: '茨城県' },

  // --------------------------------------------------------
  // ゆりかもめ
  // --------------------------------------------------------
  { id: 'kt_shimbashi', name: '新橋', lat: 35.6663, lng: 139.7586, lines: ['yurikamome', 'jr_yamanote', 'jr_keihin_tohoku', 'jr_tokaido', 'jr_yokosuka', 'jr_ueno_tokyo'], prefecture: '東京都' },
  { id: 'kt_shiodome', name: '汐留', lat: 35.6614, lng: 139.7625, lines: ['yurikamome'], prefecture: '東京都' },
  { id: 'kt_takeshiba', name: '竹芝', lat: 35.6556, lng: 139.7627, lines: ['yurikamome'], prefecture: '東京都' },
  { id: 'kt_hinode', name: '日の出', lat: 35.6503, lng: 139.7622, lines: ['yurikamome'], prefecture: '東京都' },
  { id: 'kt_odaiba_kaihinkoen', name: 'お台場海浜公園', lat: 35.6299, lng: 139.7757, lines: ['yurikamome'], prefecture: '東京都' },
  { id: 'kt_daiba', name: '台場', lat: 35.6267, lng: 139.7753, lines: ['yurikamome'], prefecture: '東京都' },
  { id: 'kt_tokyo_teleport', name: '東京テレポート', lat: 35.6260, lng: 139.7781, lines: ['rinkai'], prefecture: '東京都' },
  { id: 'kt_aomi', name: '青海', lat: 35.6194, lng: 139.7794, lines: ['yurikamome'], prefecture: '東京都' },
  { id: 'kt_ariake', name: '有明', lat: 35.6346, lng: 139.7906, lines: ['yurikamome'], prefecture: '東京都' },
  { id: 'kt_toyosu', name: '豊洲', lat: 35.6535, lng: 139.7964, lines: ['yurikamome'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 東京モノレール（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_hamamatsucho', name: '浜松町', lat: 35.6554, lng: 139.7571, lines: ['tokyo_monorail', 'jr_yamanote', 'jr_keihin_tohoku'], prefecture: '東京都' },
  { id: 'kt_tennozu_isle', name: '天王洲アイル', lat: 35.6224, lng: 139.7483, lines: ['tokyo_monorail', 'rinkai'], prefecture: '東京都' },
  { id: 'kt_ryutsu_center', name: '流通センター', lat: 35.5982, lng: 139.7491, lines: ['tokyo_monorail'], prefecture: '東京都' },
  { id: 'kt_tenkubashi', name: '天空橋', lat: 35.5480, lng: 139.7494, lines: ['tokyo_monorail'], prefecture: '東京都' },
  { id: 'kt_haneda_t1', name: '羽田空港第1ターミナル', lat: 35.5478, lng: 139.7840, lines: ['tokyo_monorail'], prefecture: '東京都' },
  { id: 'kt_haneda_t2', name: '羽田空港第2ターミナル', lat: 35.5495, lng: 139.7865, lines: ['tokyo_monorail'], prefecture: '東京都' },

  // --------------------------------------------------------
  // りんかい線（重複しない駅）
  // --------------------------------------------------------
  // 新木場はkt_shin_kibaで定義済み
  // 東京テレポートはkt_tokyo_teleportで定義済み
  // 天王洲アイルはkt_tennozu_isleで定義済み
  { id: 'kt_shinagawa_seaside', name: '品川シーサイド', lat: 35.6088, lng: 139.7417, lines: ['rinkai'], prefecture: '東京都' },
  { id: 'kt_oimachi', name: '大井町', lat: 35.6068, lng: 139.7349, lines: ['rinkai', 'tokyu_oimachi', 'jr_keihin_tohoku'], prefecture: '東京都' },
  // 大崎はkt_osakiで定義済み

  // --------------------------------------------------------
  // JR中央快速線（重複しない駅）
  // --------------------------------------------------------
  // 東京・神田・御茶ノ水・四ツ谷・新宿・中野・荻窪・吉祥寺・三鷹・立川・八王子は定義済み
  { id: 'kt_kokubunji', name: '国分寺', lat: 35.7003, lng: 139.4806, lines: ['jr_chuo_rapid'], prefecture: '東京都' },
  { id: 'kt_takao', name: '高尾', lat: 35.6420, lng: 139.2822, lines: ['jr_chuo_rapid'], prefecture: '東京都' },

  // --------------------------------------------------------
  // JR京浜東北線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_saitama_shintoshin', name: 'さいたま新都心', lat: 35.8932, lng: 139.6314, lines: ['jr_keihin_tohoku'], prefecture: '埼玉県' },
  { id: 'kt_minami_urawa', name: '南浦和', lat: 35.8383, lng: 139.6677, lines: ['jr_keihin_tohoku', 'jr_musashino'], prefecture: '埼玉県' },
  { id: 'kt_warabi', name: '蕨', lat: 35.8250, lng: 139.6818, lines: ['jr_keihin_tohoku'], prefecture: '埼玉県' },
  { id: 'kt_nishi_kawaguchi', name: '西川口', lat: 35.8121, lng: 139.7056, lines: ['jr_keihin_tohoku'], prefecture: '埼玉県' },
  { id: 'kt_kawaguchi', name: '川口', lat: 35.8003, lng: 139.7210, lines: ['jr_keihin_tohoku'], prefecture: '埼玉県' },
  { id: 'kt_higashi_jujo', name: '東十条', lat: 35.7640, lng: 139.7272, lines: ['jr_keihin_tohoku'], prefecture: '東京都' },
  { id: 'kt_kami_nakazato', name: '上中里', lat: 35.7450, lng: 139.7440, lines: ['jr_keihin_tohoku'], prefecture: '東京都' },
  { id: 'kt_oomori', name: '大森', lat: 35.5878, lng: 139.7278, lines: ['jr_keihin_tohoku'], prefecture: '東京都' },
  { id: 'kt_tsurumi', name: '鶴見', lat: 35.5046, lng: 139.6747, lines: ['jr_keihin_tohoku'], prefecture: '神奈川県' },
  { id: 'kt_ishikawacho', name: '石川町', lat: 35.4389, lng: 139.6425, lines: ['jr_keihin_tohoku'], prefecture: '神奈川県' },
  { id: 'kt_negishi', name: '根岸', lat: 35.4237, lng: 139.6500, lines: ['jr_keihin_tohoku'], prefecture: '神奈川県' },
  { id: 'kt_isogo', name: '磯子', lat: 35.4037, lng: 139.6223, lines: ['jr_keihin_tohoku'], prefecture: '神奈川県' },
  { id: 'kt_shin_sugita', name: '新杉田', lat: 35.3870, lng: 139.6194, lines: ['jr_keihin_tohoku'], prefecture: '神奈川県' },

  // --------------------------------------------------------
  // JR東海道線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_odawara_jr', name: '小田原', lat: 35.2564, lng: 139.1553, lines: ['jr_tokaido'], prefecture: '神奈川県' },
  { id: 'kt_atami', name: '熱海', lat: 35.1046, lng: 139.0776, lines: ['jr_tokaido'], prefecture: '静岡県' },

  // --------------------------------------------------------
  // JR横須賀線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_kita_kamakura', name: '北鎌倉', lat: 35.3368, lng: 139.5442, lines: ['jr_yokosuka'], prefecture: '神奈川県' },
  { id: 'kt_kamakura', name: '鎌倉', lat: 35.3190, lng: 139.5503, lines: ['jr_yokosuka'], prefecture: '神奈川県' },
  { id: 'kt_zushi', name: '逗子', lat: 35.2961, lng: 139.5804, lines: ['jr_yokosuka'], prefecture: '神奈川県' },
  { id: 'kt_yokosuka', name: '横須賀', lat: 35.2795, lng: 139.6679, lines: ['jr_yokosuka'], prefecture: '神奈川県' },
  { id: 'kt_kurihama', name: '久里浜', lat: 35.2305, lng: 139.7090, lines: ['jr_yokosuka'], prefecture: '神奈川県' },

  // --------------------------------------------------------
  // JR総武快速線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_shin_nihombashi', name: '新日本橋', lat: 35.6881, lng: 139.7747, lines: ['jr_sobu_rapid'], prefecture: '東京都' },
  { id: 'kt_bakurocho', name: '馬喰町', lat: 35.6932, lng: 139.7836, lines: ['jr_sobu_rapid'], prefecture: '東京都' },

  // --------------------------------------------------------
  // JR常磐線各停（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_kanamachi', name: '金町', lat: 35.7634, lng: 139.8710, lines: ['jr_joban_local'], prefecture: '東京都' },
  { id: 'kt_kitakogane', name: '北小金', lat: 35.8264, lng: 139.9405, lines: ['jr_joban_local'], prefecture: '千葉県' },

  // --------------------------------------------------------
  // JR武蔵野線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_kita_fuchu', name: '北府中', lat: 35.6744, lng: 139.4720, lines: ['jr_musashino'], prefecture: '東京都' },
  { id: 'kt_nishikokubunji', name: '西国分寺', lat: 35.6983, lng: 139.4694, lines: ['jr_musashino'], prefecture: '東京都' },
  { id: 'kt_shin_akitsu', name: '新秋津', lat: 35.7657, lng: 139.5060, lines: ['jr_musashino'], prefecture: '東京都' },
  { id: 'kt_higashi_tokorozawa', name: '東所沢', lat: 35.7859, lng: 139.5113, lines: ['jr_musashino'], prefecture: '埼玉県' },
  { id: 'kt_shin_za', name: '新座', lat: 35.7888, lng: 139.5619, lines: ['jr_musashino'], prefecture: '埼玉県' },
  { id: 'kt_kita_asaka', name: '北朝霞', lat: 35.8081, lng: 139.5834, lines: ['jr_musashino'], prefecture: '埼玉県' },
  { id: 'kt_higashiurawa', name: '東浦和', lat: 35.8547, lng: 139.6920, lines: ['jr_musashino'], prefecture: '埼玉県' },
  { id: 'kt_higashikawaguchi', name: '東川口', lat: 35.8369, lng: 139.7424, lines: ['jr_musashino'], prefecture: '埼玉県' },
  { id: 'kt_minami_koshigaya', name: '南越谷', lat: 35.8706, lng: 139.7903, lines: ['jr_musashino'], prefecture: '埼玉県' },
  { id: 'kt_koshigaya_laketown', name: '越谷レイクタウン', lat: 35.8800, lng: 139.8209, lines: ['jr_musashino'], prefecture: '埼玉県' },
  { id: 'kt_misato', name: '三郷', lat: 35.8355, lng: 139.8712, lines: ['jr_musashino'], prefecture: '埼玉県' },
  { id: 'kt_shin_matsudo', name: '新松戸', lat: 35.8277, lng: 139.9115, lines: ['jr_musashino'], prefecture: '千葉県' },
  { id: 'kt_shin_yahashira', name: '新八柱', lat: 35.7838, lng: 139.9388, lines: ['jr_musashino'], prefecture: '千葉県' },
  { id: 'kt_ichikawa_ono', name: '市川大野', lat: 35.7571, lng: 139.9350, lines: ['jr_musashino'], prefecture: '千葉県' },
  { id: 'kt_funabashihoten', name: '船橋法典', lat: 35.7441, lng: 139.9520, lines: ['jr_musashino'], prefecture: '千葉県' },

  // --------------------------------------------------------
  // JR青梅線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_nishitachikawa', name: '西立川', lat: 35.7057, lng: 139.3943, lines: ['jr_ome'], prefecture: '東京都' },
  { id: 'kt_haijima', name: '拝島', lat: 35.7327, lng: 139.3437, lines: ['jr_ome', 'jr_itsukaichi', 'jr_hachiko'], prefecture: '東京都' },
  { id: 'kt_fussa', name: '福生', lat: 35.7401, lng: 139.3260, lines: ['jr_ome'], prefecture: '東京都' },
  { id: 'kt_hamura', name: '羽村', lat: 35.7570, lng: 139.3091, lines: ['jr_ome'], prefecture: '東京都' },
  { id: 'kt_ome', name: '青梅', lat: 35.7882, lng: 139.2611, lines: ['jr_ome'], prefecture: '東京都' },

  // --------------------------------------------------------
  // JR五日市線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_kumagawa', name: '熊川', lat: 35.7314, lng: 139.3230, lines: ['jr_itsukaichi'], prefecture: '東京都' },
  { id: 'kt_musashi_masuko', name: '武蔵増戸', lat: 35.7292, lng: 139.2707, lines: ['jr_itsukaichi'], prefecture: '東京都' },
  { id: 'kt_musashi_itsukaichi', name: '武蔵五日市', lat: 35.7293, lng: 139.2379, lines: ['jr_itsukaichi'], prefecture: '東京都' },

  // --------------------------------------------------------
  // JR八高線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_higashiifune', name: '東飯能', lat: 35.8563, lng: 139.3199, lines: ['jr_hachiko'], prefecture: '埼玉県' },
  { id: 'kt_moro', name: '毛呂', lat: 35.9433, lng: 139.3115, lines: ['jr_hachiko'], prefecture: '埼玉県' },
  { id: 'kt_ogose', name: '越生', lat: 35.9637, lng: 139.2961, lines: ['jr_hachiko'], prefecture: '埼玉県' },
  { id: 'kt_yorii', name: '寄居', lat: 36.1132, lng: 139.1964, lines: ['jr_hachiko'], prefecture: '埼玉県' },

  // --------------------------------------------------------
  // JR相模線（重複しない駅）
  // --------------------------------------------------------
  { id: 'kt_samukawa', name: '寒川', lat: 35.3685, lng: 139.3805, lines: ['jr_sagami'], prefecture: '神奈川県' },
  { id: 'kt_ebina_sagami', name: '海老名', lat: 35.4461, lng: 139.3910, lines: ['jr_sagami'], prefecture: '神奈川県' },
  { id: 'kt_sobudaishita', name: '相武台下', lat: 35.4993, lng: 139.3703, lines: ['jr_sagami'], prefecture: '神奈川県' },
];

// ============================================================
// 路線データ
// ============================================================

const lines: LineData[] = [
  // --------------------------------------------------------
  // 都営地下鉄
  // --------------------------------------------------------
  {
    id: 'toei_mita',
    name: '都営三田線',
    company: '東京都交通局',
    color: '#0079C2',
    vehicleType: 'subway',
    stationIds: [
      'kt_meguro', 'kt_shirokanedai', 'kt_shirokanetakanawa', 'kt_mita',
      'kt_shibakoen', 'kt_onarimon', 'kt_uchisaiwaicho', 'kt_hibiya',
      'kt_otemachi', 'kt_jimbocho', 'kt_suidobashi', 'kt_kasuga',
      'kt_hakusan', 'kt_sengoku', 'kt_sugamo', 'kt_nishisugamo',
      'kt_shin_itabashi', 'kt_itabashi_kuyakushomae', 'kt_itabashi_honcho',
      'kt_motohasunuma', 'kt_shimura_sakaue', 'kt_shimura_sanchome',
      'kt_hasune', 'kt_nishidai', 'kt_takashimadaira',
      'kt_shin_takashimadaira', 'kt_nishi_takashimadaira',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },
  {
    id: 'toei_shinjuku',
    name: '都営新宿線',
    company: '東京都交通局',
    color: '#6CBB5A',
    vehicleType: 'subway',
    stationIds: [
      'kt_shinjuku', 'kt_shinjuku_sanchome', 'kt_akebonobashi',
      'kt_ichigaya', 'kt_kudanshita', 'kt_jimbocho', 'kt_ogawamachi',
      'kt_iwamotocho', 'kt_bakuroyokoyama', 'kt_hamacho', 'kt_morishita',
      'kt_kikukawa', 'kt_sumiyoshi', 'kt_nishiojima', 'kt_ojima',
      'kt_higashiojima', 'kt_funabori', 'kt_ichinoe', 'kt_mizue',
      'kt_shinozaki', 'kt_motoyawata',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },

  // --------------------------------------------------------
  // JR East
  // --------------------------------------------------------
  {
    id: 'jr_yamanote',
    name: 'JR山手線',
    company: 'JR東日本',
    color: '#9ACD32',
    vehicleType: 'train',
    stationIds: [
      'kt_tokyo', 'kt_kanda', 'kt_akihabara', 'kt_okachimachi', 'kt_ueno',
      'kt_uguisudani', 'kt_nippori', 'kt_nishi_nippori', 'kt_tabata',
      'kt_komagome', 'kt_sugamo', 'kt_otsuka', 'kt_ikebukuro', 'kt_mejiro',
      'kt_takadanobaba', 'kt_shin_okubo', 'kt_shinjuku', 'kt_yoyogi',
      'kt_harajuku', 'kt_shibuya', 'kt_ebisu', 'kt_meguro', 'kt_gotanda',
      'kt_osaki', 'kt_shinagawa', 'kt_takanawa_gw', 'kt_tamachi',
      'kt_hamamatsucho', 'kt_shimbashi', 'kt_yurakucho',
    ],
    isLoop: true,
    avgIntervalMinutes: 2,
  },
  {
    id: 'jr_sobu_local',
    name: 'JR総武線各停',
    company: 'JR東日本',
    color: '#FFD700',
    vehicleType: 'train',
    stationIds: [
      'kt_mitaka', 'kt_kichijoji', 'kt_nishi_ogikubo', 'kt_ogikubo',
      'kt_asagaya', 'kt_koenji', 'kt_nakano', 'kt_higashi_nakano',
      'kt_okubo', 'kt_shinjuku', 'kt_yoyogi', 'kt_sendagaya',
      'kt_shinanomachi', 'kt_yotsuya', 'kt_ichigaya', 'kt_iidabashi',
      'kt_suidobashi', 'kt_ochanomizu', 'kt_akihabara', 'kt_asakusabashi',
      'kt_ryogoku', 'kt_kinshicho', 'kt_kameido', 'kt_hirai',
      'kt_shinkoiwa', 'kt_koiwa', 'kt_ichikawa', 'kt_motoyawata',
      'kt_nishi_funabashi', 'kt_funabashi', 'kt_tsudanuma',
      'kt_makuharihongo', 'kt_makuhari', 'kt_shin_kemigawa',
      'kt_inage', 'kt_nishi_chiba', 'kt_chiba',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
    // 実際の線路形状に基づく中間座標
    trackPoints: {
      // 御茶ノ水→秋葉原: 神田川沿いにカーブして南東へ
      'kt_ochanomizu:kt_akihabara': [
        { lat: 35.6994, lng: 139.7680 },
        { lat: 35.6990, lng: 139.7710 },
      ],
      // 新小岩→小岩: 北東方向へ線路がカーブ
      'kt_shinkoiwa:kt_koiwa': [
        { lat: 35.7220, lng: 139.8640 },
        { lat: 35.7270, lng: 139.8710 },
      ],
      // 幕張→稲毛: 南東方向にカーブ（新検見川経由）
      'kt_makuhari:kt_inage': [
        { lat: 35.6490, lng: 140.0680 },
        { lat: 35.6430, lng: 140.0870 },
      ],
    },
  },
  {
    id: 'jr_saikyo',
    name: 'JR埼京線',
    company: 'JR東日本',
    color: '#008000',
    vehicleType: 'train',
    stationIds: [
      'kt_osaki', 'kt_ebisu', 'kt_shibuya', 'kt_shinjuku', 'kt_ikebukuro',
      'kt_itabashi', 'kt_jujo', 'kt_akabane', 'kt_kita_akabane',
      'kt_ukimafunado', 'kt_todakoen', 'kt_toda', 'kt_kitatoda',
      'kt_musashi_urawa', 'kt_naka_urawa', 'kt_minami_yono',
      'kt_yono_honmachi', 'kt_kita_yono', 'kt_omiya',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
    // 実際の線路形状に基づく中間座標（線路カーブの再現用）
    trackPoints: {
      // 大崎→恵比寿: 目黒川沿いを北西に曲がる
      'kt_osaki:kt_ebisu': [
        { lat: 35.6240, lng: 139.7250 },
        { lat: 35.6310, lng: 139.7210 },
        { lat: 35.6380, lng: 139.7150 },
      ],
      // 恵比寿→渋谷: やや西寄りにカーブ
      'kt_ebisu:kt_shibuya': [
        { lat: 35.6510, lng: 139.7070 },
      ],
      // 渋谷→新宿: 北へ大きくカーブ（代々木経由の線路形状）
      'kt_shibuya:kt_shinjuku': [
        { lat: 35.6630, lng: 139.7010 },
        { lat: 35.6700, lng: 139.7005 },
        { lat: 35.6780, lng: 139.7000 },
        { lat: 35.6840, lng: 139.7003 },
      ],
      // 新宿→池袋: 山手線に沿って北東へ
      'kt_shinjuku:kt_ikebukuro': [
        { lat: 35.6950, lng: 139.7030 },
        { lat: 35.7020, lng: 139.7040 },
        { lat: 35.7100, lng: 139.7055 },
        { lat: 35.7200, lng: 139.7080 },
      ],
      // 赤羽→北赤羽: 荒川手前で西にカーブ
      'kt_akabane:kt_kita_akabane': [
        { lat: 35.7820, lng: 139.7170 },
      ],
      // 北赤羽→浮間舟渡: 荒川を渡る区間
      'kt_kita_akabane:kt_ukimafunado': [
        { lat: 35.7900, lng: 139.7010 },
      ],
    },
  },
  {
    id: 'jr_keiyo',
    name: 'JR京葉線',
    company: 'JR東日本',
    color: '#CD0000',
    vehicleType: 'train',
    stationIds: [
      'kt_tokyo', 'kt_hacchobori', 'kt_ecchujima', 'kt_shiomi',
      'kt_shin_kiba', 'kt_kasai_rinkai_koen', 'kt_maihama',
      'kt_shin_urayasu', 'kt_ichikawa_shiohama', 'kt_futamata_shinmachi',
      'kt_minami_funabashi', 'kt_shin_narashino', 'kt_kaihimmakuhari',
      'kt_kemigawahama', 'kt_inage_kaigan', 'kt_chiba_minato', 'kt_soga',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
    // 東京湾岸沿いの実線路形状
    trackPoints: {
      // 潮見→新木場: 湾岸エリアを南東へカーブ
      'kt_shiomi:kt_shin_kiba': [
        { lat: 35.6540, lng: 139.8080 },
        { lat: 35.6510, lng: 139.8160 },
      ],
      // 新木場→葛西臨海公園: 東京湾沿いに東へ大きくカーブ
      'kt_shin_kiba:kt_kasai_rinkai_koen': [
        { lat: 35.6430, lng: 139.8350 },
        { lat: 35.6400, lng: 139.8430 },
        { lat: 35.6390, lng: 139.8530 },
      ],
      // 葛西臨海公園→舞浜: 旧江戸川を渡って東へ
      'kt_kasai_rinkai_koen:kt_maihama': [
        { lat: 35.6360, lng: 139.8700 },
        { lat: 35.6340, lng: 139.8770 },
      ],
      // 新習志野→海浜幕張: 湾岸を東へ
      'kt_shin_narashino:kt_kaihimmakuhari': [
        { lat: 35.6510, lng: 140.0150 },
        { lat: 35.6500, lng: 140.0250 },
      ],
    },
  },
  {
    id: 'jr_joban',
    name: 'JR常磐線快速',
    company: 'JR東日本',
    color: '#00868B',
    vehicleType: 'train',
    stationIds: [
      'kt_ueno', 'kt_nippori', 'kt_mikawashima', 'kt_minami_senju',
      'kt_kita_senju', 'kt_matsudo', 'kt_kashiwa', 'kt_abiko', 'kt_tennodai', 'kt_toride',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },
  {
    id: 'jr_shonan_shinjuku',
    name: 'JR湘南新宿ライン',
    company: 'JR東日本',
    color: '#E8530E',
    vehicleType: 'train',
    stationIds: [
      'kt_omiya', 'kt_urawa', 'kt_akabane', 'kt_ikebukuro', 'kt_shinjuku',
      'kt_shibuya', 'kt_ebisu', 'kt_osaki', 'kt_nishioi',
      'kt_musashi_kosugi', 'kt_yokohama', 'kt_totsuka', 'kt_ofuna',
      'kt_fujisawa', 'kt_chigasaki', 'kt_hiratsuka',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },
  {
    id: 'jr_yokohama',
    name: 'JR横浜線',
    company: 'JR東日本',
    color: '#7FC97F',
    vehicleType: 'train',
    stationIds: [
      'kt_higashi_kanagawa', 'kt_kikuna', 'kt_shin_yokohama', 'kt_kamoi',
      'kt_nakayama', 'kt_nagatsuta', 'kt_machida', 'kt_sagamihara',
      'kt_hashimoto', 'kt_hachioji',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },
  {
    id: 'jr_nambu',
    name: 'JR南武線',
    company: 'JR東日本',
    color: '#FFD700',
    vehicleType: 'train',
    stationIds: [
      'kt_kawasaki', 'kt_kashimada', 'kt_musashi_kosugi',
      'kt_musashi_nakahara', 'kt_musashi_shinjo', 'kt_musashi_mizonokuchi',
      'kt_noborito', 'kt_inadazutsumi', 'kt_fuchu_honmachi',
      'kt_bubaigawara', 'kt_tachikawa',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },

  // --------------------------------------------------------
  // 横浜市営地下鉄
  // --------------------------------------------------------
  {
    id: 'yokohama_blue',
    name: 'ブルーライン',
    company: '横浜市交通局',
    color: '#0068B7',
    vehicleType: 'subway',
    stationIds: [
      'kt_azamino', 'kt_center_kita', 'kt_center_minami',
      'kt_shin_yokohama', 'kt_yokohama', 'kt_sakuragicho', 'kt_kannai',
      'kt_kamiooka', 'kt_totsuka', 'kt_shonandai',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },
  {
    id: 'yokohama_green',
    name: 'グリーンライン',
    company: '横浜市交通局',
    color: '#6CBB5A',
    vehicleType: 'subway',
    stationIds: [
      'kt_nakayama', 'kt_center_minami', 'kt_center_kita', 'kt_hiyoshi',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },

  // --------------------------------------------------------
  // その他
  // --------------------------------------------------------
  {
    id: 'tx',
    name: 'つくばエクスプレス',
    company: '首都圏新都市鉄道',
    color: '#CC0066',
    vehicleType: 'train',
    stationIds: [
      'kt_akihabara', 'kt_shin_okachimachi', 'kt_asakusa',
      'kt_minami_senju', 'kt_kita_senju',
      'kt_yashio', 'kt_minami_nagareyama', 'kt_nagareyama_otakanomori',
      'kt_kashiwanoha_campus', 'kt_moriya', 'kt_tsukuba',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },
  {
    id: 'yurikamome',
    name: 'ゆりかもめ',
    company: 'ゆりかもめ',
    color: '#FFD700',
    vehicleType: 'monorail',
    stationIds: [
      'kt_shimbashi', 'kt_shiodome', 'kt_takeshiba', 'kt_hinode',
      'kt_odaiba_kaihinkoen', 'kt_daiba', 'kt_aomi',
      'kt_ariake', 'kt_toyosu',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },
  {
    id: 'tokyo_monorail',
    name: '東京モノレール',
    company: '東京モノレール',
    color: '#FF4500',
    vehicleType: 'monorail',
    stationIds: [
      'kt_hamamatsucho', 'kt_tennozu_isle', 'kt_ryutsu_center',
      'kt_tenkubashi', 'kt_haneda_t1', 'kt_haneda_t2',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },
  {
    id: 'rinkai',
    name: 'りんかい線',
    company: '東京臨海高速鉄道',
    color: '#009BBF',
    vehicleType: 'train',
    stationIds: [
      'kt_shin_kiba', 'kt_tokyo_teleport', 'kt_tennozu_isle',
      'kt_shinagawa_seaside', 'kt_oimachi', 'kt_osaki',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },
  {
    id: 'jr_chuo_rapid',
    name: 'JR中央快速線',
    company: 'JR東日本',
    color: '#F15A22',
    vehicleType: 'train',
    stationIds: [
      'kt_tokyo', 'kt_kanda', 'kt_ochanomizu', 'kt_yotsuya', 'kt_shinjuku',
      'kt_nakano', 'kt_ogikubo', 'kt_kichijoji', 'kt_mitaka',
      'kt_kokubunji', 'kt_tachikawa', 'kt_hachioji', 'kt_takao',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },
  {
    id: 'jr_keihin_tohoku',
    name: 'JR京浜東北線',
    company: 'JR東日本',
    color: '#00B2E5',
    vehicleType: 'train',
    stationIds: [
      'kt_omiya', 'kt_saitama_shintoshin', 'kt_urawa', 'kt_minami_urawa',
      'kt_warabi', 'kt_nishi_kawaguchi', 'kt_kawaguchi', 'kt_akabane',
      'kt_higashi_jujo', 'kt_kami_nakazato', 'kt_tabata',
      'kt_nishi_nippori', 'kt_nippori', 'kt_uguisudani', 'kt_ueno',
      'kt_okachimachi', 'kt_akihabara', 'kt_kanda', 'kt_tokyo',
      'kt_shimbashi', 'kt_hamamatsucho', 'kt_tamachi', 'kt_takanawa_gw',
      'kt_shinagawa', 'kt_oimachi', 'kt_oomori', 'kt_kamata',
      'kt_kawasaki', 'kt_tsurumi', 'kt_higashi_kanagawa', 'kt_yokohama',
      'kt_sakuragicho', 'kt_kannai', 'kt_ishikawacho', 'kt_negishi',
      'kt_isogo', 'kt_shin_sugita', 'kt_ofuna',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },
  {
    id: 'jr_tokaido',
    name: 'JR東海道線',
    company: 'JR東日本',
    color: '#F68B1E',
    vehicleType: 'train',
    stationIds: [
      'kt_tokyo', 'kt_shimbashi', 'kt_shinagawa', 'kt_kawasaki',
      'kt_yokohama', 'kt_totsuka', 'kt_ofuna', 'kt_fujisawa',
      'kt_chigasaki', 'kt_hiratsuka', 'kt_odawara_jr', 'kt_atami',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },
  {
    id: 'jr_yokosuka',
    name: 'JR横須賀線',
    company: 'JR東日本',
    color: '#0067C0',
    vehicleType: 'train',
    stationIds: [
      'kt_tokyo', 'kt_shimbashi', 'kt_shinagawa', 'kt_nishioi',
      'kt_musashi_kosugi', 'kt_yokohama', 'kt_totsuka', 'kt_ofuna',
      'kt_kita_kamakura', 'kt_kamakura', 'kt_zushi', 'kt_yokosuka',
      'kt_kurihama',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },
  {
    id: 'jr_sobu_rapid',
    name: 'JR総武快速線',
    company: 'JR東日本',
    color: '#0067C0',
    vehicleType: 'train',
    stationIds: [
      'kt_tokyo', 'kt_shin_nihombashi', 'kt_bakurocho', 'kt_kinshicho',
      'kt_shinkoiwa', 'kt_ichikawa', 'kt_funabashi', 'kt_tsudanuma',
      'kt_chiba',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },
  {
    id: 'jr_joban_local',
    name: 'JR常磐線各停',
    company: 'JR東日本',
    color: '#00B251',
    vehicleType: 'train',
    stationIds: [
      'kt_ayase', 'kt_kanamachi', 'kt_matsudo', 'kt_kitakogane',
      'kt_kashiwa', 'kt_abiko',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },
  {
    id: 'jr_ueno_tokyo',
    name: 'JR上野東京ライン',
    company: 'JR東日本',
    color: '#F68B1E',
    vehicleType: 'train',
    stationIds: [
      'kt_ueno', 'kt_tokyo', 'kt_shimbashi', 'kt_shinagawa',
      'kt_kawasaki', 'kt_yokohama', 'kt_totsuka', 'kt_ofuna',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },
  {
    id: 'jr_musashino',
    name: 'JR武蔵野線',
    company: 'JR東日本',
    color: '#F15A22',
    vehicleType: 'train',
    stationIds: [
      'kt_fuchu_honmachi', 'kt_kita_fuchu', 'kt_nishikokubunji',
      'kt_shin_akitsu', 'kt_higashi_tokorozawa', 'kt_shin_za',
      'kt_kita_asaka', 'kt_musashi_urawa', 'kt_minami_urawa',
      'kt_higashiurawa', 'kt_higashikawaguchi', 'kt_minami_koshigaya',
      'kt_koshigaya_laketown', 'kt_misato', 'kt_minami_nagareyama',
      'kt_shin_matsudo', 'kt_shin_yahashira', 'kt_ichikawa_ono',
      'kt_funabashihoten', 'kt_nishi_funabashi',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },
  {
    id: 'jr_ome',
    name: 'JR青梅線',
    company: 'JR東日本',
    color: '#F15A22',
    vehicleType: 'train',
    stationIds: [
      'kt_tachikawa', 'kt_nishitachikawa', 'kt_haijima',
      'kt_fussa', 'kt_hamura', 'kt_ome',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },
  {
    id: 'jr_itsukaichi',
    name: 'JR五日市線',
    company: 'JR東日本',
    color: '#F15A22',
    vehicleType: 'train',
    stationIds: [
      'kt_haijima', 'kt_kumagawa', 'kt_musashi_masuko',
      'kt_musashi_itsukaichi',
    ],
    isLoop: false,
    avgIntervalMinutes: 10,
  },
  {
    id: 'jr_hachiko',
    name: 'JR八高線',
    company: 'JR東日本',
    color: '#808080',
    vehicleType: 'train',
    stationIds: [
      'kt_hachioji', 'kt_haijima', 'kt_higashiifune',
      'kt_moro', 'kt_ogose', 'kt_yorii',
    ],
    isLoop: false,
    avgIntervalMinutes: 15,
  },
  {
    id: 'jr_sagami',
    name: 'JR相模線',
    company: 'JR東日本',
    color: '#808080',
    vehicleType: 'train',
    stationIds: [
      'kt_chigasaki', 'kt_samukawa', 'kt_ebina_sagami',
      'kt_sobudaishita', 'kt_hashimoto',
    ],
    isLoop: false,
    avgIntervalMinutes: 10,
  },
];

// ============================================================
// エクスポート
// ============================================================

export const kantoJrData: RegionData = { stations, lines };
