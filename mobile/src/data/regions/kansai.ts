/**
 * 関西地方（大阪・京都・神戸・奈良）鉄道データ
 *
 * 大阪メトロ、JR西日本、阪急電鉄、阪神電鉄、京都市営地下鉄、近鉄、南海電鉄
 */

import { StationData, LineData, RegionData } from '../types';

// ============================================================
// 駅データ（全路線共通・重複統合済み）
// ============================================================

const stations: StationData[] = [
  // --------------------------------------------------------
  // 大阪メトロ 御堂筋線
  // --------------------------------------------------------
  { id: 'ks_esaka', name: '江坂', lat: 34.7607, lng: 135.4996, lines: ['osaka_midosuji'], prefecture: '大阪府' },
  { id: 'ks_higashimikuni', name: '東三国', lat: 34.7520, lng: 135.5072, lines: ['osaka_midosuji'], prefecture: '大阪府' },
  { id: 'ks_shin_osaka', name: '新大阪', lat: 34.7334, lng: 135.5001, lines: ['osaka_midosuji', 'jr_tokaido_west'], prefecture: '大阪府' },
  { id: 'ks_nishinakajima_minamigata', name: '西中島南方', lat: 34.7266, lng: 135.5004, lines: ['osaka_midosuji'], prefecture: '大阪府' },
  { id: 'ks_nakatsu_midosuji', name: '中津', lat: 34.7118, lng: 135.4964, lines: ['osaka_midosuji'], prefecture: '大阪府' },
  { id: 'ks_umeda', name: '梅田', lat: 34.7046, lng: 135.4992, lines: ['osaka_midosuji', 'hankyu_kobe', 'hankyu_kyoto', 'hankyu_takarazuka', 'hanshin_main'], prefecture: '大阪府' },
  { id: 'ks_yodoyabashi', name: '淀屋橋', lat: 34.6934, lng: 135.5027, lines: ['osaka_midosuji'], prefecture: '大阪府' },
  { id: 'ks_honmachi', name: '本町', lat: 34.6840, lng: 135.5006, lines: ['osaka_midosuji', 'osaka_yotsubashi', 'osaka_chuo'], prefecture: '大阪府' },
  { id: 'ks_shinsaibashi', name: '心斎橋', lat: 34.6753, lng: 135.5007, lines: ['osaka_midosuji', 'osaka_nagahori'], prefecture: '大阪府' },
  { id: 'ks_namba', name: 'なんば', lat: 34.6659, lng: 135.5013, lines: ['osaka_midosuji', 'osaka_yotsubashi', 'osaka_sennichimae', 'kintetsu_nara', 'nankai_main', 'nankai_koya'], prefecture: '大阪府' },
  { id: 'ks_daikokucho', name: '大国町', lat: 34.6588, lng: 135.4960, lines: ['osaka_midosuji', 'osaka_yotsubashi'], prefecture: '大阪府' },
  { id: 'ks_dobutsuen_mae', name: '動物園前', lat: 34.6521, lng: 135.5062, lines: ['osaka_midosuji', 'osaka_sakaisuji'], prefecture: '大阪府' },
  { id: 'ks_tennoji', name: '天王寺', lat: 34.6465, lng: 135.5149, lines: ['osaka_midosuji', 'osaka_tanimachi', 'jr_osaka_loop', 'jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_showamachi', name: '昭和町', lat: 34.6388, lng: 135.5155, lines: ['osaka_midosuji'], prefecture: '大阪府' },
  { id: 'ks_nishitanabe', name: '西田辺', lat: 34.6310, lng: 135.5155, lines: ['osaka_midosuji'], prefecture: '大阪府' },
  { id: 'ks_nagai', name: '長居', lat: 34.6155, lng: 135.5188, lines: ['osaka_midosuji', 'jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_abiko', name: 'あびこ', lat: 34.6073, lng: 135.5194, lines: ['osaka_midosuji'], prefecture: '大阪府' },
  { id: 'ks_kitahanada', name: '北花田', lat: 34.5944, lng: 135.5170, lines: ['osaka_midosuji'], prefecture: '大阪府' },
  { id: 'ks_shinkanaoka', name: '新金岡', lat: 34.5836, lng: 135.5156, lines: ['osaka_midosuji'], prefecture: '大阪府' },
  { id: 'ks_nakamozu', name: 'なかもず', lat: 34.5728, lng: 135.5101, lines: ['osaka_midosuji'], prefecture: '大阪府' },

  // --------------------------------------------------------
  // 大阪メトロ 谷町線（御堂筋線と重複しない駅）
  // --------------------------------------------------------
  { id: 'ks_dainichi', name: '大日', lat: 34.7362, lng: 135.5756, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_moriguchi', name: '守口', lat: 34.7317, lng: 135.5635, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_taishibashi_imamichi', name: '太子橋今市', lat: 34.7253, lng: 135.5554, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_senbayashi_omiya', name: '千林大宮', lat: 34.7190, lng: 135.5475, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_sekime_takadono', name: '関目高殿', lat: 34.7141, lng: 135.5427, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_noe_uchindai', name: '野江内代', lat: 34.7078, lng: 135.5367, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_miyakojima', name: '都島', lat: 34.7042, lng: 135.5277, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_tenjimbashisuji6', name: '天神橋筋六丁目', lat: 34.7039, lng: 135.5167, lines: ['osaka_tanimachi', 'osaka_sakaisuji'], prefecture: '大阪府' },
  { id: 'ks_nakazakicho', name: '中崎町', lat: 34.7071, lng: 135.5079, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_higashi_umeda', name: '東梅田', lat: 34.7033, lng: 135.5017, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_minamimorimachi', name: '南森町', lat: 34.6979, lng: 135.5115, lines: ['osaka_tanimachi', 'osaka_sakaisuji'], prefecture: '大阪府' },
  { id: 'ks_temmabashi', name: '天満橋', lat: 34.6929, lng: 135.5171, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_tanimachi4', name: '谷町四丁目', lat: 34.6846, lng: 135.5196, lines: ['osaka_tanimachi', 'osaka_chuo'], prefecture: '大阪府' },
  { id: 'ks_tanimachi6', name: '谷町六丁目', lat: 34.6758, lng: 135.5177, lines: ['osaka_tanimachi', 'osaka_nagahori'], prefecture: '大阪府' },
  { id: 'ks_tanimachi9', name: '谷町九丁目', lat: 34.6677, lng: 135.5175, lines: ['osaka_tanimachi', 'osaka_sennichimae'], prefecture: '大阪府' },
  { id: 'ks_shitennoji_mae', name: '四天王寺前夕陽ヶ丘', lat: 34.6570, lng: 135.5179, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  // 天王寺はks_tennojiで定義済み
  { id: 'ks_abeno', name: '阿倍野', lat: 34.6422, lng: 135.5162, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_fuminosato', name: '文の里', lat: 34.6359, lng: 135.5172, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_tanabe', name: '田辺', lat: 34.6273, lng: 135.5190, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_komagawa_nakano', name: '駒川中野', lat: 34.6193, lng: 135.5238, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_hirano', name: '平野', lat: 34.6120, lng: 135.5355, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_kire_uriwari', name: '喜連瓜破', lat: 34.6037, lng: 135.5435, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_deto', name: '出戸', lat: 34.5970, lng: 135.5487, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_nagahara', name: '長原', lat: 34.5901, lng: 135.5537, lines: ['osaka_tanimachi'], prefecture: '大阪府' },
  { id: 'ks_yao_minami', name: '八尾南', lat: 34.5870, lng: 135.5747, lines: ['osaka_tanimachi'], prefecture: '大阪府' },

  // --------------------------------------------------------
  // 大阪メトロ 四つ橋線（重複しない駅）
  // --------------------------------------------------------
  { id: 'ks_nishi_umeda', name: '西梅田', lat: 34.6985, lng: 135.4938, lines: ['osaka_yotsubashi'], prefecture: '大阪府' },
  { id: 'ks_higobashi', name: '肥後橋', lat: 34.6913, lng: 135.4953, lines: ['osaka_yotsubashi'], prefecture: '大阪府' },
  // 本町はks_honmachiで定義済み
  { id: 'ks_yotsubashi', name: '四ツ橋', lat: 34.6753, lng: 135.4961, lines: ['osaka_yotsubashi'], prefecture: '大阪府' },
  // なんばはks_nambaで定義済み、大国町はks_daikokuchoで定義済み
  { id: 'ks_hanazonomachi', name: '花園町', lat: 34.6517, lng: 135.4903, lines: ['osaka_yotsubashi'], prefecture: '大阪府' },
  { id: 'ks_kishinosato', name: '岸里', lat: 34.6449, lng: 135.4905, lines: ['osaka_yotsubashi'], prefecture: '大阪府' },
  { id: 'ks_tamade', name: '玉出', lat: 34.6358, lng: 135.4870, lines: ['osaka_yotsubashi'], prefecture: '大阪府' },
  { id: 'ks_kitakagaya', name: '北加賀屋', lat: 34.6260, lng: 135.4805, lines: ['osaka_yotsubashi'], prefecture: '大阪府' },
  { id: 'ks_suminoe_koen', name: '住之江公園', lat: 34.6155, lng: 135.4759, lines: ['osaka_yotsubashi'], prefecture: '大阪府' },

  // --------------------------------------------------------
  // 大阪メトロ 中央線（重複しない駅）
  // --------------------------------------------------------
  { id: 'ks_cosmosquare', name: 'コスモスクエア', lat: 34.6440, lng: 135.4154, lines: ['osaka_chuo'], prefecture: '大阪府' },
  { id: 'ks_osakako', name: '大阪港', lat: 34.6534, lng: 135.4330, lines: ['osaka_chuo'], prefecture: '大阪府' },
  { id: 'ks_asashiobashi', name: '朝潮橋', lat: 34.6589, lng: 135.4451, lines: ['osaka_chuo'], prefecture: '大阪府' },
  { id: 'ks_bentencho', name: '弁天町', lat: 34.6620, lng: 135.4610, lines: ['osaka_chuo', 'jr_osaka_loop'], prefecture: '大阪府' },
  { id: 'ks_kujo', name: '九条', lat: 34.6719, lng: 135.4696, lines: ['osaka_chuo'], prefecture: '大阪府' },
  { id: 'ks_awaza', name: '阿波座', lat: 34.6810, lng: 135.4843, lines: ['osaka_chuo'], prefecture: '大阪府' },
  // 本町はks_honmachiで定義済み
  { id: 'ks_sakaisuji_honmachi', name: '堺筋本町', lat: 34.6839, lng: 135.5091, lines: ['osaka_chuo', 'osaka_sakaisuji'], prefecture: '大阪府' },
  // 谷町四丁目はks_tanimachi4で定義済み
  { id: 'ks_morinomiya', name: '森ノ宮', lat: 34.6821, lng: 135.5319, lines: ['osaka_chuo', 'osaka_nagahori', 'jr_osaka_loop'], prefecture: '大阪府' },
  { id: 'ks_midoribashi', name: '緑橋', lat: 34.6807, lng: 135.5449, lines: ['osaka_chuo'], prefecture: '大阪府' },
  { id: 'ks_fukaebashi', name: '深江橋', lat: 34.6795, lng: 135.5556, lines: ['osaka_chuo'], prefecture: '大阪府' },
  { id: 'ks_takaida', name: '高井田', lat: 34.6793, lng: 135.5660, lines: ['osaka_chuo'], prefecture: '大阪府' },
  { id: 'ks_nagata', name: '長田', lat: 34.6791, lng: 135.5789, lines: ['osaka_chuo'], prefecture: '大阪府' },

  // --------------------------------------------------------
  // 大阪メトロ 千日前線（重複しない駅）
  // --------------------------------------------------------
  { id: 'ks_noda_hanshin', name: '野田阪神', lat: 34.6889, lng: 135.4726, lines: ['osaka_sennichimae', 'hanshin_main'], prefecture: '大阪府' },
  { id: 'ks_tamagawa', name: '玉川', lat: 34.6867, lng: 135.4799, lines: ['osaka_sennichimae'], prefecture: '大阪府' },
  { id: 'ks_nishi_nagahori', name: '西長堀', lat: 34.6725, lng: 135.4870, lines: ['osaka_sennichimae', 'osaka_nagahori'], prefecture: '大阪府' },
  { id: 'ks_sakuragawa', name: '桜川', lat: 34.6680, lng: 135.4915, lines: ['osaka_sennichimae'], prefecture: '大阪府' },
  // なんばはks_nambaで定義済み
  { id: 'ks_nihonbashi', name: '日本橋', lat: 34.6618, lng: 135.5079, lines: ['osaka_sennichimae', 'osaka_sakaisuji', 'kintetsu_nara'], prefecture: '大阪府' },
  // 谷町九丁目はks_tanimachi9で定義済み
  { id: 'ks_tsuruhashi', name: '鶴橋', lat: 34.6679, lng: 135.5299, lines: ['osaka_sennichimae', 'jr_osaka_loop', 'kintetsu_nara', 'kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_imazato', name: '今里', lat: 34.6679, lng: 135.5449, lines: ['osaka_sennichimae'], prefecture: '大阪府' },
  { id: 'ks_shinfukae', name: '新深江', lat: 34.6679, lng: 135.5555, lines: ['osaka_sennichimae'], prefecture: '大阪府' },
  { id: 'ks_shoji', name: '小路', lat: 34.6637, lng: 135.5622, lines: ['osaka_sennichimae'], prefecture: '大阪府' },
  { id: 'ks_kitatatsumi', name: '北巽', lat: 34.6581, lng: 135.5682, lines: ['osaka_sennichimae'], prefecture: '大阪府' },
  { id: 'ks_minamitatsumi', name: '南巽', lat: 34.6504, lng: 135.5740, lines: ['osaka_sennichimae'], prefecture: '大阪府' },

  // --------------------------------------------------------
  // 大阪メトロ 堺筋線（重複しない駅）
  // --------------------------------------------------------
  // 天神橋筋六丁目はks_tenjimbashisuji6で定義済み
  { id: 'ks_ogimachi', name: '扇町', lat: 34.7028, lng: 135.5130, lines: ['osaka_sakaisuji'], prefecture: '大阪府' },
  // 南森町はks_minamimorimachi定義済み
  { id: 'ks_kitahama', name: '北浜', lat: 34.6919, lng: 135.5095, lines: ['osaka_sakaisuji'], prefecture: '大阪府' },
  // 堺筋本町はks_sakaisuji_honmachi定義済み
  { id: 'ks_nagahoribashi', name: '長堀橋', lat: 34.6745, lng: 135.5094, lines: ['osaka_sakaisuji', 'osaka_nagahori'], prefecture: '大阪府' },
  // 日本橋はks_nihonbashi定義済み
  { id: 'ks_ebisucho', name: '恵美須町', lat: 34.6490, lng: 135.5057, lines: ['osaka_sakaisuji'], prefecture: '大阪府' },
  // 動物園前はks_dobutsuen_mae定義済み
  { id: 'ks_tengachaya', name: '天下茶屋', lat: 34.6384, lng: 135.4987, lines: ['osaka_sakaisuji', 'nankai_main'], prefecture: '大阪府' },

  // --------------------------------------------------------
  // 大阪メトロ 長堀鶴見緑地線（重複しない駅）
  // --------------------------------------------------------
  { id: 'ks_taisho', name: '大正', lat: 34.6566, lng: 135.4714, lines: ['osaka_nagahori', 'jr_osaka_loop'], prefecture: '大阪府' },
  { id: 'ks_dome_mae_chiyozaki', name: 'ドーム前千代崎', lat: 34.6641, lng: 135.4750, lines: ['osaka_nagahori'], prefecture: '大阪府' },
  // 西長堀はks_nishi_nagahori定義済み
  { id: 'ks_nishi_ohashi', name: '西大橋', lat: 34.6725, lng: 135.4941, lines: ['osaka_nagahori'], prefecture: '大阪府' },
  // 心斎橋はks_shinsaibashi定義済み、長堀橋はks_nagahoribashi定義済み
  { id: 'ks_matsuyamachi', name: '松屋町', lat: 34.6728, lng: 135.5149, lines: ['osaka_nagahori'], prefecture: '大阪府' },
  // 谷町六丁目はks_tanimachi6定義済み
  { id: 'ks_tamatsukuri', name: '玉造', lat: 34.6758, lng: 135.5305, lines: ['osaka_nagahori', 'jr_osaka_loop'], prefecture: '大阪府' },
  // 森ノ宮はks_morinomiya定義済み
  { id: 'ks_osaka_business_park', name: '大阪ビジネスパーク', lat: 34.6878, lng: 135.5353, lines: ['osaka_nagahori'], prefecture: '大阪府' },
  { id: 'ks_kyobashi', name: '京橋', lat: 34.6960, lng: 135.5357, lines: ['osaka_nagahori', 'jr_osaka_loop'], prefecture: '大阪府' },
  { id: 'ks_gamo4', name: '蒲生四丁目', lat: 34.7000, lng: 135.5457, lines: ['osaka_nagahori'], prefecture: '大阪府' },
  { id: 'ks_imafuku_tsurumi', name: '今福鶴見', lat: 34.7037, lng: 135.5575, lines: ['osaka_nagahori'], prefecture: '大阪府' },
  { id: 'ks_yokozutsumi', name: '横堤', lat: 34.7070, lng: 135.5696, lines: ['osaka_nagahori'], prefecture: '大阪府' },
  { id: 'ks_tsurumi_ryokuchi', name: '鶴見緑地', lat: 34.7090, lng: 135.5825, lines: ['osaka_nagahori'], prefecture: '大阪府' },
  { id: 'ks_kadoma_minami', name: '門真南', lat: 34.7125, lng: 135.5974, lines: ['osaka_nagahori'], prefecture: '大阪府' },

  // --------------------------------------------------------
  // JR大阪環状線（重複しない駅）
  // --------------------------------------------------------
  { id: 'ks_osaka', name: '大阪', lat: 34.7024, lng: 135.4959, lines: ['jr_osaka_loop', 'jr_tokaido_west'], prefecture: '大阪府' },
  { id: 'ks_fukushima_jr', name: '福島', lat: 34.6974, lng: 135.4871, lines: ['jr_osaka_loop'], prefecture: '大阪府' },
  { id: 'ks_noda_jr', name: '野田', lat: 34.6914, lng: 135.4766, lines: ['jr_osaka_loop'], prefecture: '大阪府' },
  { id: 'ks_nishikujo', name: '西九条', lat: 34.6822, lng: 135.4654, lines: ['jr_osaka_loop'], prefecture: '大阪府' },
  // 弁天町はks_bentencho定義済み、大正はks_taisho定義済み
  { id: 'ks_ashiharabashi', name: '芦原橋', lat: 34.6570, lng: 135.4883, lines: ['jr_osaka_loop'], prefecture: '大阪府' },
  { id: 'ks_imamiya', name: '今宮', lat: 34.6529, lng: 135.4947, lines: ['jr_osaka_loop'], prefecture: '大阪府' },
  { id: 'ks_shin_imamiya', name: '新今宮', lat: 34.6491, lng: 135.5008, lines: ['jr_osaka_loop', 'nankai_main', 'nankai_koya'], prefecture: '大阪府' },
  // 天王寺はks_tennoji定義済み
  { id: 'ks_teradacho', name: '寺田町', lat: 34.6489, lng: 135.5217, lines: ['jr_osaka_loop'], prefecture: '大阪府' },
  { id: 'ks_momodani', name: '桃谷', lat: 34.6559, lng: 135.5277, lines: ['jr_osaka_loop'], prefecture: '大阪府' },
  // 鶴橋はks_tsuruhashi定義済み、玉造はks_tamatsukuri定義済み、森ノ宮はks_morinomiya定義済み
  { id: 'ks_osakajo_koen', name: '大阪城公園', lat: 34.6893, lng: 135.5339, lines: ['jr_osaka_loop'], prefecture: '大阪府' },
  // 京橋はks_kyobashi定義済み
  { id: 'ks_sakuranomiya', name: '桜ノ宮', lat: 34.7006, lng: 135.5241, lines: ['jr_osaka_loop'], prefecture: '大阪府' },
  { id: 'ks_temma', name: '天満', lat: 34.7042, lng: 135.5130, lines: ['jr_osaka_loop'], prefecture: '大阪府' },

  // --------------------------------------------------------
  // JR東海道本線・京都線・神戸線（重複しない駅）
  // --------------------------------------------------------
  { id: 'ks_kyoto', name: '京都', lat: 34.9858, lng: 135.7588, lines: ['jr_tokaido_west', 'kyoto_karasuma'], prefecture: '京都府' },
  { id: 'ks_yamashina', name: '山科', lat: 34.9706, lng: 135.8168, lines: ['jr_tokaido_west', 'kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_otsu', name: '大津', lat: 34.9851, lng: 135.8520, lines: ['jr_tokaido_west'], prefecture: '滋賀県' },
  { id: 'ks_takatsuki_jr', name: '高槻', lat: 34.8482, lng: 135.6175, lines: ['jr_tokaido_west'], prefecture: '大阪府' },
  { id: 'ks_ibaraki_jr', name: '茨木', lat: 34.8200, lng: 135.5622, lines: ['jr_tokaido_west'], prefecture: '大阪府' },
  // 新大阪はks_shin_osaka定義済み、大阪はks_osaka定義済み
  { id: 'ks_amagasaki_jr', name: '尼崎', lat: 34.7334, lng: 135.4283, lines: ['jr_tokaido_west'], prefecture: '兵庫県' },
  { id: 'ks_nishinomiya_jr', name: '西宮', lat: 34.7355, lng: 135.3415, lines: ['jr_tokaido_west'], prefecture: '兵庫県' },
  { id: 'ks_ashiya_jr', name: '芦屋', lat: 34.7275, lng: 135.3038, lines: ['jr_tokaido_west'], prefecture: '兵庫県' },
  { id: 'ks_sumiyoshi_jr', name: '住吉', lat: 34.7214, lng: 135.2753, lines: ['jr_tokaido_west'], prefecture: '兵庫県' },
  { id: 'ks_sannomiya', name: '三ノ宮', lat: 34.6937, lng: 135.1950, lines: ['jr_tokaido_west'], prefecture: '兵庫県' },
  { id: 'ks_motomachi', name: '元町', lat: 34.6899, lng: 135.1866, lines: ['jr_tokaido_west', 'hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_kobe', name: '神戸', lat: 34.6798, lng: 135.1787, lines: ['jr_tokaido_west'], prefecture: '兵庫県' },
  { id: 'ks_hyogo', name: '兵庫', lat: 34.6672, lng: 135.1651, lines: ['jr_tokaido_west'], prefecture: '兵庫県' },
  { id: 'ks_akashi', name: '明石', lat: 34.6482, lng: 134.9961, lines: ['jr_tokaido_west'], prefecture: '兵庫県' },

  // --------------------------------------------------------
  // JR阪和線（重複しない駅）
  // --------------------------------------------------------
  // 天王寺はks_tennoji定義済み
  { id: 'ks_bishouen', name: '美章園', lat: 34.6395, lng: 135.5198, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_minamitanabe', name: '南田辺', lat: 34.6312, lng: 135.5226, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_tsurugaoka', name: '鶴ヶ丘', lat: 34.6233, lng: 135.5225, lines: ['jr_hanwa'], prefecture: '大阪府' },
  // 長居はks_nagai定義済み
  { id: 'ks_abikochoJR', name: '我孫子町', lat: 34.6077, lng: 135.5218, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_sugimotocho', name: '杉本町', lat: 34.5993, lng: 135.5179, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_asaka', name: '浅香', lat: 34.5919, lng: 135.5112, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_sakaishi', name: '堺市', lat: 34.5827, lng: 135.5033, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_mikunigaoka', name: '三国ヶ丘', lat: 34.5567, lng: 135.4956, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_mozu', name: '百舌鳥', lat: 34.5501, lng: 135.4891, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_uenoshiba', name: '上野芝', lat: 34.5426, lng: 135.4814, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_tsukuno', name: '津久野', lat: 34.5337, lng: 135.4685, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_otori', name: '鳳', lat: 34.5274, lng: 135.4572, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_tomiki', name: '富木', lat: 34.5192, lng: 135.4445, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_kitashinoda', name: '北信太', lat: 34.5108, lng: 135.4311, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_shinodayama', name: '信太山', lat: 34.5023, lng: 135.4230, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_izumifu_chu', name: '和泉府中', lat: 34.4915, lng: 135.4167, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_kumeda', name: '久米田', lat: 34.4753, lng: 135.4039, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_shimomastu', name: '下松', lat: 34.4644, lng: 135.3950, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_higashikishiwada', name: '東岸和田', lat: 34.4564, lng: 135.3870, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_higashikaizuka', name: '東貝塚', lat: 34.4457, lng: 135.3770, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_izumihashimoto', name: '和泉橋本', lat: 34.4370, lng: 135.3670, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_higashisano', name: '東佐野', lat: 34.4154, lng: 135.3490, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_kumatori', name: '熊取', lat: 34.4062, lng: 135.3406, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_hineno', name: '日根野', lat: 34.3950, lng: 135.3293, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_nagataki', name: '長滝', lat: 34.3871, lng: 135.3172, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_shinke', name: '新家', lat: 34.3770, lng: 135.3055, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_izumisunagawa', name: '和泉砂川', lat: 34.3629, lng: 135.2921, lines: ['jr_hanwa'], prefecture: '大阪府' },
  { id: 'ks_kii', name: '紀伊', lat: 34.2897, lng: 135.2269, lines: ['jr_hanwa'], prefecture: '和歌山県' },
  { id: 'ks_musota', name: '六十谷', lat: 34.2676, lng: 135.2098, lines: ['jr_hanwa'], prefecture: '和歌山県' },
  { id: 'ks_kii_nakanoshima', name: '紀伊中ノ島', lat: 34.2446, lng: 135.1989, lines: ['jr_hanwa'], prefecture: '和歌山県' },
  { id: 'ks_wakayama', name: '和歌山', lat: 34.2326, lng: 135.1913, lines: ['jr_hanwa'], prefecture: '和歌山県' },

  // --------------------------------------------------------
  // 阪急神戸線（重複しない駅）
  // --------------------------------------------------------
  // 大阪梅田はks_umeda定義済み
  { id: 'ks_nakatsu_hankyu', name: '中津', lat: 34.7100, lng: 135.4932, lines: ['hankyu_kobe', 'hankyu_takarazuka'], prefecture: '大阪府' },
  { id: 'ks_juso', name: '十三', lat: 34.7192, lng: 135.4732, lines: ['hankyu_kobe', 'hankyu_kyoto', 'hankyu_takarazuka'], prefecture: '大阪府' },
  { id: 'ks_kanzakigawa', name: '神崎川', lat: 34.7403, lng: 135.4542, lines: ['hankyu_kobe'], prefecture: '大阪府' },
  { id: 'ks_sonoda', name: '園田', lat: 34.7516, lng: 135.4346, lines: ['hankyu_kobe'], prefecture: '兵庫県' },
  { id: 'ks_tsukaguchi', name: '塚口', lat: 34.7551, lng: 135.4169, lines: ['hankyu_kobe'], prefecture: '兵庫県' },
  { id: 'ks_mukonoso', name: '武庫之荘', lat: 34.7559, lng: 135.3983, lines: ['hankyu_kobe'], prefecture: '兵庫県' },
  { id: 'ks_nishinomiya_kitaguchi', name: '西宮北口', lat: 34.7442, lng: 135.3620, lines: ['hankyu_kobe'], prefecture: '兵庫県' },
  { id: 'ks_shukugawa', name: '夙川', lat: 34.7426, lng: 135.3404, lines: ['hankyu_kobe'], prefecture: '兵庫県' },
  { id: 'ks_ashiyagawa', name: '芦屋川', lat: 34.7394, lng: 135.3097, lines: ['hankyu_kobe'], prefecture: '兵庫県' },
  { id: 'ks_okamoto', name: '岡本', lat: 34.7355, lng: 135.2890, lines: ['hankyu_kobe'], prefecture: '兵庫県' },
  { id: 'ks_mikage_hankyu', name: '御影', lat: 34.7283, lng: 135.2686, lines: ['hankyu_kobe'], prefecture: '兵庫県' },
  { id: 'ks_rokko', name: '六甲', lat: 34.7228, lng: 135.2460, lines: ['hankyu_kobe'], prefecture: '兵庫県' },
  { id: 'ks_oji_koen', name: '王子公園', lat: 34.7131, lng: 135.2170, lines: ['hankyu_kobe'], prefecture: '兵庫県' },
  { id: 'ks_kasugano_michi_hankyu', name: '春日野道', lat: 34.7044, lng: 135.2060, lines: ['hankyu_kobe'], prefecture: '兵庫県' },
  { id: 'ks_kobe_sannomiya', name: '神戸三宮', lat: 34.6953, lng: 135.1950, lines: ['hankyu_kobe', 'hanshin_main'], prefecture: '兵庫県' },

  // --------------------------------------------------------
  // 阪急京都線（重複しない駅）
  // --------------------------------------------------------
  // 大阪梅田はks_umeda定義済み、中津はks_nakatsu_hankyu定義済み、十三はks_juso定義済み
  { id: 'ks_minamikata_hankyu', name: '南方', lat: 34.7266, lng: 135.4969, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_suzenji', name: '崇禅寺', lat: 34.7294, lng: 135.5054, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_awaji', name: '淡路', lat: 34.7360, lng: 135.5141, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_kamishinjo', name: '上新庄', lat: 34.7430, lng: 135.5276, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_aikawa', name: '相川', lat: 34.7544, lng: 135.5356, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_shoujaku', name: '正雀', lat: 34.7665, lng: 135.5424, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_settsushi', name: '摂津市', lat: 34.7738, lng: 135.5488, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_minamiibaraki', name: '南茨木', lat: 34.7977, lng: 135.5505, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_ibarakishi', name: '茨木市', lat: 34.8148, lng: 135.5638, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_sojiji', name: '総持寺', lat: 34.8243, lng: 135.5743, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_tonda', name: '富田', lat: 34.8355, lng: 135.5900, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_takatsukishi', name: '高槻市', lat: 34.8487, lng: 135.6162, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_kammaki', name: '上牧', lat: 34.8621, lng: 135.6347, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_minase', name: '水無瀬', lat: 34.8711, lng: 135.6508, lines: ['hankyu_kyoto'], prefecture: '大阪府' },
  { id: 'ks_oyamazaki', name: '大山崎', lat: 34.8851, lng: 135.6781, lines: ['hankyu_kyoto'], prefecture: '京都府' },
  { id: 'ks_nagaoka_tenjin', name: '長岡天神', lat: 34.9220, lng: 135.6900, lines: ['hankyu_kyoto'], prefecture: '京都府' },
  { id: 'ks_nishimuko', name: '西向日', lat: 34.9351, lng: 135.6957, lines: ['hankyu_kyoto'], prefecture: '京都府' },
  { id: 'ks_higashimuko', name: '東向日', lat: 34.9431, lng: 135.6994, lines: ['hankyu_kyoto'], prefecture: '京都府' },
  { id: 'ks_rakusaiguchi', name: '洛西口', lat: 34.9520, lng: 135.7040, lines: ['hankyu_kyoto'], prefecture: '京都府' },
  { id: 'ks_katsura', name: '桂', lat: 34.9717, lng: 135.7102, lines: ['hankyu_kyoto'], prefecture: '京都府' },
  { id: 'ks_saiin', name: '西院', lat: 34.9975, lng: 135.7280, lines: ['hankyu_kyoto'], prefecture: '京都府' },
  { id: 'ks_omiya', name: '大宮', lat: 35.0037, lng: 135.7442, lines: ['hankyu_kyoto'], prefecture: '京都府' },
  { id: 'ks_karasuma_hankyu', name: '烏丸', lat: 35.0028, lng: 135.7585, lines: ['hankyu_kyoto'], prefecture: '京都府' },
  { id: 'ks_kyoto_kawaramachi', name: '京都河原町', lat: 35.0035, lng: 135.7693, lines: ['hankyu_kyoto'], prefecture: '京都府' },

  // --------------------------------------------------------
  // 阪急宝塚線（重複しない駅）
  // --------------------------------------------------------
  // 大阪梅田はks_umeda定義済み、中津はks_nakatsu_hankyu定義済み、十三はks_juso定義済み
  { id: 'ks_mikuni', name: '三国', lat: 34.7303, lng: 135.4660, lines: ['hankyu_takarazuka'], prefecture: '大阪府' },
  { id: 'ks_shonai', name: '庄内', lat: 34.7446, lng: 135.4603, lines: ['hankyu_takarazuka'], prefecture: '大阪府' },
  { id: 'ks_hattori_tenjin', name: '服部天神', lat: 34.7567, lng: 135.4583, lines: ['hankyu_takarazuka'], prefecture: '大阪府' },
  { id: 'ks_sone', name: '曽根', lat: 34.7683, lng: 135.4558, lines: ['hankyu_takarazuka'], prefecture: '大阪府' },
  { id: 'ks_okamachi', name: '岡町', lat: 34.7770, lng: 135.4545, lines: ['hankyu_takarazuka'], prefecture: '大阪府' },
  { id: 'ks_toyonaka', name: '豊中', lat: 34.7852, lng: 135.4617, lines: ['hankyu_takarazuka'], prefecture: '大阪府' },
  { id: 'ks_hotarugaike', name: '蛍池', lat: 34.7939, lng: 135.4567, lines: ['hankyu_takarazuka'], prefecture: '大阪府' },
  { id: 'ks_ishibashi_handaimae', name: '石橋阪大前', lat: 34.8041, lng: 135.4505, lines: ['hankyu_takarazuka'], prefecture: '大阪府' },
  { id: 'ks_ikeda', name: '池田', lat: 34.8215, lng: 135.4334, lines: ['hankyu_takarazuka'], prefecture: '大阪府' },
  { id: 'ks_kawanishi_noseguchi', name: '川西能勢口', lat: 34.8310, lng: 135.4146, lines: ['hankyu_takarazuka'], prefecture: '兵庫県' },
  { id: 'ks_hibarigaoka_hanayashiki', name: '雲雀丘花屋敷', lat: 34.8364, lng: 135.3955, lines: ['hankyu_takarazuka'], prefecture: '兵庫県' },
  { id: 'ks_yamamoto', name: '山本', lat: 34.8370, lng: 135.3767, lines: ['hankyu_takarazuka'], prefecture: '兵庫県' },
  { id: 'ks_nakayama_kannon', name: '中山観音', lat: 34.8376, lng: 135.3620, lines: ['hankyu_takarazuka'], prefecture: '兵庫県' },
  { id: 'ks_baifushinsha', name: '売布神社', lat: 34.8327, lng: 135.3485, lines: ['hankyu_takarazuka'], prefecture: '兵庫県' },
  { id: 'ks_kiyoshikojin', name: '清荒神', lat: 34.8228, lng: 135.3395, lines: ['hankyu_takarazuka'], prefecture: '兵庫県' },
  { id: 'ks_takarazuka', name: '宝塚', lat: 34.8095, lng: 135.3408, lines: ['hankyu_takarazuka'], prefecture: '兵庫県' },

  // --------------------------------------------------------
  // 阪神本線（重複しない駅）
  // --------------------------------------------------------
  // 大阪梅田はks_umeda定義済み
  { id: 'ks_fukushima_hanshin', name: '福島', lat: 34.6964, lng: 135.4853, lines: ['hanshin_main'], prefecture: '大阪府' },
  // 野田（阪神）＝野田阪神（千日前線）は同一駅、ks_noda_hanshinで定義済み
  { id: 'ks_yodogawa_hanshin', name: '淀川', lat: 34.7020, lng: 135.4630, lines: ['hanshin_main'], prefecture: '大阪府' },
  { id: 'ks_himejima', name: '姫島', lat: 34.7118, lng: 135.4525, lines: ['hanshin_main'], prefecture: '大阪府' },
  { id: 'ks_chibune', name: '千船', lat: 34.7181, lng: 135.4436, lines: ['hanshin_main'], prefecture: '大阪府' },
  { id: 'ks_kuise', name: '杭瀬', lat: 34.7222, lng: 135.4323, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_daimotsu', name: '大物', lat: 34.7275, lng: 135.4260, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_amagasaki_hanshin', name: '尼崎', lat: 34.7335, lng: 135.4183, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_deyashiki', name: '出屋敷', lat: 34.7319, lng: 135.4075, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_amagasaki_cp', name: '尼崎センタープール前', lat: 34.7294, lng: 135.3974, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_mukogawa', name: '武庫川', lat: 34.7257, lng: 135.3841, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_naruo_mukogawa', name: '鳴尾・武庫川女子大前', lat: 34.7234, lng: 135.3718, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_koshien', name: '甲子園', lat: 34.7220, lng: 135.3620, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_kusugawa', name: '久寿川', lat: 34.7220, lng: 135.3530, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_imazu_hanshin', name: '今津', lat: 34.7250, lng: 135.3450, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_nishinomiya_hanshin', name: '西宮', lat: 34.7341, lng: 135.3371, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_koroen', name: '香櫨園', lat: 34.7350, lng: 135.3265, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_uchide', name: '打出', lat: 34.7340, lng: 135.3142, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_ashiya_hanshin', name: '芦屋', lat: 34.7310, lng: 135.3016, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_fukae', name: '深江', lat: 34.7256, lng: 135.2857, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_aotaki', name: '青木', lat: 34.7228, lng: 135.2756, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_uozaki', name: '魚崎', lat: 34.7195, lng: 135.2660, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_sumiyoshi_hanshin', name: '住吉', lat: 34.7162, lng: 135.2565, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_mikage_hanshin', name: '御影', lat: 34.7133, lng: 135.2466, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_ishiyagawa', name: '石屋川', lat: 34.7109, lng: 135.2369, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_shinzaike', name: '新在家', lat: 34.7085, lng: 135.2271, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_oishi', name: '大石', lat: 34.7060, lng: 135.2195, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_nishinada', name: '西灘', lat: 34.7040, lng: 135.2128, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_iwaya', name: '岩屋', lat: 34.7023, lng: 135.2056, lines: ['hanshin_main'], prefecture: '兵庫県' },
  { id: 'ks_kasugano_michi_hanshin', name: '春日野道', lat: 34.6990, lng: 135.2004, lines: ['hanshin_main'], prefecture: '兵庫県' },
  // 神戸三宮はks_kobe_sannomiya定義済み、元町はks_motomachi定義済み

  // --------------------------------------------------------
  // 京都市営地下鉄 烏丸線（重複しない駅）
  // --------------------------------------------------------
  { id: 'ks_kokusaikaikan', name: '国際会館', lat: 35.0593, lng: 135.7788, lines: ['kyoto_karasuma'], prefecture: '京都府' },
  { id: 'ks_matsugasaki', name: '松ヶ崎', lat: 35.0490, lng: 135.7738, lines: ['kyoto_karasuma'], prefecture: '京都府' },
  { id: 'ks_kitayama', name: '北山', lat: 35.0444, lng: 135.7621, lines: ['kyoto_karasuma'], prefecture: '京都府' },
  { id: 'ks_kitaoji', name: '北大路', lat: 35.0394, lng: 135.7570, lines: ['kyoto_karasuma'], prefecture: '京都府' },
  { id: 'ks_kuramaguchi', name: '鞍馬口', lat: 35.0316, lng: 135.7568, lines: ['kyoto_karasuma'], prefecture: '京都府' },
  { id: 'ks_imadegawa', name: '今出川', lat: 35.0281, lng: 135.7583, lines: ['kyoto_karasuma'], prefecture: '京都府' },
  { id: 'ks_marutamachi', name: '丸太町', lat: 35.0163, lng: 135.7586, lines: ['kyoto_karasuma'], prefecture: '京都府' },
  { id: 'ks_karasuma_oike', name: '烏丸御池', lat: 35.0082, lng: 135.7588, lines: ['kyoto_karasuma', 'kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_shijo', name: '四条', lat: 35.0016, lng: 135.7585, lines: ['kyoto_karasuma'], prefecture: '京都府' },
  { id: 'ks_gojo', name: '五条', lat: 34.9954, lng: 135.7585, lines: ['kyoto_karasuma'], prefecture: '京都府' },
  // 京都はks_kyoto定義済み

  // --------------------------------------------------------
  // 京都市営地下鉄 東西線（重複しない駅）
  // --------------------------------------------------------
  { id: 'ks_rokujizo', name: '六地蔵', lat: 34.9293, lng: 135.7896, lines: ['kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_ishida', name: '石田', lat: 34.9412, lng: 135.8000, lines: ['kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_daigo', name: '醍醐', lat: 34.9501, lng: 135.8095, lines: ['kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_ono', name: '小野', lat: 34.9546, lng: 135.8156, lines: ['kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_nagitsuji', name: '椥辻', lat: 34.9633, lng: 135.8120, lines: ['kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_higashino', name: '東野', lat: 34.9689, lng: 135.8152, lines: ['kyoto_tozai'], prefecture: '京都府' },
  // 山科はks_yamashina定義済み
  { id: 'ks_misasagi', name: '御陵', lat: 34.9870, lng: 135.8080, lines: ['kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_keage', name: '蹴上', lat: 35.0069, lng: 135.7896, lines: ['kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_higashiyama', name: '東山', lat: 35.0076, lng: 135.7815, lines: ['kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_sanjo_keihan', name: '三条京阪', lat: 35.0087, lng: 135.7724, lines: ['kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_kyoto_shiyakusho_mae', name: '京都市役所前', lat: 35.0110, lng: 135.7676, lines: ['kyoto_tozai'], prefecture: '京都府' },
  // 烏丸御池はks_karasuma_oike定義済み
  { id: 'ks_nijojo_mae', name: '二条城前', lat: 35.0117, lng: 135.7497, lines: ['kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_nijo', name: '二条', lat: 35.0111, lng: 135.7423, lines: ['kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_nishioji_oike', name: '西大路御池', lat: 35.0093, lng: 135.7305, lines: ['kyoto_tozai'], prefecture: '京都府' },
  { id: 'ks_uzumasa_tenjingawa', name: '太秦天神川', lat: 35.0103, lng: 135.7148, lines: ['kyoto_tozai'], prefecture: '京都府' },

  // --------------------------------------------------------
  // 近鉄奈良線（重複しない駅）
  // --------------------------------------------------------
  // 大阪難波はks_namba定義済み、近鉄日本橋はks_nihonbashi定義済み
  { id: 'ks_osaka_uehonmachi', name: '大阪上本町', lat: 34.6668, lng: 135.5184, lines: ['kintetsu_nara', 'kintetsu_osaka'], prefecture: '大阪府' },
  // 鶴橋はks_tsuruhashi定義済み
  { id: 'ks_fuse', name: '布施', lat: 34.6678, lng: 135.5586, lines: ['kintetsu_nara', 'kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_kawachi_eiwa', name: '河内永和', lat: 34.6676, lng: 135.5674, lines: ['kintetsu_nara'], prefecture: '大阪府' },
  { id: 'ks_kawachi_kosaka', name: '河内小阪', lat: 34.6672, lng: 135.5753, lines: ['kintetsu_nara'], prefecture: '大阪府' },
  { id: 'ks_yatonoiri', name: '八戸ノ里', lat: 34.6668, lng: 135.5850, lines: ['kintetsu_nara'], prefecture: '大阪府' },
  { id: 'ks_wakae_iwata', name: '若江岩田', lat: 34.6666, lng: 135.5959, lines: ['kintetsu_nara'], prefecture: '大阪府' },
  { id: 'ks_kawachi_hanazono', name: '河内花園', lat: 34.6671, lng: 135.6061, lines: ['kintetsu_nara'], prefecture: '大阪府' },
  { id: 'ks_higashi_hanazono', name: '東花園', lat: 34.6691, lng: 135.6147, lines: ['kintetsu_nara'], prefecture: '大阪府' },
  { id: 'ks_hyotan_yama', name: '瓢箪山', lat: 34.6720, lng: 135.6338, lines: ['kintetsu_nara'], prefecture: '大阪府' },
  { id: 'ks_hiraoka', name: '枚岡', lat: 34.6727, lng: 135.6452, lines: ['kintetsu_nara'], prefecture: '大阪府' },
  { id: 'ks_nukata', name: '額田', lat: 34.6750, lng: 135.6549, lines: ['kintetsu_nara'], prefecture: '大阪府' },
  { id: 'ks_ishikiri', name: '石切', lat: 34.6780, lng: 135.6639, lines: ['kintetsu_nara'], prefecture: '大阪府' },
  { id: 'ks_ikoma', name: '生駒', lat: 34.6906, lng: 135.7000, lines: ['kintetsu_nara'], prefecture: '奈良県' },
  { id: 'ks_higashi_ikoma', name: '東生駒', lat: 34.6882, lng: 135.7129, lines: ['kintetsu_nara'], prefecture: '奈良県' },
  { id: 'ks_tomio', name: '富雄', lat: 34.6869, lng: 135.7323, lines: ['kintetsu_nara'], prefecture: '奈良県' },
  { id: 'ks_gakuenmae', name: '学園前', lat: 34.6876, lng: 135.7502, lines: ['kintetsu_nara'], prefecture: '奈良県' },
  { id: 'ks_ayameike', name: '菖蒲池', lat: 34.6897, lng: 135.7623, lines: ['kintetsu_nara'], prefecture: '奈良県' },
  { id: 'ks_yamato_saidaiji', name: '大和西大寺', lat: 34.6926, lng: 135.7843, lines: ['kintetsu_nara'], prefecture: '奈良県' },
  { id: 'ks_shin_omiya', name: '新大宮', lat: 34.6875, lng: 135.7967, lines: ['kintetsu_nara'], prefecture: '奈良県' },
  { id: 'ks_kintetsu_nara', name: '近鉄奈良', lat: 34.6808, lng: 135.8057, lines: ['kintetsu_nara'], prefecture: '奈良県' },

  // --------------------------------------------------------
  // 近鉄大阪線（重複しない駅）
  // --------------------------------------------------------
  // 大阪上本町はks_osaka_uehonmachi定義済み、鶴橋はks_tsuruhashi定義済み、布施はks_fuse定義済み
  { id: 'ks_shuntokumichi', name: '俊徳道', lat: 34.6621, lng: 135.5627, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_nagase', name: '長瀬', lat: 34.6564, lng: 135.5666, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_mito', name: '弥刀', lat: 34.6459, lng: 135.5694, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_kyuhojiguchi', name: '久宝寺口', lat: 34.6362, lng: 135.5736, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_kintetsu_yao', name: '近鉄八尾', lat: 34.6264, lng: 135.5954, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_kawachi_yamamoto', name: '河内山本', lat: 34.6191, lng: 135.6100, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_takayasu', name: '高安', lat: 34.6122, lng: 135.6229, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_onji', name: '恩智', lat: 34.6025, lng: 135.6321, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_hozenji', name: '法善寺', lat: 34.5901, lng: 135.6375, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_katashimo', name: '堅下', lat: 34.5824, lng: 135.6403, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_ando', name: '安堂', lat: 34.5740, lng: 135.6461, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_kawachi_kokubu', name: '河内国分', lat: 34.5638, lng: 135.6433, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_osaka_kyoikudaimae', name: '大阪教育大前', lat: 34.5552, lng: 135.6458, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_sekiya', name: '関屋', lat: 34.5495, lng: 135.6586, lines: ['kintetsu_osaka'], prefecture: '大阪府' },
  { id: 'ks_nijo_kintetsu', name: '二上', lat: 34.5420, lng: 135.6680, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_kintetsu_shimoda', name: '近鉄下田', lat: 34.5348, lng: 135.6828, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_goi_do', name: '五位堂', lat: 34.5302, lng: 135.6999, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_tsukiyama', name: '築山', lat: 34.5273, lng: 135.7090, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_yamato_takada', name: '大和高田', lat: 34.5178, lng: 135.7339, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_matsuzuka', name: '松塚', lat: 34.5152, lng: 135.7437, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_masuga', name: '真菅', lat: 34.5100, lng: 135.7550, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_yamato_yagi', name: '大和八木', lat: 34.5083, lng: 135.7935, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_miminashi', name: '耳成', lat: 34.5136, lng: 135.8041, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_daifuku', name: '大福', lat: 34.5178, lng: 135.8194, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_sakurai', name: '桜井', lat: 34.5149, lng: 135.8440, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_yamato_asakura', name: '大和朝倉', lat: 34.5131, lng: 135.8622, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_hasedera', name: '長谷寺', lat: 34.5020, lng: 135.8870, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_haibara', name: '榛原', lat: 34.5172, lng: 135.9532, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_muroguchi_ono', name: '室生口大野', lat: 34.5302, lng: 135.9919, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_sanbonmatsu', name: '三本松', lat: 34.5424, lng: 136.0210, lines: ['kintetsu_osaka'], prefecture: '奈良県' },
  { id: 'ks_akameguchi', name: '赤目口', lat: 34.5619, lng: 136.0481, lines: ['kintetsu_osaka'], prefecture: '三重県' },
  { id: 'ks_nabari', name: '名張', lat: 34.6136, lng: 136.1044, lines: ['kintetsu_osaka'], prefecture: '三重県' },

  // --------------------------------------------------------
  // 南海本線（重複しない駅）
  // --------------------------------------------------------
  // なんばはks_namba定義済み、新今宮はks_shin_imamiya定義済み、天下茶屋はks_tengachaya定義済み
  { id: 'ks_kishiritamade', name: '岸里玉出', lat: 34.6383, lng: 135.4943, lines: ['nankai_main', 'nankai_koya'], prefecture: '大阪府' },
  { id: 'ks_konohama', name: '粉浜', lat: 34.6296, lng: 135.4928, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_sumiyoshi_taisha', name: '住吉大社', lat: 34.6127, lng: 135.4922, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_suminoe', name: '住ノ江', lat: 34.6040, lng: 135.4905, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_shichido', name: '七道', lat: 34.5943, lng: 135.4865, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_sakai_nankai', name: '堺', lat: 34.5770, lng: 135.4772, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_minato', name: '湊', lat: 34.5707, lng: 135.4675, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_ishizugawa', name: '石津川', lat: 34.5619, lng: 135.4604, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_suwanomori', name: '諏訪ノ森', lat: 34.5534, lng: 135.4581, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_hamadera_koen', name: '浜寺公園', lat: 34.5472, lng: 135.4530, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_hagoromo', name: '羽衣', lat: 34.5382, lng: 135.4434, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_takaishi', name: '高石', lat: 34.5282, lng: 135.4370, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_kitaasuka', name: '北助松', lat: 34.5175, lng: 135.4320, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_matsunohama', name: '松ノ浜', lat: 34.5087, lng: 135.4271, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_izumiotsu', name: '泉大津', lat: 34.5024, lng: 135.4097, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_tadaoka', name: '忠岡', lat: 34.4945, lng: 135.3997, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_haruki', name: '春木', lat: 34.4824, lng: 135.3884, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_izumi_omiya', name: '和泉大宮', lat: 34.4723, lng: 135.3797, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_kishiwada', name: '岸和田', lat: 34.4599, lng: 135.3710, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_takojizo', name: '蛸地蔵', lat: 34.4520, lng: 135.3666, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_kaizuka', name: '貝塚', lat: 34.4395, lng: 135.3587, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_nishikihama', name: '二色浜', lat: 34.4285, lng: 135.3539, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_tsuruhara', name: '鶴原', lat: 34.4196, lng: 135.3499, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_iharazato', name: '井原里', lat: 34.4118, lng: 135.3454, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_izumisano', name: '泉佐野', lat: 34.4029, lng: 135.3280, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_haguruzaki', name: '羽倉崎', lat: 34.3960, lng: 135.3175, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_yoshiminosato', name: '吉見ノ里', lat: 34.3888, lng: 135.3094, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_okadaura', name: '岡田浦', lat: 34.3817, lng: 135.3002, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_tarui', name: '樽井', lat: 34.3729, lng: 135.2908, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_ozaki', name: '尾崎', lat: 34.3599, lng: 135.2800, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_tottorinosho', name: '鳥取ノ荘', lat: 34.3476, lng: 135.2658, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_hakosaku', name: '箱作', lat: 34.3360, lng: 135.2507, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_tanowa', name: '淡輪', lat: 34.3224, lng: 135.2326, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_misaki_koen', name: 'みさき公園', lat: 34.3180, lng: 135.2146, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_kyoshi', name: '孝子', lat: 34.3048, lng: 135.1956, lines: ['nankai_main'], prefecture: '大阪府' },
  { id: 'ks_wakayamadaigakumae', name: '和歌山大学前', lat: 34.2892, lng: 135.1813, lines: ['nankai_main'], prefecture: '和歌山県' },
  { id: 'ks_kinokawa', name: '紀ノ川', lat: 34.2618, lng: 135.1707, lines: ['nankai_main'], prefecture: '和歌山県' },
  { id: 'ks_wakayamashi', name: '和歌山市', lat: 34.2351, lng: 135.1656, lines: ['nankai_main'], prefecture: '和歌山県' },

  // --------------------------------------------------------
  // 南海高野線（重複しない駅・主要駅）
  // --------------------------------------------------------
  // なんばはks_namba定義済み、新今宮はks_shin_imamiya定義済み、天下茶屋はks_tengachaya定義済み
  // 岸里玉出はks_kishiritamade定義済み
  { id: 'ks_teragaike', name: '帝塚山', lat: 34.6284, lng: 135.5013, lines: ['nankai_koya'], prefecture: '大阪府' },
  { id: 'ks_sumiyoshihigashi', name: '住吉東', lat: 34.6130, lng: 135.5024, lines: ['nankai_koya'], prefecture: '大阪府' },
  { id: 'ks_sawanosecho', name: '沢ノ町', lat: 34.6043, lng: 135.5028, lines: ['nankai_koya'], prefecture: '大阪府' },
  { id: 'ks_abikomae', name: '我孫子前', lat: 34.5968, lng: 135.5038, lines: ['nankai_koya'], prefecture: '大阪府' },
  { id: 'ks_hatsushiba', name: '初芝', lat: 34.5621, lng: 135.5207, lines: ['nankai_koya'], prefecture: '大阪府' },
  { id: 'ks_sakaihigashi', name: '堺東', lat: 34.5732, lng: 135.4871, lines: ['nankai_koya'], prefecture: '大阪府' },
  { id: 'ks_kitanoda', name: '北野田', lat: 34.5402, lng: 135.5397, lines: ['nankai_koya'], prefecture: '大阪府' },
  { id: 'ks_kongo', name: '金剛', lat: 34.5034, lng: 135.5661, lines: ['nankai_koya'], prefecture: '大阪府' },
  { id: 'ks_kawachinagano', name: '河内長野', lat: 34.4597, lng: 135.5620, lines: ['nankai_koya'], prefecture: '大阪府' },
  { id: 'ks_rinkan_tanabe', name: '林間田園都市', lat: 34.4050, lng: 135.5780, lines: ['nankai_koya'], prefecture: '和歌山県' },
  { id: 'ks_hashimoto', name: '橋本', lat: 34.3180, lng: 135.6060, lines: ['nankai_koya'], prefecture: '和歌山県' },
  { id: 'ks_koyashita', name: '高野下', lat: 34.2628, lng: 135.5860, lines: ['nankai_koya'], prefecture: '和歌山県' },
  { id: 'ks_gokurakubashi', name: '極楽橋', lat: 34.2283, lng: 135.5788, lines: ['nankai_koya'], prefecture: '和歌山県' },
];

// ============================================================
// 路線データ
// ============================================================

const lines: LineData[] = [
  // --------------------------------------------------------
  // 大阪メトロ（地下鉄）
  // --------------------------------------------------------
  {
    id: 'osaka_midosuji',
    name: '御堂筋線',
    company: 'Osaka Metro',
    color: '#E5171F',
    vehicleType: 'subway',
    stationIds: [
      'ks_esaka', 'ks_higashimikuni', 'ks_shin_osaka', 'ks_nishinakajima_minamigata',
      'ks_nakatsu_midosuji', 'ks_umeda', 'ks_yodoyabashi', 'ks_honmachi',
      'ks_shinsaibashi', 'ks_namba', 'ks_daikokucho', 'ks_dobutsuen_mae',
      'ks_tennoji', 'ks_showamachi', 'ks_nishitanabe', 'ks_nagai',
      'ks_abiko', 'ks_kitahanada', 'ks_shinkanaoka', 'ks_nakamozu',
    ],
    isLoop: false,
  },
  {
    id: 'osaka_tanimachi',
    name: '谷町線',
    company: 'Osaka Metro',
    color: '#522886',
    vehicleType: 'subway',
    stationIds: [
      'ks_dainichi', 'ks_moriguchi', 'ks_taishibashi_imamichi', 'ks_senbayashi_omiya',
      'ks_sekime_takadono', 'ks_noe_uchindai', 'ks_miyakojima', 'ks_tenjimbashisuji6',
      'ks_nakazakicho', 'ks_higashi_umeda', 'ks_minamimorimachi', 'ks_temmabashi',
      'ks_tanimachi4', 'ks_tanimachi6', 'ks_tanimachi9', 'ks_shitennoji_mae',
      'ks_tennoji', 'ks_abeno', 'ks_fuminosato', 'ks_tanabe',
      'ks_komagawa_nakano', 'ks_hirano', 'ks_kire_uriwari', 'ks_deto',
      'ks_nagahara', 'ks_yao_minami',
    ],
    isLoop: false,
  },
  {
    id: 'osaka_yotsubashi',
    name: '四つ橋線',
    company: 'Osaka Metro',
    color: '#0078BA',
    vehicleType: 'subway',
    stationIds: [
      'ks_nishi_umeda', 'ks_higobashi', 'ks_honmachi', 'ks_yotsubashi',
      'ks_namba', 'ks_daikokucho', 'ks_hanazonomachi', 'ks_kishinosato',
      'ks_tamade', 'ks_kitakagaya', 'ks_suminoe_koen',
    ],
    isLoop: false,
  },
  {
    id: 'osaka_chuo',
    name: '中央線',
    company: 'Osaka Metro',
    color: '#019A66',
    vehicleType: 'subway',
    stationIds: [
      'ks_cosmosquare', 'ks_osakako', 'ks_asashiobashi', 'ks_bentencho',
      'ks_kujo', 'ks_awaza', 'ks_honmachi', 'ks_sakaisuji_honmachi',
      'ks_tanimachi4', 'ks_morinomiya', 'ks_midoribashi', 'ks_fukaebashi',
      'ks_takaida', 'ks_nagata',
    ],
    isLoop: false,
  },
  {
    id: 'osaka_sennichimae',
    name: '千日前線',
    company: 'Osaka Metro',
    color: '#E44D93',
    vehicleType: 'subway',
    stationIds: [
      'ks_noda_hanshin', 'ks_tamagawa', 'ks_nishi_nagahori', 'ks_sakuragawa',
      'ks_namba', 'ks_nihonbashi', 'ks_tanimachi9', 'ks_tsuruhashi',
      'ks_imazato', 'ks_shinfukae', 'ks_shoji', 'ks_kitatatsumi',
      'ks_minamitatsumi',
    ],
    isLoop: false,
  },
  {
    id: 'osaka_sakaisuji',
    name: '堺筋線',
    company: 'Osaka Metro',
    color: '#814721',
    vehicleType: 'subway',
    stationIds: [
      'ks_tenjimbashisuji6', 'ks_ogimachi', 'ks_minamimorimachi', 'ks_kitahama',
      'ks_sakaisuji_honmachi', 'ks_nagahoribashi', 'ks_nihonbashi', 'ks_ebisucho',
      'ks_dobutsuen_mae', 'ks_tengachaya',
    ],
    isLoop: false,
  },
  {
    id: 'osaka_nagahori',
    name: '長堀鶴見緑地線',
    company: 'Osaka Metro',
    color: '#A9CC51',
    vehicleType: 'subway',
    stationIds: [
      'ks_taisho', 'ks_dome_mae_chiyozaki', 'ks_nishi_nagahori', 'ks_nishi_ohashi',
      'ks_shinsaibashi', 'ks_nagahoribashi', 'ks_matsuyamachi', 'ks_tanimachi6',
      'ks_tamatsukuri', 'ks_morinomiya', 'ks_osaka_business_park', 'ks_kyobashi',
      'ks_gamo4', 'ks_imafuku_tsurumi', 'ks_yokozutsumi', 'ks_tsurumi_ryokuchi',
      'ks_kadoma_minami',
    ],
    isLoop: false,
  },

  // --------------------------------------------------------
  // JR西日本
  // --------------------------------------------------------
  {
    id: 'jr_osaka_loop',
    name: 'JR大阪環状線',
    company: 'JR西日本',
    color: '#E60012',
    vehicleType: 'train',
    stationIds: [
      'ks_osaka', 'ks_fukushima_jr', 'ks_noda_jr', 'ks_nishikujo',
      'ks_bentencho', 'ks_taisho', 'ks_ashiharabashi', 'ks_imamiya',
      'ks_shin_imamiya', 'ks_tennoji', 'ks_teradacho', 'ks_momodani',
      'ks_tsuruhashi', 'ks_tamatsukuri', 'ks_morinomiya', 'ks_osakajo_koen',
      'ks_kyobashi', 'ks_sakuranomiya', 'ks_temma', 'ks_osaka',
    ],
    isLoop: true,
  },
  {
    id: 'jr_tokaido_west',
    name: 'JR東海道本線（京都線・神戸線）',
    company: 'JR西日本',
    color: '#0072BC',
    vehicleType: 'train',
    stationIds: [
      'ks_kyoto', 'ks_yamashina', 'ks_otsu', 'ks_takatsuki_jr',
      'ks_ibaraki_jr', 'ks_shin_osaka', 'ks_osaka', 'ks_amagasaki_jr',
      'ks_nishinomiya_jr', 'ks_ashiya_jr', 'ks_sumiyoshi_jr', 'ks_sannomiya',
      'ks_motomachi', 'ks_kobe', 'ks_hyogo', 'ks_akashi',
    ],
    isLoop: false,
  },
  {
    id: 'jr_hanwa',
    name: 'JR阪和線',
    company: 'JR西日本',
    color: '#FF6600',
    vehicleType: 'train',
    stationIds: [
      'ks_tennoji', 'ks_bishouen', 'ks_minamitanabe', 'ks_tsurugaoka',
      'ks_nagai', 'ks_abikochoJR', 'ks_sugimotocho', 'ks_asaka',
      'ks_sakaishi', 'ks_mikunigaoka', 'ks_mozu', 'ks_uenoshiba',
      'ks_tsukuno', 'ks_otori', 'ks_tomiki', 'ks_kitashinoda',
      'ks_shinodayama', 'ks_izumifu_chu', 'ks_kumeda', 'ks_shimomastu',
      'ks_higashikishiwada', 'ks_higashikaizuka', 'ks_izumihashimoto',
      'ks_higashisano', 'ks_kumatori', 'ks_hineno', 'ks_nagataki',
      'ks_shinke', 'ks_izumisunagawa', 'ks_kii', 'ks_musota',
      'ks_kii_nakanoshima', 'ks_wakayama',
    ],
    isLoop: false,
  },

  // --------------------------------------------------------
  // 阪急電鉄
  // --------------------------------------------------------
  {
    id: 'hankyu_kobe',
    name: '阪急神戸線',
    company: '阪急電鉄',
    color: '#800000',
    vehicleType: 'train',
    stationIds: [
      'ks_umeda', 'ks_nakatsu_hankyu', 'ks_juso', 'ks_kanzakigawa',
      'ks_sonoda', 'ks_tsukaguchi', 'ks_mukonoso', 'ks_nishinomiya_kitaguchi',
      'ks_shukugawa', 'ks_ashiyagawa', 'ks_okamoto', 'ks_mikage_hankyu',
      'ks_rokko', 'ks_oji_koen', 'ks_kasugano_michi_hankyu', 'ks_kobe_sannomiya',
    ],
    isLoop: false,
  },
  {
    id: 'hankyu_kyoto',
    name: '阪急京都線',
    company: '阪急電鉄',
    color: '#800000',
    vehicleType: 'train',
    stationIds: [
      'ks_umeda', 'ks_nakatsu_hankyu', 'ks_juso', 'ks_minamikata_hankyu',
      'ks_suzenji', 'ks_awaji', 'ks_kamishinjo', 'ks_aikawa',
      'ks_shoujaku', 'ks_settsushi', 'ks_minamiibaraki', 'ks_ibarakishi',
      'ks_sojiji', 'ks_tonda', 'ks_takatsukishi', 'ks_kammaki',
      'ks_minase', 'ks_oyamazaki', 'ks_nagaoka_tenjin', 'ks_nishimuko',
      'ks_higashimuko', 'ks_rakusaiguchi', 'ks_katsura', 'ks_saiin',
      'ks_omiya', 'ks_karasuma_hankyu', 'ks_kyoto_kawaramachi',
    ],
    isLoop: false,
  },
  {
    id: 'hankyu_takarazuka',
    name: '阪急宝塚線',
    company: '阪急電鉄',
    color: '#800000',
    vehicleType: 'train',
    stationIds: [
      'ks_umeda', 'ks_nakatsu_hankyu', 'ks_juso', 'ks_mikuni',
      'ks_shonai', 'ks_hattori_tenjin', 'ks_sone', 'ks_okamachi',
      'ks_toyonaka', 'ks_hotarugaike', 'ks_ishibashi_handaimae', 'ks_ikeda',
      'ks_kawanishi_noseguchi', 'ks_hibarigaoka_hanayashiki', 'ks_yamamoto',
      'ks_nakayama_kannon', 'ks_baifushinsha', 'ks_kiyoshikojin', 'ks_takarazuka',
    ],
    isLoop: false,
  },

  // --------------------------------------------------------
  // 阪神電鉄
  // --------------------------------------------------------
  {
    id: 'hanshin_main',
    name: '阪神本線',
    company: '阪神電鉄',
    color: '#FFD400',
    vehicleType: 'train',
    stationIds: [
      'ks_umeda', 'ks_fukushima_hanshin', 'ks_noda_hanshin', 'ks_yodogawa_hanshin',
      'ks_himejima', 'ks_chibune', 'ks_kuise', 'ks_daimotsu',
      'ks_amagasaki_hanshin', 'ks_deyashiki', 'ks_amagasaki_cp', 'ks_mukogawa',
      'ks_naruo_mukogawa', 'ks_koshien', 'ks_kusugawa', 'ks_imazu_hanshin',
      'ks_nishinomiya_hanshin', 'ks_koroen', 'ks_uchide', 'ks_ashiya_hanshin',
      'ks_fukae', 'ks_aotaki', 'ks_uozaki', 'ks_sumiyoshi_hanshin',
      'ks_mikage_hanshin', 'ks_ishiyagawa', 'ks_shinzaike', 'ks_oishi',
      'ks_nishinada', 'ks_iwaya', 'ks_kasugano_michi_hanshin', 'ks_kobe_sannomiya',
      'ks_motomachi',
    ],
    isLoop: false,
  },

  // --------------------------------------------------------
  // 京都市営地下鉄
  // --------------------------------------------------------
  {
    id: 'kyoto_karasuma',
    name: '烏丸線',
    company: '京都市交通局',
    color: '#00A550',
    vehicleType: 'subway',
    stationIds: [
      'ks_kokusaikaikan', 'ks_matsugasaki', 'ks_kitayama', 'ks_kitaoji',
      'ks_kuramaguchi', 'ks_imadegawa', 'ks_marutamachi', 'ks_karasuma_oike',
      'ks_shijo', 'ks_gojo', 'ks_kyoto',
    ],
    isLoop: false,
  },
  {
    id: 'kyoto_tozai',
    name: '東西線',
    company: '京都市交通局',
    color: '#FF4500',
    vehicleType: 'subway',
    stationIds: [
      'ks_rokujizo', 'ks_ishida', 'ks_daigo', 'ks_ono',
      'ks_nagitsuji', 'ks_higashino', 'ks_yamashina', 'ks_misasagi',
      'ks_keage', 'ks_higashiyama', 'ks_sanjo_keihan', 'ks_kyoto_shiyakusho_mae',
      'ks_karasuma_oike', 'ks_nijojo_mae', 'ks_nijo', 'ks_nishioji_oike',
      'ks_uzumasa_tenjingawa',
    ],
    isLoop: false,
  },

  // --------------------------------------------------------
  // 近鉄（近畿日本鉄道）
  // --------------------------------------------------------
  {
    id: 'kintetsu_nara',
    name: '近鉄奈良線',
    company: '近畿日本鉄道',
    color: '#AF272F',
    vehicleType: 'train',
    stationIds: [
      'ks_namba', 'ks_nihonbashi', 'ks_osaka_uehonmachi', 'ks_tsuruhashi',
      'ks_fuse', 'ks_kawachi_eiwa', 'ks_kawachi_kosaka', 'ks_yatonoiri',
      'ks_wakae_iwata', 'ks_kawachi_hanazono', 'ks_higashi_hanazono',
      'ks_hyotan_yama', 'ks_hiraoka', 'ks_nukata', 'ks_ishikiri',
      'ks_ikoma', 'ks_higashi_ikoma', 'ks_tomio', 'ks_gakuenmae',
      'ks_ayameike', 'ks_yamato_saidaiji', 'ks_shin_omiya', 'ks_kintetsu_nara',
    ],
    isLoop: false,
  },
  {
    id: 'kintetsu_osaka',
    name: '近鉄大阪線',
    company: '近畿日本鉄道',
    color: '#AF272F',
    vehicleType: 'train',
    stationIds: [
      'ks_osaka_uehonmachi', 'ks_tsuruhashi', 'ks_fuse', 'ks_shuntokumichi',
      'ks_nagase', 'ks_mito', 'ks_kyuhojiguchi', 'ks_kintetsu_yao',
      'ks_kawachi_yamamoto', 'ks_takayasu', 'ks_onji', 'ks_hozenji',
      'ks_katashimo', 'ks_ando', 'ks_kawachi_kokubu', 'ks_osaka_kyoikudaimae',
      'ks_sekiya', 'ks_nijo_kintetsu', 'ks_kintetsu_shimoda', 'ks_goi_do',
      'ks_tsukiyama', 'ks_yamato_takada', 'ks_matsuzuka', 'ks_masuga',
      'ks_yamato_yagi', 'ks_miminashi', 'ks_daifuku', 'ks_sakurai',
      'ks_yamato_asakura', 'ks_hasedera', 'ks_haibara', 'ks_muroguchi_ono',
      'ks_sanbonmatsu', 'ks_akameguchi', 'ks_nabari',
    ],
    isLoop: false,
  },

  // --------------------------------------------------------
  // 南海電鉄
  // --------------------------------------------------------
  {
    id: 'nankai_main',
    name: '南海本線',
    company: '南海電鉄',
    color: '#047A4A',
    vehicleType: 'train',
    stationIds: [
      'ks_namba', 'ks_shin_imamiya', 'ks_tengachaya', 'ks_kishiritamade',
      'ks_konohama', 'ks_sumiyoshi_taisha', 'ks_suminoe', 'ks_shichido',
      'ks_sakai_nankai', 'ks_minato', 'ks_ishizugawa', 'ks_suwanomori',
      'ks_hamadera_koen', 'ks_hagoromo', 'ks_takaishi', 'ks_kitaasuka',
      'ks_matsunohama', 'ks_izumiotsu', 'ks_tadaoka', 'ks_haruki',
      'ks_izumi_omiya', 'ks_kishiwada', 'ks_takojizo', 'ks_kaizuka',
      'ks_nishikihama', 'ks_tsuruhara', 'ks_iharazato', 'ks_izumisano',
      'ks_haguruzaki', 'ks_yoshiminosato', 'ks_okadaura', 'ks_tarui',
      'ks_ozaki', 'ks_tottorinosho', 'ks_hakosaku', 'ks_tanowa',
      'ks_misaki_koen', 'ks_kyoshi', 'ks_wakayamadaigakumae', 'ks_kinokawa',
      'ks_wakayamashi',
    ],
    isLoop: false,
  },
  {
    id: 'nankai_koya',
    name: '南海高野線',
    company: '南海電鉄',
    color: '#047A4A',
    vehicleType: 'train',
    stationIds: [
      'ks_namba', 'ks_shin_imamiya', 'ks_tengachaya', 'ks_kishiritamade',
      'ks_teragaike', 'ks_sumiyoshihigashi', 'ks_sawanosecho', 'ks_abikomae',
      'ks_sakaihigashi', 'ks_hatsushiba', 'ks_kitanoda', 'ks_kongo',
      'ks_kawachinagano', 'ks_rinkan_tanabe', 'ks_hashimoto', 'ks_koyashita',
      'ks_gokurakubashi',
    ],
    isLoop: false,
  },
];

// ============================================================
// エクスポート
// ============================================================

export const kansaiData: RegionData = {
  stations,
  lines,
};
