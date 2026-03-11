/**
 * 関東地方 東京メトロ・都営地下鉄追加路線データ
 *
 * 東京メトロ: 銀座線、丸ノ内線、日比谷線、東西線、千代田線、
 *             有楽町線、半蔵門線、南北線、副都心線
 * 都営地下鉄: 浅草線、大江戸線
 *
 * 駅IDプレフィックス: kt_（他の関東データと共通名前空間）
 * 他路線と共有する駅は同一IDを使用して乗り換え接続を実現
 *
 * 注意: 都営三田線・都営新宿線は kanto_jr.ts で定義済み
 */

import { StationData, LineData, RegionData } from '../types';

// ============================================================
// 駅データ（全路線共通・重複統合済み）
// ============================================================

const stations: StationData[] = [
  // --------------------------------------------------------
  // 銀座線（渋谷〜浅草）19駅
  // --------------------------------------------------------
  { id: 'kt_shibuya', name: '渋谷', lat: 35.6580, lng: 139.7016, lines: ['metro_ginza', 'metro_hanzomon', 'metro_fukutoshin'], prefecture: '東京都' },
  { id: 'kt_omotesando', name: '表参道', lat: 35.6653, lng: 139.7122, lines: ['metro_ginza', 'metro_chiyoda', 'metro_hanzomon'], prefecture: '東京都' },
  { id: 'kt_gaienmae', name: '外苑前', lat: 35.6707, lng: 139.7176, lines: ['metro_ginza'], prefecture: '東京都' },
  { id: 'kt_aoyama_itchome', name: '青山一丁目', lat: 35.6726, lng: 139.7246, lines: ['metro_ginza', 'metro_hanzomon', 'toei_oedo'], prefecture: '東京都' },
  { id: 'kt_akasaka_mitsuke', name: '赤坂見附', lat: 35.6770, lng: 139.7370, lines: ['metro_ginza', 'metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_tameike_sanno', name: '溜池山王', lat: 35.6739, lng: 139.7412, lines: ['metro_ginza', 'metro_namboku'], prefecture: '東京都' },
  { id: 'kt_toranomon', name: '虎ノ門', lat: 35.6697, lng: 139.7498, lines: ['metro_ginza'], prefecture: '東京都' },
  { id: 'kt_shimbashi', name: '新橋', lat: 35.6663, lng: 139.7586, lines: ['metro_ginza', 'toei_asakusa'], prefecture: '東京都' },
  { id: 'kt_ginza', name: '銀座', lat: 35.6717, lng: 139.7634, lines: ['metro_ginza', 'metro_marunouchi', 'metro_hibiya'], prefecture: '東京都' },
  { id: 'kt_kyobashi', name: '京橋', lat: 35.6770, lng: 139.7691, lines: ['metro_ginza'], prefecture: '東京都' },
  { id: 'kt_nihombashi', name: '日本橋', lat: 35.6820, lng: 139.7739, lines: ['metro_ginza', 'metro_tozai', 'toei_asakusa'], prefecture: '東京都' },
  { id: 'kt_mitsukoshimae', name: '三越前', lat: 35.6858, lng: 139.7734, lines: ['metro_ginza', 'metro_hanzomon'], prefecture: '東京都' },
  { id: 'kt_kanda', name: '神田', lat: 35.6918, lng: 139.7710, lines: ['metro_ginza', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_suehirocho', name: '末広町', lat: 35.6977, lng: 139.7717, lines: ['metro_ginza'], prefecture: '東京都' },
  { id: 'kt_ueno_hirokoji', name: '上野広小路', lat: 35.7077, lng: 139.7731, lines: ['metro_ginza'], prefecture: '東京都' },
  { id: 'kt_ueno', name: '上野', lat: 35.7141, lng: 139.7774, lines: ['metro_ginza', 'metro_hibiya', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_inaricho', name: '稲荷町', lat: 35.7138, lng: 139.7836, lines: ['metro_ginza'], prefecture: '東京都' },
  { id: 'kt_tawaramachi', name: '田原町', lat: 35.7101, lng: 139.7907, lines: ['metro_ginza'], prefecture: '東京都' },
  { id: 'kt_asakusa', name: '浅草', lat: 35.7121, lng: 139.7968, lines: ['metro_ginza', 'toei_asakusa'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 丸ノ内線（荻窪〜池袋）25駅
  // --------------------------------------------------------
  { id: 'kt_ogikubo', name: '荻窪', lat: 35.7044, lng: 139.6201, lines: ['metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_minami_asagaya', name: '南阿佐ヶ谷', lat: 35.6987, lng: 139.6363, lines: ['metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_shin_koenji', name: '新高円寺', lat: 35.6961, lng: 139.6494, lines: ['metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_higashi_koenji', name: '東高円寺', lat: 35.6960, lng: 139.6601, lines: ['metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_shin_nakano', name: '新中野', lat: 35.6978, lng: 139.6697, lines: ['metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_nakano_sakaue', name: '中野坂上', lat: 35.6969, lng: 139.6809, lines: ['metro_marunouchi', 'toei_oedo'], prefecture: '東京都' },
  { id: 'kt_nishi_shinjuku', name: '西新宿', lat: 35.6942, lng: 139.6929, lines: ['metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_shinjuku', name: '新宿', lat: 35.6896, lng: 139.7006, lines: ['metro_marunouchi', 'toei_oedo'], prefecture: '東京都' },
  { id: 'kt_shinjuku_sanchome', name: '新宿三丁目', lat: 35.6889, lng: 139.7055, lines: ['metro_marunouchi', 'metro_fukutoshin'], prefecture: '東京都' },
  { id: 'kt_shinjuku_gyoenmae', name: '新宿御苑前', lat: 35.6877, lng: 139.7126, lines: ['metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_yotsuya_sanchome', name: '四谷三丁目', lat: 35.6876, lng: 139.7218, lines: ['metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_yotsuya', name: '四ツ谷', lat: 35.6860, lng: 139.7303, lines: ['metro_marunouchi', 'metro_namboku'], prefecture: '東京都' },
  // 赤坂見附はkt_akasaka_mitsukeで定義済み
  { id: 'kt_kokkai_gijidomae', name: '国会議事堂前', lat: 35.6740, lng: 139.7448, lines: ['metro_marunouchi', 'metro_chiyoda'], prefecture: '東京都' },
  { id: 'kt_kasumigaseki', name: '霞ケ関', lat: 35.6733, lng: 139.7509, lines: ['metro_marunouchi', 'metro_hibiya', 'metro_chiyoda'], prefecture: '東京都' },
  // 銀座はkt_ginzaで定義済み
  { id: 'kt_tokyo', name: '東京', lat: 35.6812, lng: 139.7671, lines: ['metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_otemachi', name: '大手町', lat: 35.6862, lng: 139.7637, lines: ['metro_marunouchi', 'metro_tozai', 'metro_chiyoda', 'metro_hanzomon'], prefecture: '東京都' },
  { id: 'kt_awajicho', name: '淡路町', lat: 35.6946, lng: 139.7671, lines: ['metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_ochanomizu', name: '御茶ノ水', lat: 35.6998, lng: 139.7651, lines: ['metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_hongo_sanchome', name: '本郷三丁目', lat: 35.7076, lng: 139.7596, lines: ['metro_marunouchi', 'toei_oedo'], prefecture: '東京都' },
  { id: 'kt_korakuen', name: '後楽園', lat: 35.7076, lng: 139.7514, lines: ['metro_marunouchi', 'metro_namboku'], prefecture: '東京都' },
  { id: 'kt_myogadani', name: '茗荷谷', lat: 35.7177, lng: 139.7348, lines: ['metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_shin_otsuka', name: '新大塚', lat: 35.7273, lng: 139.7282, lines: ['metro_marunouchi'], prefecture: '東京都' },
  { id: 'kt_ikebukuro', name: '池袋', lat: 35.7295, lng: 139.7109, lines: ['metro_marunouchi', 'metro_yurakucho', 'metro_fukutoshin'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 日比谷線（中目黒〜北千住）22駅
  // --------------------------------------------------------
  { id: 'kt_nakameguro', name: '中目黒', lat: 35.6441, lng: 139.6987, lines: ['metro_hibiya'], prefecture: '東京都' },
  { id: 'kt_ebisu', name: '恵比寿', lat: 35.6467, lng: 139.7100, lines: ['metro_hibiya'], prefecture: '東京都' },
  { id: 'kt_hiroo', name: '広尾', lat: 35.6510, lng: 139.7222, lines: ['metro_hibiya'], prefecture: '東京都' },
  { id: 'kt_roppongi', name: '六本木', lat: 35.6631, lng: 139.7313, lines: ['metro_hibiya', 'toei_oedo'], prefecture: '東京都' },
  { id: 'kt_kamiyacho', name: '神谷町', lat: 35.6643, lng: 139.7440, lines: ['metro_hibiya'], prefecture: '東京都' },
  { id: 'kt_toranomon_hills', name: '虎ノ門ヒルズ', lat: 35.6668, lng: 139.7497, lines: ['metro_hibiya'], prefecture: '東京都' },
  // 霞ケ関はkt_kasumigasekiで定義済み
  { id: 'kt_hibiya', name: '日比谷', lat: 35.6750, lng: 139.7600, lines: ['metro_hibiya', 'metro_chiyoda'], prefecture: '東京都' },
  // 銀座はkt_ginzaで定義済み
  { id: 'kt_higashi_ginza', name: '東銀座', lat: 35.6693, lng: 139.7668, lines: ['metro_hibiya', 'toei_asakusa'], prefecture: '東京都' },
  { id: 'kt_tsukiji', name: '築地', lat: 35.6670, lng: 139.7727, lines: ['metro_hibiya'], prefecture: '東京都' },
  { id: 'kt_hacchobori', name: '八丁堀', lat: 35.6738, lng: 139.7763, lines: ['metro_hibiya'], prefecture: '東京都' },
  { id: 'kt_kayabacho', name: '茅場町', lat: 35.6806, lng: 139.7802, lines: ['metro_hibiya', 'metro_tozai'], prefecture: '東京都' },
  { id: 'kt_ningyocho', name: '人形町', lat: 35.6860, lng: 139.7822, lines: ['metro_hibiya', 'toei_asakusa'], prefecture: '東京都' },
  { id: 'kt_kodemmacho', name: '小伝馬町', lat: 35.6902, lng: 139.7810, lines: ['metro_hibiya'], prefecture: '東京都' },
  { id: 'kt_akihabara', name: '秋葉原', lat: 35.6984, lng: 139.7731, lines: ['metro_hibiya'], prefecture: '東京都' },
  { id: 'kt_naka_okachimachi', name: '仲御徒町', lat: 35.7073, lng: 139.7749, lines: ['metro_hibiya'], prefecture: '東京都' },
  // 上野はkt_uenoで定義済み
  { id: 'kt_iriya', name: '入谷', lat: 35.7209, lng: 139.7847, lines: ['metro_hibiya'], prefecture: '東京都' },
  { id: 'kt_minowa', name: '三ノ輪', lat: 35.7299, lng: 139.7916, lines: ['metro_hibiya'], prefecture: '東京都' },
  { id: 'kt_minami_senju', name: '南千住', lat: 35.7388, lng: 139.7953, lines: ['metro_hibiya'], prefecture: '東京都' },
  { id: 'kt_kita_senju', name: '北千住', lat: 35.7497, lng: 139.8050, lines: ['metro_hibiya', 'metro_chiyoda'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 東西線（中野〜西船橋）23駅
  // --------------------------------------------------------
  { id: 'kt_nakano', name: '中野', lat: 35.7065, lng: 139.6659, lines: ['metro_tozai'], prefecture: '東京都' },
  { id: 'kt_ochiai', name: '落合', lat: 35.7139, lng: 139.6861, lines: ['metro_tozai'], prefecture: '東京都' },
  { id: 'kt_takadanobaba', name: '高田馬場', lat: 35.7127, lng: 139.7038, lines: ['metro_tozai', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_waseda', name: '早稲田', lat: 35.7090, lng: 139.7224, lines: ['metro_tozai'], prefecture: '東京都' },
  { id: 'kt_kagurazaka', name: '神楽坂', lat: 35.7035, lng: 139.7388, lines: ['metro_tozai'], prefecture: '東京都' },
  { id: 'kt_iidabashi', name: '飯田橋', lat: 35.7019, lng: 139.7450, lines: ['metro_tozai', 'metro_yurakucho', 'metro_namboku', 'toei_oedo'], prefecture: '東京都' },
  { id: 'kt_kudanshita', name: '九段下', lat: 35.6952, lng: 139.7508, lines: ['metro_tozai', 'metro_hanzomon'], prefecture: '東京都' },
  { id: 'kt_takebashi', name: '竹橋', lat: 35.6916, lng: 139.7576, lines: ['metro_tozai'], prefecture: '東京都' },
  // 大手町はkt_otemachiで定義済み
  // 日本橋はkt_nihombashiで定義済み
  // 茅場町はkt_kayabachoで定義済み
  { id: 'kt_monzennakacho', name: '門前仲町', lat: 35.6726, lng: 139.7962, lines: ['metro_tozai', 'toei_oedo'], prefecture: '東京都' },
  { id: 'kt_kiba', name: '木場', lat: 35.6720, lng: 139.8072, lines: ['metro_tozai'], prefecture: '東京都' },
  { id: 'kt_toyocho', name: '東陽町', lat: 35.6701, lng: 139.8178, lines: ['metro_tozai'], prefecture: '東京都' },
  { id: 'kt_minami_sunamachi', name: '南砂町', lat: 35.6709, lng: 139.8341, lines: ['metro_tozai'], prefecture: '東京都' },
  { id: 'kt_nishi_kasai', name: '西葛西', lat: 35.6591, lng: 139.8549, lines: ['metro_tozai'], prefecture: '東京都' },
  { id: 'kt_kasai', name: '葛西', lat: 35.6599, lng: 139.8687, lines: ['metro_tozai'], prefecture: '東京都' },
  { id: 'kt_urayasu', name: '浦安', lat: 35.6539, lng: 139.8916, lines: ['metro_tozai'], prefecture: '千葉県' },
  { id: 'kt_minami_gyotoku', name: '南行徳', lat: 35.6613, lng: 139.9107, lines: ['metro_tozai'], prefecture: '千葉県' },
  { id: 'kt_gyotoku', name: '行徳', lat: 35.6715, lng: 139.9201, lines: ['metro_tozai'], prefecture: '千葉県' },
  { id: 'kt_myoden', name: '妙典', lat: 35.6805, lng: 139.9295, lines: ['metro_tozai'], prefecture: '千葉県' },
  { id: 'kt_baraki_nakayama', name: '原木中山', lat: 35.6945, lng: 139.9415, lines: ['metro_tozai'], prefecture: '千葉県' },
  { id: 'kt_nishi_funabashi', name: '西船橋', lat: 35.7191, lng: 139.9528, lines: ['metro_tozai'], prefecture: '千葉県' },

  // --------------------------------------------------------
  // 千代田線（代々木上原〜北綾瀬）20駅
  // --------------------------------------------------------
  { id: 'kt_yoyogiuehara', name: '代々木上原', lat: 35.6686, lng: 139.6792, lines: ['metro_chiyoda'], prefecture: '東京都' },
  { id: 'kt_yoyogi_koen', name: '代々木公園', lat: 35.6685, lng: 139.6886, lines: ['metro_chiyoda'], prefecture: '東京都' },
  { id: 'kt_meiji_jingumae', name: '明治神宮前〈原宿〉', lat: 35.6697, lng: 139.7027, lines: ['metro_chiyoda', 'metro_fukutoshin'], prefecture: '東京都' },
  // 表参道はkt_omotesandoで定義済み
  { id: 'kt_nogizaka', name: '乃木坂', lat: 35.6662, lng: 139.7268, lines: ['metro_chiyoda'], prefecture: '東京都' },
  { id: 'kt_akasaka', name: '赤坂', lat: 35.6729, lng: 139.7368, lines: ['metro_chiyoda'], prefecture: '東京都' },
  // 国会議事堂前はkt_kokkai_gijidomaeで定義済み
  // 霞ケ関はkt_kasumigasekiで定義済み
  // 日比谷はkt_hibiyaで定義済み
  { id: 'kt_nijubashimae', name: '二重橋前', lat: 35.6784, lng: 139.7613, lines: ['metro_chiyoda'], prefecture: '東京都' },
  // 大手町はkt_otemachiで定義済み
  { id: 'kt_shin_ochanomizu', name: '新御茶ノ水', lat: 35.6976, lng: 139.7651, lines: ['metro_chiyoda'], prefecture: '東京都' },
  { id: 'kt_yushima', name: '湯島', lat: 35.7079, lng: 139.7684, lines: ['metro_chiyoda'], prefecture: '東京都' },
  { id: 'kt_nezu', name: '根津', lat: 35.7199, lng: 139.7622, lines: ['metro_chiyoda'], prefecture: '東京都' },
  { id: 'kt_sendagi', name: '千駄木', lat: 35.7268, lng: 139.7611, lines: ['metro_chiyoda'], prefecture: '東京都' },
  { id: 'kt_nishi_nippori', name: '西日暮里', lat: 35.7318, lng: 139.7665, lines: ['metro_chiyoda', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_machiya', name: '町屋', lat: 35.7434, lng: 139.7812, lines: ['metro_chiyoda'], prefecture: '東京都' },
  // 北千住はkt_kita_senjuで定義済み（日比谷線と共有）
  { id: 'kt_ayase', name: '綾瀬', lat: 35.7622, lng: 139.8243, lines: ['metro_chiyoda'], prefecture: '東京都' },
  { id: 'kt_kita_ayase', name: '北綾瀬', lat: 35.7748, lng: 139.8293, lines: ['metro_chiyoda'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 有楽町線（和光市〜新木場）24駅
  // --------------------------------------------------------
  { id: 'kt_wakoshi', name: '和光市', lat: 35.7875, lng: 139.6122, lines: ['metro_yurakucho', 'metro_fukutoshin'], prefecture: '埼玉県' },
  { id: 'kt_chikatetsu_narimasu', name: '地下鉄成増', lat: 35.7790, lng: 139.6326, lines: ['metro_yurakucho', 'metro_fukutoshin'], prefecture: '東京都' },
  { id: 'kt_chikatetsu_akatsuka', name: '地下鉄赤塚', lat: 35.7709, lng: 139.6475, lines: ['metro_yurakucho', 'metro_fukutoshin'], prefecture: '東京都' },
  { id: 'kt_heiwadai', name: '平和台', lat: 35.7599, lng: 139.6517, lines: ['metro_yurakucho', 'metro_fukutoshin'], prefecture: '東京都' },
  { id: 'kt_hikawadai', name: '氷川台', lat: 35.7495, lng: 139.6589, lines: ['metro_yurakucho', 'metro_fukutoshin'], prefecture: '東京都' },
  { id: 'kt_kotake_mukaihara', name: '小竹向原', lat: 35.7389, lng: 139.6713, lines: ['metro_yurakucho', 'metro_fukutoshin'], prefecture: '東京都' },
  { id: 'kt_senkawa', name: '千川', lat: 35.7353, lng: 139.6905, lines: ['metro_yurakucho', 'metro_fukutoshin'], prefecture: '東京都' },
  { id: 'kt_kanamecho', name: '要町', lat: 35.7353, lng: 139.7006, lines: ['metro_yurakucho', 'metro_fukutoshin'], prefecture: '東京都' },
  // 池袋はkt_ikebukuroで定義済み
  { id: 'kt_higashi_ikebukuro', name: '東池袋', lat: 35.7288, lng: 139.7187, lines: ['metro_yurakucho'], prefecture: '東京都' },
  { id: 'kt_gokokuji', name: '護国寺', lat: 35.7178, lng: 139.7268, lines: ['metro_yurakucho'], prefecture: '東京都' },
  { id: 'kt_edogawabashi', name: '江戸川橋', lat: 35.7112, lng: 139.7359, lines: ['metro_yurakucho'], prefecture: '東京都' },
  // 飯田橋はkt_iidabashiで定義済み
  { id: 'kt_ichigaya', name: '市ヶ谷', lat: 35.6919, lng: 139.7359, lines: ['metro_yurakucho', 'metro_namboku'], prefecture: '東京都' },
  { id: 'kt_kojimachi', name: '麹町', lat: 35.6867, lng: 139.7405, lines: ['metro_yurakucho'], prefecture: '東京都' },
  { id: 'kt_nagatacho', name: '永田町', lat: 35.6781, lng: 139.7400, lines: ['metro_yurakucho', 'metro_hanzomon', 'metro_namboku'], prefecture: '東京都' },
  { id: 'kt_sakuradamon', name: '桜田門', lat: 35.6765, lng: 139.7524, lines: ['metro_yurakucho'], prefecture: '東京都' },
  { id: 'kt_yurakucho', name: '有楽町', lat: 35.6752, lng: 139.7631, lines: ['metro_yurakucho', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_ginza_itchome', name: '銀座一丁目', lat: 35.6739, lng: 139.7681, lines: ['metro_yurakucho'], prefecture: '東京都' },
  { id: 'kt_shintomicho', name: '新富町', lat: 35.6693, lng: 139.7742, lines: ['metro_yurakucho'], prefecture: '東京都' },
  { id: 'kt_tsukishima', name: '月島', lat: 35.6634, lng: 139.7836, lines: ['metro_yurakucho', 'toei_oedo'], prefecture: '東京都' },
  { id: 'kt_toyosu', name: '豊洲', lat: 35.6535, lng: 139.7964, lines: ['metro_yurakucho'], prefecture: '東京都' },
  { id: 'kt_tatsumi', name: '辰巳', lat: 35.6480, lng: 139.8110, lines: ['metro_yurakucho'], prefecture: '東京都' },
  { id: 'kt_shin_kiba', name: '新木場', lat: 35.6468, lng: 139.8269, lines: ['metro_yurakucho'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 半蔵門線（渋谷〜押上）14駅
  // --------------------------------------------------------
  // 渋谷はkt_shibuyaで定義済み
  // 表参道はkt_omotesandoで定義済み
  // 青山一丁目はkt_aoyama_itchomeで定義済み
  // 永田町はkt_nagatachoで定義済み
  { id: 'kt_hanzomon', name: '半蔵門', lat: 35.6852, lng: 139.7408, lines: ['metro_hanzomon'], prefecture: '東京都' },
  // 九段下はkt_kudanshitaで定義済み
  { id: 'kt_jimbocho', name: '神保町', lat: 35.6959, lng: 139.7578, lines: ['metro_hanzomon'], prefecture: '東京都' },
  // 大手町はkt_otemachiで定義済み
  // 三越前はkt_mitsukoshimaeで定義済み
  { id: 'kt_suitengumae', name: '水天宮前', lat: 35.6835, lng: 139.7847, lines: ['metro_hanzomon'], prefecture: '東京都' },
  { id: 'kt_kiyosumi_shirakawa', name: '清澄白河', lat: 35.6802, lng: 139.8006, lines: ['metro_hanzomon', 'toei_oedo'], prefecture: '東京都' },
  { id: 'kt_sumiyoshi', name: '住吉', lat: 35.6830, lng: 139.8138, lines: ['metro_hanzomon'], prefecture: '東京都' },
  { id: 'kt_kinshicho', name: '錦糸町', lat: 35.6962, lng: 139.8145, lines: ['metro_hanzomon'], prefecture: '東京都' },
  { id: 'kt_oshiage', name: '押上', lat: 35.7109, lng: 139.8132, lines: ['metro_hanzomon', 'toei_asakusa'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 南北線（目黒〜赤羽岩淵）19駅
  // --------------------------------------------------------
  { id: 'kt_meguro', name: '目黒', lat: 35.6337, lng: 139.7158, lines: ['metro_namboku'], prefecture: '東京都' },
  { id: 'kt_shirokanedai', name: '白金台', lat: 35.6385, lng: 139.7264, lines: ['metro_namboku'], prefecture: '東京都' },
  { id: 'kt_shirokanetakanawa', name: '白金高輪', lat: 35.6432, lng: 139.7335, lines: ['metro_namboku'], prefecture: '東京都' },
  { id: 'kt_azabu_juban', name: '麻布十番', lat: 35.6555, lng: 139.7363, lines: ['metro_namboku', 'toei_oedo'], prefecture: '東京都' },
  { id: 'kt_roppongi_itchome', name: '六本木一丁目', lat: 35.6637, lng: 139.7389, lines: ['metro_namboku'], prefecture: '東京都' },
  // 溜池山王はkt_tameike_sannoで定義済み
  // 永田町はkt_nagatachoで定義済み
  // 四ツ谷はkt_yotsuyaで定義済み
  // 市ヶ谷はkt_ichigayaで定義済み
  // 飯田橋はkt_iidabashiで定義済み
  // 後楽園はkt_korakuenで定義済み
  { id: 'kt_todaimae', name: '東大前', lat: 35.7194, lng: 139.7570, lines: ['metro_namboku'], prefecture: '東京都' },
  { id: 'kt_hon_komagome', name: '本駒込', lat: 35.7283, lng: 139.7459, lines: ['metro_namboku'], prefecture: '東京都' },
  { id: 'kt_komagome', name: '駒込', lat: 35.7368, lng: 139.7468, lines: ['metro_namboku', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_nishigahara', name: '西ケ原', lat: 35.7430, lng: 139.7412, lines: ['metro_namboku'], prefecture: '東京都' },
  { id: 'kt_oji', name: '王子', lat: 35.7528, lng: 139.7383, lines: ['metro_namboku'], prefecture: '東京都' },
  { id: 'kt_oji_kamiya', name: '王子神谷', lat: 35.7618, lng: 139.7350, lines: ['metro_namboku'], prefecture: '東京都' },
  { id: 'kt_shimo', name: '志茂', lat: 35.7761, lng: 139.7236, lines: ['metro_namboku'], prefecture: '東京都' },
  { id: 'kt_akabane_iwabuchi', name: '赤羽岩淵', lat: 35.7826, lng: 139.7198, lines: ['metro_namboku'], prefecture: '東京都' },

  // --------------------------------------------------------
  // 副都心線（和光市〜渋谷）16駅
  // 和光市〜小竹向原〜千川〜要町は有楽町線と共有
  // --------------------------------------------------------
  // 和光市〜要町は有楽町線で定義済み
  // 池袋はkt_ikebukuroで定義済み
  { id: 'kt_zoshigaya', name: '雑司が谷', lat: 35.7218, lng: 139.7131, lines: ['metro_fukutoshin'], prefecture: '東京都' },
  { id: 'kt_nishi_waseda', name: '西早稲田', lat: 35.7124, lng: 139.7093, lines: ['metro_fukutoshin'], prefecture: '東京都' },
  { id: 'kt_higashi_shinjuku', name: '東新宿', lat: 35.6959, lng: 139.7074, lines: ['metro_fukutoshin', 'toei_oedo'], prefecture: '東京都' },
  // 新宿三丁目はkt_shinjuku_sanchomeで定義済み
  { id: 'kt_kita_sando', name: '北参道', lat: 35.6798, lng: 139.7062, lines: ['metro_fukutoshin'], prefecture: '東京都' },
  // 明治神宮前はkt_meiji_jingumaeで定義済み
  // 渋谷はkt_shibuyaで定義済み

  // --------------------------------------------------------
  // 都営浅草線（西馬込〜押上）20駅
  // --------------------------------------------------------
  { id: 'kt_nishimagome', name: '西馬込', lat: 35.5878, lng: 139.7095, lines: ['toei_asakusa'], prefecture: '東京都' },
  { id: 'kt_magome', name: '馬込', lat: 35.5950, lng: 139.7108, lines: ['toei_asakusa'], prefecture: '東京都' },
  { id: 'kt_nakanobu', name: '中延', lat: 35.6064, lng: 139.7122, lines: ['toei_asakusa'], prefecture: '東京都' },
  { id: 'kt_togoshi', name: '戸越', lat: 35.6143, lng: 139.7143, lines: ['toei_asakusa'], prefecture: '東京都' },
  { id: 'kt_gotanda', name: '五反田', lat: 35.6258, lng: 139.7234, lines: ['toei_asakusa', 'jr_yamanote'], prefecture: '東京都' },
  { id: 'kt_takanawadai', name: '高輪台', lat: 35.6330, lng: 139.7322, lines: ['toei_asakusa'], prefecture: '東京都' },
  { id: 'kt_sengakuji', name: '泉岳寺', lat: 35.6381, lng: 139.7399, lines: ['toei_asakusa'], prefecture: '東京都' },
  { id: 'kt_mita', name: '三田', lat: 35.6486, lng: 139.7466, lines: ['toei_asakusa'], prefecture: '東京都' },
  { id: 'kt_daimon', name: '大門', lat: 35.6565, lng: 139.7541, lines: ['toei_asakusa', 'toei_oedo'], prefecture: '東京都' },
  // 新橋はkt_shimbashiで定義済み
  // 東銀座はkt_higashi_ginzaで定義済み
  { id: 'kt_takaracho', name: '宝町', lat: 35.6755, lng: 139.7719, lines: ['toei_asakusa'], prefecture: '東京都' },
  // 日本橋はkt_nihombashiで定義済み
  // 人形町はkt_ningyochoで定義済み（日比谷線と共有）
  { id: 'kt_higashi_nihombashi', name: '東日本橋', lat: 35.6910, lng: 139.7874, lines: ['toei_asakusa'], prefecture: '東京都' },
  { id: 'kt_asakusabashi', name: '浅草橋', lat: 35.6961, lng: 139.7858, lines: ['toei_asakusa'], prefecture: '東京都' },
  { id: 'kt_kuramae', name: '蔵前', lat: 35.7017, lng: 139.7922, lines: ['toei_asakusa', 'toei_oedo'], prefecture: '東京都' },
  // 浅草はkt_asakusaで定義済み（銀座線と共有）
  { id: 'kt_honjo_azumabashi', name: '本所吾妻橋', lat: 35.7101, lng: 139.8048, lines: ['toei_asakusa'], prefecture: '東京都' },
  // 押上はkt_oshiageで定義済み

  // --------------------------------------------------------
  // 都営大江戸線 38駅
  // 放射部: 光が丘〜都庁前（11駅）
  // 環状部: 都庁前〜新宿西口〜...〜新宿〜都庁前（28駅）
  // --------------------------------------------------------
  // 放射部
  { id: 'kt_hikarigaoka', name: '光が丘', lat: 35.7634, lng: 139.6322, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_nerima_kasugacho', name: '練馬春日町', lat: 35.7529, lng: 139.6390, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_toshimaen', name: '豊島園', lat: 35.7440, lng: 139.6490, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_nerima', name: '練馬', lat: 35.7379, lng: 139.6536, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_shin_egota', name: '新江古田', lat: 35.7329, lng: 139.6671, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_ochiai_minami_nagasaki', name: '落合南長崎', lat: 35.7249, lng: 139.6810, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_nakai', name: '中井', lat: 35.7146, lng: 139.6855, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_higashi_nakano', name: '東中野', lat: 35.7070, lng: 139.6843, lines: ['toei_oedo'], prefecture: '東京都' },
  // 中野坂上はkt_nakano_sakaueで定義済み（丸ノ内線と共有）
  { id: 'kt_nishi_shinjuku_gochome', name: '西新宿五丁目', lat: 35.6928, lng: 139.6870, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_tochomae', name: '都庁前', lat: 35.6919, lng: 139.6917, lines: ['toei_oedo'], prefecture: '東京都' },
  // 環状部（都庁前から反時計回り）
  { id: 'kt_shinjuku_nishiguchi', name: '新宿西口', lat: 35.6944, lng: 139.6987, lines: ['toei_oedo'], prefecture: '東京都' },
  // 東新宿はkt_higashi_shinjukuで定義済み
  { id: 'kt_wakamatsu_kawada', name: '若松河田', lat: 35.6982, lng: 139.7201, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_ushigome_yanagicho', name: '牛込柳町', lat: 35.6999, lng: 139.7275, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_ushigome_kagurazaka', name: '牛込神楽坂', lat: 35.7024, lng: 139.7337, lines: ['toei_oedo'], prefecture: '東京都' },
  // 飯田橋はkt_iidabashiで定義済み
  { id: 'kt_kasuga', name: '春日', lat: 35.7081, lng: 139.7523, lines: ['toei_oedo'], prefecture: '東京都' },
  // 本郷三丁目はkt_hongo_sanchomeで定義済み
  { id: 'kt_ueno_okachimachi', name: '上野御徒町', lat: 35.7077, lng: 139.7731, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_shin_okachimachi', name: '新御徒町', lat: 35.7074, lng: 139.7800, lines: ['toei_oedo'], prefecture: '東京都' },
  // 蔵前はkt_kuramaeで定義済み
  { id: 'kt_ryogoku', name: '両国', lat: 35.6958, lng: 139.7929, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_morishita', name: '森下', lat: 35.6868, lng: 139.7960, lines: ['toei_oedo'], prefecture: '東京都' },
  // 清澄白河はkt_kiyosumi_shirakawaで定義済み
  // 門前仲町はkt_monnzennakachoで定義済み
  // 月島はkt_tsukishimaで定義済み
  { id: 'kt_kachidoki', name: '勝どき', lat: 35.6594, lng: 139.7771, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_tsukijishijo', name: '築地市場', lat: 35.6613, lng: 139.7680, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_shiodome', name: '汐留', lat: 35.6614, lng: 139.7625, lines: ['toei_oedo'], prefecture: '東京都' },
  // 大門はkt_daimonで定義済み
  { id: 'kt_akabanebashi', name: '赤羽橋', lat: 35.6528, lng: 139.7448, lines: ['toei_oedo'], prefecture: '東京都' },
  // 麻布十番はkt_azabu_jubanで定義済み
  // 六本木はkt_roppongiで定義済み
  // 青山一丁目はkt_aoyama_itchomeで定義済み
  { id: 'kt_kokuritsu_kyogijo', name: '国立競技場', lat: 35.6789, lng: 139.7144, lines: ['toei_oedo'], prefecture: '東京都' },
  { id: 'kt_yoyogi', name: '代々木', lat: 35.6833, lng: 139.7020, lines: ['toei_oedo'], prefecture: '東京都' },
  // 新宿はkt_shinjukuで定義済み
  // 環状部の終点は都庁前（kt_tochomae）に戻る
];

// ============================================================
// 路線データ
// ============================================================

const lines: LineData[] = [
  // --------------------------------------------------------
  // 東京メトロ
  // --------------------------------------------------------
  {
    id: 'metro_ginza',
    name: '東京メトロ銀座線',
    company: '東京メトロ',
    color: '#FF9500',
    vehicleType: 'subway',
    stationIds: [
      'kt_shibuya', 'kt_omotesando', 'kt_gaienmae', 'kt_aoyama_itchome',
      'kt_akasaka_mitsuke', 'kt_tameike_sanno', 'kt_toranomon', 'kt_shimbashi',
      'kt_ginza', 'kt_kyobashi', 'kt_nihombashi', 'kt_mitsukoshimae',
      'kt_kanda', 'kt_suehirocho', 'kt_ueno_hirokoji', 'kt_ueno',
      'kt_inaricho', 'kt_tawaramachi', 'kt_asakusa',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },
  {
    id: 'metro_marunouchi',
    name: '東京メトロ丸ノ内線',
    company: '東京メトロ',
    color: '#F62E36',
    vehicleType: 'subway',
    stationIds: [
      'kt_ogikubo', 'kt_minami_asagaya', 'kt_shin_koenji', 'kt_higashi_koenji',
      'kt_shin_nakano', 'kt_nakano_sakaue', 'kt_nishi_shinjuku', 'kt_shinjuku',
      'kt_shinjuku_sanchome', 'kt_shinjuku_gyoenmae', 'kt_yotsuya_sanchome',
      'kt_yotsuya', 'kt_akasaka_mitsuke', 'kt_kokkai_gijidomae',
      'kt_kasumigaseki', 'kt_ginza', 'kt_tokyo', 'kt_otemachi',
      'kt_awajicho', 'kt_ochanomizu', 'kt_hongo_sanchome', 'kt_korakuen',
      'kt_myogadani', 'kt_shin_otsuka', 'kt_ikebukuro',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },
  {
    id: 'metro_hibiya',
    name: '東京メトロ日比谷線',
    company: '東京メトロ',
    color: '#9CAEB7',
    vehicleType: 'subway',
    stationIds: [
      'kt_nakameguro', 'kt_ebisu', 'kt_hiroo', 'kt_roppongi',
      'kt_kamiyacho', 'kt_toranomon_hills', 'kt_kasumigaseki', 'kt_hibiya', 'kt_ginza',
      'kt_higashi_ginza', 'kt_tsukiji', 'kt_hacchobori', 'kt_kayabacho',
      'kt_ningyocho', 'kt_kodemmacho', 'kt_akihabara', 'kt_naka_okachimachi',
      'kt_ueno', 'kt_iriya', 'kt_minowa', 'kt_minami_senju', 'kt_kita_senju',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },
  {
    id: 'metro_tozai',
    name: '東京メトロ東西線',
    company: '東京メトロ',
    color: '#009BBF',
    vehicleType: 'subway',
    stationIds: [
      'kt_nakano', 'kt_ochiai', 'kt_takadanobaba', 'kt_waseda',
      'kt_kagurazaka', 'kt_iidabashi', 'kt_kudanshita', 'kt_takebashi',
      'kt_otemachi', 'kt_nihombashi', 'kt_kayabacho', 'kt_monzennakacho',
      'kt_kiba', 'kt_toyocho', 'kt_minami_sunamachi', 'kt_nishi_kasai',
      'kt_kasai', 'kt_urayasu', 'kt_minami_gyotoku', 'kt_gyotoku',
      'kt_myoden', 'kt_baraki_nakayama', 'kt_nishi_funabashi',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },
  {
    id: 'metro_chiyoda',
    name: '東京メトロ千代田線',
    company: '東京メトロ',
    color: '#00A650',
    vehicleType: 'subway',
    stationIds: [
      'kt_yoyogiuehara', 'kt_yoyogi_koen', 'kt_meiji_jingumae',
      'kt_omotesando', 'kt_nogizaka', 'kt_akasaka', 'kt_kokkai_gijidomae',
      'kt_kasumigaseki', 'kt_hibiya', 'kt_nijubashimae', 'kt_otemachi',
      'kt_shin_ochanomizu', 'kt_yushima', 'kt_nezu', 'kt_sendagi',
      'kt_nishi_nippori', 'kt_machiya', 'kt_kita_senju', 'kt_ayase',
      'kt_kita_ayase',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },
  {
    id: 'metro_yurakucho',
    name: '東京メトロ有楽町線',
    company: '東京メトロ',
    color: '#C1A470',
    vehicleType: 'subway',
    stationIds: [
      'kt_wakoshi', 'kt_chikatetsu_narimasu', 'kt_chikatetsu_akatsuka',
      'kt_heiwadai', 'kt_hikawadai', 'kt_kotake_mukaihara', 'kt_senkawa',
      'kt_kanamecho', 'kt_ikebukuro', 'kt_higashi_ikebukuro', 'kt_gokokuji',
      'kt_edogawabashi', 'kt_iidabashi', 'kt_ichigaya', 'kt_kojimachi',
      'kt_nagatacho', 'kt_sakuradamon', 'kt_yurakucho', 'kt_ginza_itchome',
      'kt_shintomicho', 'kt_tsukishima', 'kt_toyosu', 'kt_tatsumi',
      'kt_shin_kiba',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },
  {
    id: 'metro_hanzomon',
    name: '東京メトロ半蔵門線',
    company: '東京メトロ',
    color: '#8F76D6',
    vehicleType: 'subway',
    stationIds: [
      'kt_shibuya', 'kt_omotesando', 'kt_aoyama_itchome', 'kt_nagatacho',
      'kt_hanzomon', 'kt_kudanshita', 'kt_jimbocho', 'kt_otemachi',
      'kt_mitsukoshimae', 'kt_suitengumae', 'kt_kiyosumi_shirakawa',
      'kt_sumiyoshi', 'kt_kinshicho', 'kt_oshiage',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },
  {
    id: 'metro_namboku',
    name: '東京メトロ南北線',
    company: '東京メトロ',
    color: '#00AC9B',
    vehicleType: 'subway',
    stationIds: [
      'kt_meguro', 'kt_shirokanedai', 'kt_shirokanetakanawa',
      'kt_azabu_juban', 'kt_roppongi_itchome', 'kt_tameike_sanno',
      'kt_nagatacho', 'kt_yotsuya', 'kt_ichigaya', 'kt_iidabashi',
      'kt_korakuen', 'kt_todaimae', 'kt_hon_komagome', 'kt_komagome',
      'kt_nishigahara', 'kt_oji', 'kt_oji_kamiya', 'kt_shimo',
      'kt_akabane_iwabuchi',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },
  {
    id: 'metro_fukutoshin',
    name: '東京メトロ副都心線',
    company: '東京メトロ',
    color: '#9C5E31',
    vehicleType: 'subway',
    stationIds: [
      'kt_wakoshi', 'kt_chikatetsu_narimasu', 'kt_chikatetsu_akatsuka',
      'kt_heiwadai', 'kt_hikawadai', 'kt_kotake_mukaihara', 'kt_senkawa',
      'kt_kanamecho', 'kt_ikebukuro', 'kt_zoshigaya', 'kt_nishi_waseda',
      'kt_higashi_shinjuku', 'kt_shinjuku_sanchome', 'kt_kita_sando',
      'kt_meiji_jingumae', 'kt_shibuya',
    ],
    isLoop: false,
    avgIntervalMinutes: 2,
  },

  // --------------------------------------------------------
  // 都営地下鉄（浅草線・大江戸線）
  // 三田線・新宿線は kanto_jr.ts で定義済み
  // --------------------------------------------------------
  {
    id: 'toei_asakusa',
    name: '都営浅草線',
    company: '東京都交通局',
    color: '#E85298',
    vehicleType: 'subway',
    stationIds: [
      'kt_nishimagome', 'kt_magome', 'kt_nakanobu', 'kt_togoshi',
      'kt_gotanda', 'kt_takanawadai', 'kt_sengakuji', 'kt_mita',
      'kt_daimon', 'kt_shimbashi', 'kt_higashi_ginza', 'kt_takaracho',
      'kt_nihombashi', 'kt_ningyocho', 'kt_higashi_nihombashi',
      'kt_asakusabashi', 'kt_kuramae', 'kt_asakusa', 'kt_honjo_azumabashi',
      'kt_oshiage',
    ],
    isLoop: false,
    avgIntervalMinutes: 3,
  },
  {
    id: 'toei_oedo',
    name: '都営大江戸線',
    company: '東京都交通局',
    color: '#B6007A',
    vehicleType: 'subway',
    stationIds: [
      // 放射部: 光が丘 → 都庁前（11駅）
      'kt_hikarigaoka', 'kt_nerima_kasugacho', 'kt_toshimaen',
      'kt_nerima', 'kt_shin_egota', 'kt_ochiai_minami_nagasaki',
      'kt_nakai', 'kt_higashi_nakano',
      'kt_nakano_sakaue', 'kt_nishi_shinjuku_gochome', 'kt_tochomae',
      // 環状部: 都庁前 → 新宿西口 → ... → 新宿 → 都庁前（28駅、都庁前を末尾に重複配置）
      'kt_shinjuku_nishiguchi', 'kt_higashi_shinjuku',
      'kt_wakamatsu_kawada', 'kt_ushigome_yanagicho', 'kt_ushigome_kagurazaka', 'kt_iidabashi',
      'kt_kasuga', 'kt_hongo_sanchome', 'kt_ueno_okachimachi',
      'kt_shin_okachimachi', 'kt_kuramae', 'kt_ryogoku', 'kt_morishita',
      'kt_kiyosumi_shirakawa', 'kt_monzennakacho', 'kt_tsukishima',
      'kt_kachidoki', 'kt_tsukijishijo', 'kt_shiodome', 'kt_daimon',
      'kt_akabanebashi', 'kt_azabu_juban', 'kt_roppongi',
      'kt_aoyama_itchome', 'kt_kokuritsu_kyogijo', 'kt_yoyogi',
      'kt_shinjuku', 'kt_tochomae',
    ],
    isLoop: false, // 6の字型: 新宿→都庁前で環状部を閉じる（都庁前を末尾に重複配置）
    avgIntervalMinutes: 3,
  },
];

// ============================================================
// エクスポート
// ============================================================

export const kantoMetroData: RegionData = { stations, lines };
