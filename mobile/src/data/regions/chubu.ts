/**
 * 中部・東海地方（名古屋エリア）鉄道データ
 *
 * 名古屋市営地下鉄、名鉄主要路線、JR東海、あおなみ線、リニモの
 * 駅・路線情報。駅IDは cb_ プレフィクス。
 */

import { StationData, LineData, RegionData } from '../types';

// ---------------------------------------------------------------------------
// 駅データ
// ---------------------------------------------------------------------------

const stations: StationData[] = [
  // ========== 名古屋市営地下鉄 東山線 ==========
  { id: 'cb_takabata', name: '高畑', lat: 35.1522, lng: 136.8380, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_hatta', name: '八田', lat: 35.1550, lng: 136.8543, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_iwatsuka', name: '岩塚', lat: 35.1570, lng: 136.8647, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_nakamura_koen', name: '中村公園', lat: 35.1630, lng: 136.8597, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_nakamura_nisseki', name: '中村日赤', lat: 35.1686, lng: 136.8618, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_honjin', name: '本陣', lat: 35.1735, lng: 136.8683, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_kamejima', name: '亀島', lat: 35.1760, lng: 136.8760, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_nagoya', name: '名古屋', lat: 35.1709, lng: 136.8815, lines: ['nagoya_higashiyama', 'nagoya_sakuradori', 'meitetsu_honsen', 'meitetsu_inuyama', 'jr_chuo_nagoya', 'jr_tokaido_nagoya', 'aonami'], prefecture: '愛知県' },
  { id: 'cb_fushimi', name: '伏見', lat: 35.1698, lng: 136.8942, lines: ['nagoya_higashiyama', 'nagoya_tsurumai'], prefecture: '愛知県' },
  { id: 'cb_sakae', name: '栄', lat: 35.1681, lng: 136.9066, lines: ['nagoya_higashiyama', 'nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_shinsakae', name: '新栄町', lat: 35.1685, lng: 136.9177, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_chikusa', name: '千種', lat: 35.1705, lng: 136.9310, lines: ['nagoya_higashiyama', 'jr_chuo_nagoya'], prefecture: '愛知県' },
  { id: 'cb_imaike', name: '今池', lat: 35.1720, lng: 136.9395, lines: ['nagoya_higashiyama', 'nagoya_sakuradori'], prefecture: '愛知県' },
  { id: 'cb_ikeshita', name: '池下', lat: 35.1693, lng: 136.9470, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_kakuozan', name: '覚王山', lat: 35.1671, lng: 136.9540, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_motoyama', name: '本山', lat: 35.1630, lng: 136.9590, lines: ['nagoya_higashiyama', 'nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_higashiyama_koen', name: '東山公園', lat: 35.1582, lng: 136.9672, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_hoshigaoka', name: '星ヶ丘', lat: 35.1569, lng: 136.9766, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_issha', name: '一社', lat: 35.1572, lng: 136.9870, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_kamiyashiro', name: '上社', lat: 35.1585, lng: 136.9960, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_hongo', name: '本郷', lat: 35.1580, lng: 137.0071, lines: ['nagoya_higashiyama'], prefecture: '愛知県' },
  { id: 'cb_fujigaoka', name: '藤が丘', lat: 35.1575, lng: 137.0164, lines: ['nagoya_higashiyama', 'linimo'], prefecture: '愛知県' },

  // ========== 名古屋市営地下鉄 名城線 ==========
  { id: 'cb_ozone', name: '大曽根', lat: 35.1897, lng: 136.9387, lines: ['nagoya_meijo', 'jr_chuo_nagoya'], prefecture: '愛知県' },
  { id: 'cb_nagoya_dome', name: 'ナゴヤドーム前矢田', lat: 35.1866, lng: 136.9468, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_sunadabashi', name: '砂田橋', lat: 35.1818, lng: 136.9496, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_chayagasaka', name: '茶屋ヶ坂', lat: 35.1774, lng: 136.9533, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_jiyugaoka', name: '自由ヶ丘', lat: 35.1716, lng: 136.9569, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  // cb_motoyama は東山線で定義済み
  { id: 'cb_nagoya_daigaku', name: '名古屋大学', lat: 35.1530, lng: 136.9630, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_yagoto_nisseki', name: '八事日赤', lat: 35.1478, lng: 136.9600, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_yagoto', name: '八事', lat: 35.1430, lng: 136.9560, lines: ['nagoya_meijo', 'nagoya_tsurumai'], prefecture: '愛知県' },
  { id: 'cb_sogo_riha', name: '総合リハビリセンター', lat: 35.1368, lng: 136.9508, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_mizuho_undojo_higashi', name: '瑞穂運動場東', lat: 35.1295, lng: 136.9440, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_shin_aratama', name: '新瑞橋', lat: 35.1218, lng: 136.9353, lines: ['nagoya_meijo', 'nagoya_sakuradori'], prefecture: '愛知県' },
  { id: 'cb_myoon_dori', name: '妙音通', lat: 35.1210, lng: 136.9253, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_hotta_meijo', name: '堀田', lat: 35.1222, lng: 136.9155, lines: ['nagoya_meijo', 'meitetsu_honsen'], prefecture: '愛知県' },
  { id: 'cb_temmacho', name: '伝馬町', lat: 35.1248, lng: 136.9070, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_jingu_nishi', name: '神宮西', lat: 35.1260, lng: 136.8980, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_nishitakakura', name: '西高蔵', lat: 35.1312, lng: 136.8950, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_kanayama', name: '金山', lat: 35.1425, lng: 136.9005, lines: ['nagoya_meijo', 'nagoya_meiko', 'meitetsu_honsen', 'meitetsu_tokoname', 'jr_chuo_nagoya', 'jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_higashi_betsuin', name: '東別院', lat: 35.1512, lng: 136.9003, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_kamimaezu', name: '上前津', lat: 35.1580, lng: 136.9030, lines: ['nagoya_meijo', 'nagoya_tsurumai'], prefecture: '愛知県' },
  { id: 'cb_yabacho', name: '矢場町', lat: 35.1627, lng: 136.9066, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  // cb_sakae は東山線で定義済み
  { id: 'cb_hisaya_odori', name: '久屋大通', lat: 35.1716, lng: 136.9098, lines: ['nagoya_meijo', 'nagoya_sakuradori'], prefecture: '愛知県' },
  { id: 'cb_shiyakusho', name: '市役所', lat: 35.1788, lng: 136.9090, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_meijo_koen', name: '名城公園', lat: 35.1850, lng: 136.9070, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_kurokawa', name: '黒川', lat: 35.1920, lng: 136.9053, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_shiga_hondori', name: '志賀本通', lat: 35.1968, lng: 136.9115, lines: ['nagoya_meijo'], prefecture: '愛知県' },
  { id: 'cb_heian_dori', name: '平安通', lat: 35.1970, lng: 136.9228, lines: ['nagoya_meijo', 'nagoya_kamiiida'], prefecture: '愛知県' },
  // cb_ozone は上で定義済み（名城線ループの起点・終点）

  // ========== 名古屋市営地下鉄 名港線 ==========
  // cb_kanayama は名城線で定義済み
  { id: 'cb_hibino', name: '日比野', lat: 35.1365, lng: 136.8920, lines: ['nagoya_meiko'], prefecture: '愛知県' },
  { id: 'cb_rokubancho', name: '六番町', lat: 35.1312, lng: 136.8820, lines: ['nagoya_meiko'], prefecture: '愛知県' },
  { id: 'cb_tokai_dori', name: '東海通', lat: 35.1240, lng: 136.8735, lines: ['nagoya_meiko'], prefecture: '愛知県' },
  { id: 'cb_minato_kuyakusho', name: '港区役所', lat: 35.1155, lng: 136.8650, lines: ['nagoya_meiko'], prefecture: '愛知県' },
  { id: 'cb_tsukijiguchi', name: '築地口', lat: 35.1085, lng: 136.8580, lines: ['nagoya_meiko'], prefecture: '愛知県' },
  { id: 'cb_nagoya_minato', name: '名古屋港', lat: 35.1010, lng: 136.8482, lines: ['nagoya_meiko'], prefecture: '愛知県' },

  // ========== 名古屋市営地下鉄 鶴舞線 ==========
  { id: 'cb_kami_otai', name: '上小田井', lat: 35.2000, lng: 136.8653, lines: ['nagoya_tsurumai', 'meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_shonai_ryokuchi_koen', name: '庄内緑地公園', lat: 35.1960, lng: 136.8700, lines: ['nagoya_tsurumai'], prefecture: '愛知県' },
  { id: 'cb_shonai_dori', name: '庄内通', lat: 35.1910, lng: 136.8775, lines: ['nagoya_tsurumai'], prefecture: '愛知県' },
  { id: 'cb_joshin', name: '浄心', lat: 35.1852, lng: 136.8853, lines: ['nagoya_tsurumai'], prefecture: '愛知県' },
  { id: 'cb_sengencho', name: '浅間町', lat: 35.1812, lng: 136.8935, lines: ['nagoya_tsurumai'], prefecture: '愛知県' },
  { id: 'cb_marunouchi', name: '丸の内', lat: 35.1762, lng: 136.8985, lines: ['nagoya_tsurumai', 'nagoya_sakuradori'], prefecture: '愛知県' },
  // cb_fushimi は東山線で定義済み
  { id: 'cb_osu_kannon', name: '大須観音', lat: 35.1627, lng: 136.8958, lines: ['nagoya_tsurumai'], prefecture: '愛知県' },
  // cb_kamimaezu は名城線で定義済み
  { id: 'cb_tsurumai', name: '鶴舞', lat: 35.1560, lng: 136.9142, lines: ['nagoya_tsurumai', 'jr_chuo_nagoya'], prefecture: '愛知県' },
  { id: 'cb_arahata', name: '荒畑', lat: 35.1508, lng: 136.9220, lines: ['nagoya_tsurumai'], prefecture: '愛知県' },
  { id: 'cb_gokiso', name: '御器所', lat: 35.1451, lng: 136.9282, lines: ['nagoya_tsurumai', 'nagoya_sakuradori'], prefecture: '愛知県' },
  { id: 'cb_kawana', name: '川名', lat: 35.1405, lng: 136.9370, lines: ['nagoya_tsurumai'], prefecture: '愛知県' },
  { id: 'cb_irinaka', name: 'いりなか', lat: 35.1407, lng: 136.9470, lines: ['nagoya_tsurumai'], prefecture: '愛知県' },
  // cb_yagoto は名城線で定義済み
  { id: 'cb_shiogamaguchi', name: '塩釜口', lat: 35.1370, lng: 136.9640, lines: ['nagoya_tsurumai'], prefecture: '愛知県' },
  { id: 'cb_ueda', name: '植田', lat: 35.1330, lng: 136.9730, lines: ['nagoya_tsurumai'], prefecture: '愛知県' },
  { id: 'cb_hara', name: '原', lat: 35.1270, lng: 136.9810, lines: ['nagoya_tsurumai'], prefecture: '愛知県' },
  { id: 'cb_hirabari', name: '平針', lat: 35.1210, lng: 136.9885, lines: ['nagoya_tsurumai'], prefecture: '愛知県' },
  { id: 'cb_akaike', name: '赤池', lat: 35.1137, lng: 136.9968, lines: ['nagoya_tsurumai'], prefecture: '愛知県' },

  // ========== 名古屋市営地下鉄 桜通線 ==========
  { id: 'cb_nakamura_kuyakusho', name: '中村区役所', lat: 35.1735, lng: 136.8660, lines: ['nagoya_sakuradori'], prefecture: '愛知県' },
  // cb_nagoya は東山線で定義済み
  { id: 'cb_kokusai_center', name: '国際センター', lat: 35.1738, lng: 136.8880, lines: ['nagoya_sakuradori'], prefecture: '愛知県' },
  // cb_marunouchi は鶴舞線で定義済み
  // cb_hisaya_odori は名城線で定義済み
  { id: 'cb_takaoka', name: '高岳', lat: 35.1755, lng: 136.9175, lines: ['nagoya_sakuradori'], prefecture: '愛知県' },
  { id: 'cb_kurumamichi', name: '車道', lat: 35.1762, lng: 136.9305, lines: ['nagoya_sakuradori'], prefecture: '愛知県' },
  // cb_imaike は東山線で定義済み
  { id: 'cb_fukiage', name: '吹上', lat: 35.1612, lng: 136.9388, lines: ['nagoya_sakuradori'], prefecture: '愛知県' },
  // cb_gokiso は鶴舞線で定義済み
  { id: 'cb_sakurayama', name: '桜山', lat: 35.1380, lng: 136.9255, lines: ['nagoya_sakuradori'], prefecture: '愛知県' },
  { id: 'cb_mizuho_kuyakusho', name: '瑞穂区役所', lat: 35.1318, lng: 136.9285, lines: ['nagoya_sakuradori'], prefecture: '愛知県' },
  { id: 'cb_mizuho_undojo_nishi', name: '瑞穂運動場西', lat: 35.1258, lng: 136.9310, lines: ['nagoya_sakuradori'], prefecture: '愛知県' },
  // cb_shin_aratama は名城線で定義済み
  { id: 'cb_sakuramoto', name: '桜本町', lat: 35.1138, lng: 136.9340, lines: ['nagoya_sakuradori'], prefecture: '愛知県' },
  { id: 'cb_naruko_kita', name: '鳴子北', lat: 35.1050, lng: 136.9440, lines: ['nagoya_sakuradori'], prefecture: '愛知県' },
  { id: 'cb_aioiyama', name: '相生山', lat: 35.0988, lng: 136.9530, lines: ['nagoya_sakuradori'], prefecture: '愛知県' },
  { id: 'cb_kamisawa', name: '神沢', lat: 35.0920, lng: 136.9600, lines: ['nagoya_sakuradori'], prefecture: '愛知県' },
  { id: 'cb_tokushige', name: '徳重', lat: 35.0855, lng: 136.9660, lines: ['nagoya_sakuradori'], prefecture: '愛知県' },

  // ========== 名古屋市営地下鉄 上飯田線 ==========
  { id: 'cb_kamiiida', name: '上飯田', lat: 35.2020, lng: 136.9277, lines: ['nagoya_kamiiida'], prefecture: '愛知県' },
  // cb_heian_dori は名城線で定義済み

  // ========== 名鉄名古屋本線 ==========
  { id: 'cb_toyohashi', name: '豊橋', lat: 34.7631, lng: 137.3823, lines: ['meitetsu_honsen', 'jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_koo', name: '国府', lat: 34.8245, lng: 137.3075, lines: ['meitetsu_honsen'], prefecture: '愛知県' },
  { id: 'cb_higashi_okazaki', name: '東岡崎', lat: 34.9548, lng: 137.1773, lines: ['meitetsu_honsen'], prefecture: '愛知県' },
  { id: 'cb_shin_anjo', name: '新安城', lat: 34.9658, lng: 137.0690, lines: ['meitetsu_honsen'], prefecture: '愛知県' },
  { id: 'cb_chiryu', name: '知立', lat: 35.0000, lng: 137.0450, lines: ['meitetsu_honsen'], prefecture: '愛知県' },
  { id: 'cb_zengo', name: '前後', lat: 35.0375, lng: 136.9780, lines: ['meitetsu_honsen'], prefecture: '愛知県' },
  { id: 'cb_chukyo_keibajo', name: '中京競馬場前', lat: 35.0520, lng: 136.9655, lines: ['meitetsu_honsen'], prefecture: '愛知県' },
  { id: 'cb_arimatsu', name: '有松', lat: 35.0650, lng: 136.9540, lines: ['meitetsu_honsen'], prefecture: '愛知県' },
  { id: 'cb_narumi', name: '鳴海', lat: 35.0793, lng: 136.9430, lines: ['meitetsu_honsen'], prefecture: '愛知県' },
  { id: 'cb_moto_kasadera', name: '本笠寺', lat: 35.1015, lng: 136.9230, lines: ['meitetsu_honsen'], prefecture: '愛知県' },
  // cb_hotta_meijo は名城線で定義済み（堀田）
  { id: 'cb_jingu_mae', name: '神宮前', lat: 35.1265, lng: 136.9078, lines: ['meitetsu_honsen', 'meitetsu_tokoname'], prefecture: '愛知県' },
  // cb_kanayama は名城線で定義済み
  // cb_nagoya は東山線で定義済み（名鉄名古屋）
  { id: 'cb_sako', name: '栄生', lat: 35.1780, lng: 136.8710, lines: ['meitetsu_honsen', 'meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_higashi_biwajima', name: '東枇杷島', lat: 35.1845, lng: 136.8685, lines: ['meitetsu_honsen', 'meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_shimo_otai', name: '下小田井', lat: 35.1910, lng: 136.8645, lines: ['meitetsu_honsen', 'meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_sukaguchi', name: '須ヶ口', lat: 35.2005, lng: 136.8400, lines: ['meitetsu_honsen'], prefecture: '愛知県' },
  { id: 'cb_konomiya', name: '国府宮', lat: 35.2372, lng: 136.7897, lines: ['meitetsu_honsen'], prefecture: '愛知県' },
  { id: 'cb_meitetsu_ichinomiya', name: '名鉄一宮', lat: 35.3065, lng: 136.7955, lines: ['meitetsu_honsen'], prefecture: '愛知県' },
  { id: 'cb_meitetsu_gifu', name: '名鉄岐阜', lat: 35.4090, lng: 136.7565, lines: ['meitetsu_honsen'], prefecture: '岐阜県' },

  // ========== 名鉄犬山線 ==========
  // cb_nagoya, cb_sako, cb_higashi_biwajima, cb_shimo_otai は本線で定義済み
  { id: 'cb_naka_otai', name: '中小田井', lat: 35.1950, lng: 136.8625, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  // cb_kami_otai は鶴舞線で定義済み
  { id: 'cb_nishiharu', name: '西春', lat: 35.2200, lng: 136.8630, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_tokushige_nagoya_geidai', name: '徳重・名古屋芸大', lat: 35.2350, lng: 136.8568, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_taisan_ji', name: '大山寺', lat: 35.2430, lng: 136.8550, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_iwakura', name: '岩倉', lat: 35.2790, lng: 136.8710, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_ishihotoke', name: '石仏', lat: 35.2910, lng: 136.8680, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_hotei', name: '布袋', lat: 35.3040, lng: 136.8620, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_konan', name: '江南', lat: 35.3260, lng: 136.8625, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_kashiwamori', name: '柏森', lat: 35.3410, lng: 136.8680, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_fuso', name: '扶桑', lat: 35.3560, lng: 136.8730, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_kizuyosui', name: '木津用水', lat: 35.3650, lng: 136.8760, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_inuyamaguchi', name: '犬山口', lat: 35.3740, lng: 136.9350, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_inuyama', name: '犬山', lat: 35.3790, lng: 136.9398, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_inuyama_yuen', name: '犬山遊園', lat: 35.3880, lng: 136.9430, lines: ['meitetsu_inuyama'], prefecture: '愛知県' },
  { id: 'cb_shin_unuma', name: '新鵜沼', lat: 35.3930, lng: 136.9440, lines: ['meitetsu_inuyama'], prefecture: '岐阜県' },

  // ========== 名鉄常滑線・空港線 ==========
  // cb_jingu_mae は本線で定義済み
  { id: 'cb_dobutsu_en', name: '道徳', lat: 35.1175, lng: 136.8970, lines: ['meitetsu_tokoname'], prefecture: '愛知県' },
  { id: 'cb_oto', name: '大同町', lat: 35.0920, lng: 136.8920, lines: ['meitetsu_tokoname'], prefecture: '愛知県' },
  { id: 'cb_shurakuen', name: '聚楽園', lat: 35.0735, lng: 136.8885, lines: ['meitetsu_tokoname'], prefecture: '愛知県' },
  { id: 'cb_shinkaichi', name: '新日鉄前', lat: 35.0580, lng: 136.8800, lines: ['meitetsu_tokoname'], prefecture: '愛知県' },
  { id: 'cb_ota_gawa', name: '太田川', lat: 35.0342, lng: 136.8720, lines: ['meitetsu_tokoname'], prefecture: '愛知県' },
  { id: 'cb_otagawa_kita', name: '尾張横須賀', lat: 35.0200, lng: 136.8700, lines: ['meitetsu_tokoname'], prefecture: '愛知県' },
  { id: 'cb_asakura', name: '朝倉', lat: 34.9680, lng: 136.8545, lines: ['meitetsu_tokoname'], prefecture: '愛知県' },
  { id: 'cb_tokoname', name: '常滑', lat: 34.8865, lng: 136.8365, lines: ['meitetsu_tokoname'], prefecture: '愛知県' },
  { id: 'cb_rinkukutokoname', name: 'りんくう常滑', lat: 34.8630, lng: 136.8225, lines: ['meitetsu_tokoname'], prefecture: '愛知県' },
  { id: 'cb_chubu_airport', name: '中部国際空港', lat: 34.8583, lng: 136.8122, lines: ['meitetsu_tokoname'], prefecture: '愛知県' },

  // ========== JR中央本線（名古屋地区） ==========
  // cb_nagoya, cb_kanayama は定義済み
  // cb_tsurumai は鶴舞線で定義済み
  // cb_chikusa は東山線で定義済み
  // cb_ozone は名城線で定義済み
  { id: 'cb_shin_moriyama', name: '新守山', lat: 35.2010, lng: 136.9520, lines: ['jr_chuo_nagoya'], prefecture: '愛知県' },
  { id: 'cb_kachigawa', name: '勝川', lat: 35.2167, lng: 136.9633, lines: ['jr_chuo_nagoya'], prefecture: '愛知県' },
  { id: 'cb_kasugai', name: '春日井', lat: 35.2460, lng: 136.9720, lines: ['jr_chuo_nagoya'], prefecture: '愛知県' },
  { id: 'cb_kozoji', name: '高蔵寺', lat: 35.2740, lng: 137.0375, lines: ['jr_chuo_nagoya'], prefecture: '愛知県' },
  { id: 'cb_jokoji', name: '定光寺', lat: 35.2830, lng: 137.0705, lines: ['jr_chuo_nagoya'], prefecture: '愛知県' },
  { id: 'cb_kokokei', name: '古虎渓', lat: 35.3063, lng: 137.0880, lines: ['jr_chuo_nagoya'], prefecture: '岐阜県' },
  { id: 'cb_tajimi', name: '多治見', lat: 35.3337, lng: 137.1180, lines: ['jr_chuo_nagoya'], prefecture: '岐阜県' },

  // ========== JR東海道本線（名古屋地区） ==========
  // cb_toyohashi は名鉄本線で定義済み
  { id: 'cb_gamagori', name: '蒲郡', lat: 34.8275, lng: 137.2185, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_okazaki', name: '岡崎', lat: 34.9460, lng: 137.1660, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_anjo', name: '安城', lat: 34.9585, lng: 137.0770, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_kariya', name: '刈谷', lat: 35.0010, lng: 136.9897, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_obu', name: '大府', lat: 35.0160, lng: 136.9615, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_kyowa', name: '共和', lat: 35.0340, lng: 136.9452, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_minami_odaka', name: '南大高', lat: 35.0620, lng: 136.9310, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_odaka', name: '大高', lat: 35.0760, lng: 136.9265, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_kasadera', name: '笠寺', lat: 35.0970, lng: 136.9200, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_atsuta', name: '熱田', lat: 35.1255, lng: 136.9083, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  // cb_nagoya, cb_kanayama は定義済み
  { id: 'cb_biwajima', name: '枇杷島', lat: 35.1880, lng: 136.8605, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_kiyosu', name: '清洲', lat: 35.2055, lng: 136.8440, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_inazawa', name: '稲沢', lat: 35.2475, lng: 136.7870, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_owari_ichinomiya', name: '尾張一宮', lat: 35.3030, lng: 136.7950, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_kisogawa', name: '木曽川', lat: 35.3445, lng: 136.7755, lines: ['jr_tokaido_nagoya'], prefecture: '愛知県' },
  { id: 'cb_gifu', name: '岐阜', lat: 35.4093, lng: 136.7563, lines: ['jr_tokaido_nagoya'], prefecture: '岐阜県' },
  { id: 'cb_nishi_gifu', name: '西岐阜', lat: 35.4090, lng: 136.7350, lines: ['jr_tokaido_nagoya'], prefecture: '岐阜県' },
  { id: 'cb_ogaki', name: '大垣', lat: 35.3590, lng: 136.6145, lines: ['jr_tokaido_nagoya'], prefecture: '岐阜県' },

  // ========== あおなみ線 ==========
  // cb_nagoya は定義済み
  { id: 'cb_sasashima_live', name: 'ささしまライブ', lat: 35.1643, lng: 136.8780, lines: ['aonami'], prefecture: '愛知県' },
  { id: 'cb_komoto', name: '小本', lat: 35.1570, lng: 136.8610, lines: ['aonami'], prefecture: '愛知県' },
  { id: 'cb_arako', name: '荒子', lat: 35.1510, lng: 136.8490, lines: ['aonami'], prefecture: '愛知県' },
  { id: 'cb_minami_arako', name: '南荒子', lat: 35.1440, lng: 136.8415, lines: ['aonami'], prefecture: '愛知県' },
  { id: 'cb_nakashima', name: '中島', lat: 35.1370, lng: 136.8340, lines: ['aonami'], prefecture: '愛知県' },
  { id: 'cb_nagoya_keibajo', name: '名古屋競馬場前', lat: 35.1265, lng: 136.8245, lines: ['aonami'], prefecture: '愛知県' },
  { id: 'cb_arako_gawa_koen', name: '荒子川公園', lat: 35.1155, lng: 136.8185, lines: ['aonami'], prefecture: '愛知県' },
  { id: 'cb_inei', name: '稲永', lat: 35.1040, lng: 136.8120, lines: ['aonami'], prefecture: '愛知県' },
  { id: 'cb_noato', name: '野跡', lat: 35.0940, lng: 136.8045, lines: ['aonami'], prefecture: '愛知県' },
  { id: 'cb_kinjofuto', name: '金城ふ頭', lat: 35.0450, lng: 136.7920, lines: ['aonami'], prefecture: '愛知県' },

  // ========== リニモ（愛知高速交通東部丘陵線） ==========
  // cb_fujigaoka は東山線で定義済み
  { id: 'cb_hanamizuki_dori', name: 'はなみずき通', lat: 35.1610, lng: 137.0310, lines: ['linimo'], prefecture: '愛知県' },
  { id: 'cb_irigaike_koen', name: '杁ヶ池公園', lat: 35.1640, lng: 137.0440, lines: ['linimo'], prefecture: '愛知県' },
  { id: 'cb_nagakute_kosen', name: '長久手古戦場', lat: 35.1680, lng: 137.0565, lines: ['linimo'], prefecture: '愛知県' },
  { id: 'cb_geidai_dori', name: '芸大通', lat: 35.1750, lng: 137.0680, lines: ['linimo'], prefecture: '愛知県' },
  { id: 'cb_koen_nishi', name: '公園西', lat: 35.1790, lng: 137.0815, lines: ['linimo'], prefecture: '愛知県' },
  { id: 'cb_toji_shiryokan', name: '陶磁資料館南', lat: 35.1830, lng: 137.0975, lines: ['linimo'], prefecture: '愛知県' },
  { id: 'cb_yakusa', name: '八草', lat: 35.1860, lng: 137.1115, lines: ['linimo'], prefecture: '愛知県' },
];

// ---------------------------------------------------------------------------
// 路線データ
// ---------------------------------------------------------------------------

const lines: LineData[] = [
  // ========== 名古屋市営地下鉄 ==========
  {
    id: 'nagoya_higashiyama',
    name: '東山線',
    company: '名古屋市交通局',
    color: '#FFD400',
    vehicleType: 'subway',
    stationIds: [
      'cb_takabata', 'cb_hatta', 'cb_iwatsuka', 'cb_nakamura_koen', 'cb_nakamura_nisseki',
      'cb_honjin', 'cb_kamejima', 'cb_nagoya', 'cb_fushimi', 'cb_sakae',
      'cb_shinsakae', 'cb_chikusa', 'cb_imaike', 'cb_ikeshita', 'cb_kakuozan',
      'cb_motoyama', 'cb_higashiyama_koen', 'cb_hoshigaoka', 'cb_issha', 'cb_kamiyashiro',
      'cb_hongo', 'cb_fujigaoka',
    ],
    isLoop: false,
  },
  {
    id: 'nagoya_meijo',
    name: '名城線',
    company: '名古屋市交通局',
    color: '#8B008B',
    vehicleType: 'subway',
    stationIds: [
      'cb_ozone', 'cb_nagoya_dome', 'cb_sunadabashi', 'cb_chayagasaka', 'cb_jiyugaoka',
      'cb_motoyama', 'cb_nagoya_daigaku', 'cb_yagoto_nisseki', 'cb_yagoto', 'cb_sogo_riha',
      'cb_mizuho_undojo_higashi', 'cb_shin_aratama', 'cb_myoon_dori', 'cb_hotta_meijo',
      'cb_temmacho', 'cb_jingu_nishi', 'cb_nishitakakura', 'cb_kanayama', 'cb_higashi_betsuin',
      'cb_kamimaezu', 'cb_yabacho', 'cb_sakae', 'cb_hisaya_odori', 'cb_shiyakusho',
      'cb_meijo_koen', 'cb_kurokawa', 'cb_shiga_hondori', 'cb_heian_dori', 'cb_ozone',
    ],
    isLoop: true,
  },
  {
    id: 'nagoya_meiko',
    name: '名港線',
    company: '名古屋市交通局',
    color: '#8B008B',
    vehicleType: 'subway',
    stationIds: [
      'cb_kanayama', 'cb_hibino', 'cb_rokubancho', 'cb_tokai_dori',
      'cb_minato_kuyakusho', 'cb_tsukijiguchi', 'cb_nagoya_minato',
    ],
    isLoop: false,
  },
  {
    id: 'nagoya_tsurumai',
    name: '鶴舞線',
    company: '名古屋市交通局',
    color: '#009BBF',
    vehicleType: 'subway',
    stationIds: [
      'cb_kami_otai', 'cb_shonai_ryokuchi_koen', 'cb_shonai_dori', 'cb_joshin',
      'cb_sengencho', 'cb_marunouchi', 'cb_fushimi', 'cb_osu_kannon', 'cb_kamimaezu',
      'cb_tsurumai', 'cb_arahata', 'cb_gokiso', 'cb_kawana', 'cb_irinaka',
      'cb_yagoto', 'cb_shiogamaguchi', 'cb_ueda', 'cb_hara', 'cb_hirabari', 'cb_akaike',
    ],
    isLoop: false,
  },
  {
    id: 'nagoya_sakuradori',
    name: '桜通線',
    company: '名古屋市交通局',
    color: '#E4002B',
    vehicleType: 'subway',
    stationIds: [
      'cb_nakamura_kuyakusho', 'cb_nagoya', 'cb_kokusai_center', 'cb_marunouchi',
      'cb_hisaya_odori', 'cb_takaoka', 'cb_kurumamichi', 'cb_imaike', 'cb_fukiage',
      'cb_gokiso', 'cb_sakurayama', 'cb_mizuho_kuyakusho', 'cb_mizuho_undojo_nishi',
      'cb_shin_aratama', 'cb_sakuramoto', 'cb_naruko_kita', 'cb_aioiyama',
      'cb_kamisawa', 'cb_tokushige',
    ],
    isLoop: false,
  },
  {
    id: 'nagoya_kamiiida',
    name: '上飯田線',
    company: '名古屋市交通局',
    color: '#E85298',
    vehicleType: 'subway',
    stationIds: ['cb_kamiiida', 'cb_heian_dori'],
    isLoop: false,
  },

  // ========== 名鉄 ==========
  {
    id: 'meitetsu_honsen',
    name: '名鉄名古屋本線',
    company: '名古屋鉄道',
    color: '#E4002B',
    vehicleType: 'train',
    stationIds: [
      'cb_toyohashi', 'cb_koo', 'cb_higashi_okazaki', 'cb_shin_anjo', 'cb_chiryu',
      'cb_zengo', 'cb_chukyo_keibajo', 'cb_arimatsu', 'cb_narumi', 'cb_moto_kasadera',
      'cb_hotta_meijo', 'cb_jingu_mae', 'cb_kanayama', 'cb_nagoya', 'cb_sako',
      'cb_higashi_biwajima', 'cb_shimo_otai', 'cb_sukaguchi', 'cb_konomiya',
      'cb_meitetsu_ichinomiya', 'cb_meitetsu_gifu',
    ],
    isLoop: false,
  },
  {
    id: 'meitetsu_inuyama',
    name: '名鉄犬山線',
    company: '名古屋鉄道',
    color: '#E4002B',
    vehicleType: 'train',
    stationIds: [
      'cb_nagoya', 'cb_sako', 'cb_higashi_biwajima', 'cb_shimo_otai', 'cb_naka_otai',
      'cb_kami_otai', 'cb_nishiharu', 'cb_tokushige_nagoya_geidai', 'cb_taisan_ji',
      'cb_iwakura', 'cb_ishihotoke', 'cb_hotei', 'cb_konan', 'cb_kashiwamori',
      'cb_fuso', 'cb_kizuyosui', 'cb_inuyamaguchi', 'cb_inuyama', 'cb_inuyama_yuen',
      'cb_shin_unuma',
    ],
    isLoop: false,
  },
  {
    id: 'meitetsu_tokoname',
    name: '名鉄常滑線・空港線',
    company: '名古屋鉄道',
    color: '#E4002B',
    vehicleType: 'train',
    stationIds: [
      'cb_jingu_mae', 'cb_dobutsu_en', 'cb_oto', 'cb_shurakuen', 'cb_shinkaichi',
      'cb_ota_gawa', 'cb_otagawa_kita', 'cb_asakura', 'cb_tokoname',
      'cb_rinkukutokoname', 'cb_chubu_airport',
    ],
    isLoop: false,
  },

  // ========== JR東海 ==========
  {
    id: 'jr_chuo_nagoya',
    name: 'JR中央本線（名古屋地区）',
    company: 'JR東海',
    color: '#FF8C00',
    vehicleType: 'train',
    stationIds: [
      'cb_nagoya', 'cb_kanayama', 'cb_tsurumai', 'cb_chikusa', 'cb_ozone',
      'cb_shin_moriyama', 'cb_kachigawa', 'cb_kasugai', 'cb_kozoji',
      'cb_jokoji', 'cb_kokokei', 'cb_tajimi',
    ],
    isLoop: false,
  },
  {
    id: 'jr_tokaido_nagoya',
    name: 'JR東海道本線（名古屋地区）',
    company: 'JR東海',
    color: '#FF8C00',
    vehicleType: 'train',
    stationIds: [
      'cb_toyohashi', 'cb_gamagori', 'cb_okazaki', 'cb_anjo', 'cb_kariya',
      'cb_obu', 'cb_kyowa', 'cb_minami_odaka', 'cb_odaka', 'cb_kasadera',
      'cb_atsuta', 'cb_kanayama', 'cb_nagoya', 'cb_biwajima', 'cb_kiyosu',
      'cb_inazawa', 'cb_owari_ichinomiya', 'cb_kisogawa', 'cb_gifu',
      'cb_nishi_gifu', 'cb_ogaki',
    ],
    isLoop: false,
  },

  // ========== あおなみ線 ==========
  {
    id: 'aonami',
    name: 'あおなみ線',
    company: '名古屋臨海高速鉄道',
    color: '#019FC7',
    vehicleType: 'train',
    stationIds: [
      'cb_nagoya', 'cb_sasashima_live', 'cb_komoto', 'cb_arako', 'cb_minami_arako',
      'cb_nakashima', 'cb_nagoya_keibajo', 'cb_arako_gawa_koen', 'cb_inei',
      'cb_noato', 'cb_kinjofuto',
    ],
    isLoop: false,
  },

  // ========== リニモ ==========
  {
    id: 'linimo',
    name: 'リニモ',
    company: '愛知高速交通',
    color: '#FFA500',
    vehicleType: 'monorail',
    stationIds: [
      'cb_fujigaoka', 'cb_hanamizuki_dori', 'cb_irigaike_koen', 'cb_nagakute_kosen',
      'cb_geidai_dori', 'cb_koen_nishi', 'cb_toji_shiryokan', 'cb_yakusa',
    ],
    isLoop: false,
  },
];

// ---------------------------------------------------------------------------
// エクスポート
// ---------------------------------------------------------------------------

export const chubuData: RegionData = { stations, lines };
