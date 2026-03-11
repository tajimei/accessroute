/**
 * 九州地方 鉄道データ
 *
 * 福岡市地下鉄・JR九州・西鉄・北九州モノレール・熊本市電の
 * 駅・路線情報。駅IDは ky_ プレフィクス。
 */

import { StationData, LineData, RegionData } from '../types';

// ---------------------------------------------------------------------------
// 駅データ
// ---------------------------------------------------------------------------

const stations: StationData[] = [
  // ========== 福岡市地下鉄 空港線 ==========
  { id: 'ky_meinohama', name: '姪浜', lat: 33.5883, lng: 130.3175, lines: ['ky_subway_kuko'], prefecture: '福岡県' },
  { id: 'ky_muromi', name: '室見', lat: 33.5833, lng: 130.3311, lines: ['ky_subway_kuko'], prefecture: '福岡県' },
  { id: 'ky_fujisaki', name: '藤崎', lat: 33.5819, lng: 130.3444, lines: ['ky_subway_kuko'], prefecture: '福岡県' },
  { id: 'ky_nishijin', name: '西新', lat: 33.5814, lng: 130.3558, lines: ['ky_subway_kuko'], prefecture: '福岡県' },
  { id: 'ky_tojinmachi', name: '唐人町', lat: 33.5867, lng: 130.3650, lines: ['ky_subway_kuko'], prefecture: '福岡県' },
  { id: 'ky_ohori_koen', name: '大濠公園', lat: 33.5878, lng: 130.3750, lines: ['ky_subway_kuko'], prefecture: '福岡県' },
  { id: 'ky_akasaka', name: '赤坂', lat: 33.5886, lng: 130.3842, lines: ['ky_subway_kuko'], prefecture: '福岡県' },
  { id: 'ky_tenjin', name: '天神', lat: 33.5903, lng: 130.3986, lines: ['ky_subway_kuko'], prefecture: '福岡県' },
  { id: 'ky_nakasu_kawabata', name: '中洲川端', lat: 33.5919, lng: 130.4067, lines: ['ky_subway_kuko', 'ky_subway_hakozaki'], prefecture: '福岡県' },
  { id: 'ky_gion', name: '祇園', lat: 33.5922, lng: 130.4133, lines: ['ky_subway_kuko'], prefecture: '福岡県' },
  { id: 'ky_hakata', name: '博多', lat: 33.5897, lng: 130.4207, lines: ['ky_subway_kuko', 'ky_subway_nanakuma', 'ky_jr_kagoshima', 'ky_jr_nippo'], prefecture: '福岡県' },
  { id: 'ky_higashi_hie', name: '東比恵', lat: 33.5881, lng: 130.4328, lines: ['ky_subway_kuko'], prefecture: '福岡県' },
  { id: 'ky_fukuoka_airport', name: '福岡空港', lat: 33.5906, lng: 130.4508, lines: ['ky_subway_kuko'], prefecture: '福岡県' },

  // ========== 福岡市地下鉄 箱崎線 ==========
  // 中洲川端は共有
  { id: 'ky_gofukumachi', name: '呉服町', lat: 33.5953, lng: 130.4103, lines: ['ky_subway_hakozaki'], prefecture: '福岡県' },
  { id: 'ky_chiyo_kenchoguchi', name: '千代県庁口', lat: 33.5997, lng: 130.4128, lines: ['ky_subway_hakozaki'], prefecture: '福岡県' },
  { id: 'ky_maidashi_kyudai', name: '馬出九大病院前', lat: 33.6056, lng: 130.4189, lines: ['ky_subway_hakozaki'], prefecture: '福岡県' },
  { id: 'ky_hakozaki_miyamae', name: '箱崎宮前', lat: 33.6106, lng: 130.4278, lines: ['ky_subway_hakozaki'], prefecture: '福岡県' },
  { id: 'ky_hakozaki_kyudaimae', name: '箱崎九大前', lat: 33.6142, lng: 130.4356, lines: ['ky_subway_hakozaki'], prefecture: '福岡県' },
  { id: 'ky_kaizuka', name: '貝塚', lat: 33.6186, lng: 130.4431, lines: ['ky_subway_hakozaki'], prefecture: '福岡県' },

  // ========== 福岡市地下鉄 七隈線 ==========
  { id: 'ky_hashimoto', name: '橋本', lat: 33.5525, lng: 130.3200, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_jiromaru', name: '次郎丸', lat: 33.5531, lng: 130.3308, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_kamo', name: '賀茂', lat: 33.5517, lng: 130.3408, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_noke', name: '野芥', lat: 33.5486, lng: 130.3497, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_umebayashi', name: '梅林', lat: 33.5461, lng: 130.3567, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_fukudaimae', name: '福大前', lat: 33.5447, lng: 130.3639, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_nanakuma', name: '七隈', lat: 33.5464, lng: 130.3714, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_kanayama', name: '金山', lat: 33.5494, lng: 130.3781, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_chayama', name: '茶山', lat: 33.5531, lng: 130.3831, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_beppu_fukuoka', name: '別府', lat: 33.5578, lng: 130.3869, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_ropponmatsu', name: '六本松', lat: 33.5706, lng: 130.3822, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_sakurazaka', name: '桜坂', lat: 33.5756, lng: 130.3881, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_yakuin_odori', name: '薬院大通', lat: 33.5808, lng: 130.3931, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_yakuin', name: '薬院', lat: 33.5800, lng: 130.3992, lines: ['ky_subway_nanakuma', 'ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_watanabe_dori', name: '渡辺通', lat: 33.5839, lng: 130.4017, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_tenjin_minami', name: '天神南', lat: 33.5872, lng: 130.3994, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  { id: 'ky_kushida_jinja_mae', name: '櫛田神社前', lat: 33.5886, lng: 130.4094, lines: ['ky_subway_nanakuma'], prefecture: '福岡県' },
  // 博多は共有

  // ========== JR鹿児島本線（福岡地区・主要駅） ==========
  { id: 'ky_mojiko', name: '門司港', lat: 33.9461, lng: 130.9617, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_kokura', name: '小倉', lat: 33.8862, lng: 130.8828, lines: ['ky_jr_kagoshima', 'ky_jr_nippo', 'ky_monorail'], prefecture: '福岡県' },
  { id: 'ky_yahata', name: '八幡', lat: 33.8628, lng: 130.7583, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_kurosaki', name: '黒崎', lat: 33.8706, lng: 130.7586, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_orio', name: '折尾', lat: 33.8600, lng: 130.7219, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_akama', name: '赤間', lat: 33.8267, lng: 130.6000, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_togo', name: '東郷', lat: 33.8025, lng: 130.5672, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_fukuma', name: '福間', lat: 33.7689, lng: 130.5164, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_koga', name: '古賀', lat: 33.7294, lng: 130.4678, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_chihaya', name: '千早', lat: 33.6567, lng: 130.4419, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_hakozaki_jr', name: '箱崎', lat: 33.6233, lng: 130.4322, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_yoshizuka', name: '吉塚', lat: 33.6064, lng: 130.4231, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  // 博多は共有
  { id: 'ky_takeshita', name: '竹下', lat: 33.5722, lng: 130.4242, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_sasabaru', name: '笹原', lat: 33.5583, lng: 130.4319, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_minami_fukuoka', name: '南福岡', lat: 33.5483, lng: 130.4386, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_kasuga', name: '春日', lat: 33.5350, lng: 130.4403, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_onojo', name: '大野城', lat: 33.5261, lng: 130.4481, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_futsukaichi', name: '二日市', lat: 33.5097, lng: 130.5117, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },
  { id: 'ky_tosu', name: '鳥栖', lat: 33.3786, lng: 130.5183, lines: ['ky_jr_kagoshima'], prefecture: '佐賀県' },
  { id: 'ky_kurume_jr', name: '久留米', lat: 33.3161, lng: 130.5086, lines: ['ky_jr_kagoshima'], prefecture: '福岡県' },

  // ========== JR日豊本線（主要駅） ==========
  // 小倉は共有
  { id: 'ky_minami_kokura', name: '南小倉', lat: 33.8756, lng: 130.8747, lines: ['ky_jr_nippo'], prefecture: '福岡県' },
  { id: 'ky_jono', name: '城野', lat: 33.8808, lng: 130.8589, lines: ['ky_jr_nippo', 'ky_monorail'], prefecture: '福岡県' },
  { id: 'ky_abeyama_koen', name: '安部山公園', lat: 33.8711, lng: 130.8389, lines: ['ky_jr_nippo'], prefecture: '福岡県' },
  { id: 'ky_shimozone', name: '下曽根', lat: 33.8622, lng: 130.9253, lines: ['ky_jr_nippo'], prefecture: '福岡県' },
  { id: 'ky_kushami', name: '朽網', lat: 33.8394, lng: 130.9539, lines: ['ky_jr_nippo'], prefecture: '福岡県' },
  { id: 'ky_kanda', name: '苅田', lat: 33.7856, lng: 130.9806, lines: ['ky_jr_nippo'], prefecture: '福岡県' },
  { id: 'ky_yukuhashi', name: '行橋', lat: 33.7286, lng: 130.9828, lines: ['ky_jr_nippo'], prefecture: '福岡県' },
  { id: 'ky_nakatsu', name: '中津', lat: 33.5972, lng: 131.1878, lines: ['ky_jr_nippo'], prefecture: '大分県' },
  { id: 'ky_beppu', name: '別府', lat: 33.2822, lng: 131.5028, lines: ['ky_jr_nippo'], prefecture: '大分県' },
  { id: 'ky_oita', name: '大分', lat: 33.2328, lng: 131.6064, lines: ['ky_jr_nippo'], prefecture: '大分県' },

  // ========== 西鉄天神大牟田線（主要駅） ==========
  { id: 'ky_nishitetsu_fukuoka', name: '西鉄福岡(天神)', lat: 33.5906, lng: 130.3981, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  // 薬院は共有
  { id: 'ky_nishitetsu_hirao', name: '西鉄平尾', lat: 33.5722, lng: 130.4006, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_takamiya', name: '高宮', lat: 33.5633, lng: 130.4033, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_ohashi', name: '大橋', lat: 33.5542, lng: 130.4125, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_ijiri', name: '井尻', lat: 33.5433, lng: 130.4231, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_zasshonokuma', name: '雑餉隈', lat: 33.5347, lng: 130.4350, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_kasugabaru', name: '春日原', lat: 33.5258, lng: 130.4431, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_shirokibaru', name: '白木原', lat: 33.5186, lng: 130.4489, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_shimoori', name: '下大利', lat: 33.5111, lng: 130.4531, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_tofurokumae', name: '都府楼前', lat: 33.5072, lng: 130.4925, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_nishitetsu_futsukaichi', name: '西鉄二日市', lat: 33.5019, lng: 130.5128, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_asakura_kaido', name: '朝倉街道', lat: 33.4908, lng: 130.5236, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_chikushi', name: '筑紫', lat: 33.4789, lng: 130.5242, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_tsuko', name: '津古', lat: 33.4586, lng: 130.5214, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_mikuni_ga_oka', name: '三国が丘', lat: 33.4472, lng: 130.5200, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_misawa', name: '三沢', lat: 33.4367, lng: 130.5189, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_ogori', name: '小郡', lat: 33.4186, lng: 130.5553, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_miyanojin', name: '宮の陣', lat: 33.3603, lng: 130.5264, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_kushihara', name: '櫛原', lat: 33.3378, lng: 130.5186, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_nishitetsu_kurume', name: '西鉄久留米', lat: 33.3197, lng: 130.5153, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_hanabatake', name: '花畑', lat: 33.3097, lng: 130.5125, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_shikenjomae', name: '試験場前', lat: 33.2992, lng: 130.5081, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_tsufuku', name: '津福', lat: 33.2875, lng: 130.5039, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_yasutake', name: '安武', lat: 33.2742, lng: 130.4975, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_daizenji', name: '大善寺', lat: 33.2600, lng: 130.4889, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_mizuma', name: '三潴', lat: 33.2456, lng: 130.4781, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_inuzuka', name: '犬塚', lat: 33.2322, lng: 130.4689, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_omizo', name: '大溝', lat: 33.2181, lng: 130.4583, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_haccho_muta', name: '八丁牟田', lat: 33.2036, lng: 130.4481, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_kamachi', name: '蒲池', lat: 33.1889, lng: 130.4383, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_yakabe', name: '矢加部', lat: 33.1736, lng: 130.4281, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_nishitetsu_yanagawa', name: '西鉄柳川', lat: 33.1589, lng: 130.4178, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_shiozuka', name: '塩塚', lat: 33.1481, lng: 130.4081, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_nishitetsu_nakashima', name: '西鉄中島', lat: 33.1375, lng: 130.4006, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_enoura', name: '江の浦', lat: 33.1247, lng: 130.4403, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_hiraki', name: '開', lat: 33.1122, lng: 130.4472, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_nishitetsu_ginsui', name: '西鉄銀水', lat: 33.0989, lng: 130.4506, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_higashi_amagi', name: '東甘木', lat: 33.0853, lng: 130.4519, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_nishitetsu_watase', name: '西鉄渡瀬', lat: 33.0728, lng: 130.4525, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_kuranaga', name: '倉永', lat: 33.0603, lng: 130.4522, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_higashi_omuta', name: '東大牟田', lat: 33.0481, lng: 130.4533, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },
  { id: 'ky_nishitetsu_omuta_sta', name: '西鉄大牟田', lat: 33.0314, lng: 130.4475, lines: ['ky_nishitetsu_omuta'], prefecture: '福岡県' },

  // ========== 北九州モノレール ==========
  // 小倉は共有
  { id: 'ky_heiwadori', name: '平和通', lat: 33.8822, lng: 130.8783, lines: ['ky_monorail'], prefecture: '福岡県' },
  { id: 'ky_tanga', name: '旦過', lat: 33.8769, lng: 130.8750, lines: ['ky_monorail'], prefecture: '福岡県' },
  { id: 'ky_kawaraguchi_mihagino', name: '香春口三萩野', lat: 33.8728, lng: 130.8694, lines: ['ky_monorail'], prefecture: '福岡県' },
  // 城野は共有（JR日豊本線と）
  { id: 'ky_kitagata', name: '北方', lat: 33.8817, lng: 130.8444, lines: ['ky_monorail'], prefecture: '福岡県' },
  { id: 'ky_keibajomae', name: '競馬場前', lat: 33.8828, lng: 130.8328, lines: ['ky_monorail'], prefecture: '福岡県' },
  { id: 'ky_moritsune', name: '守恒', lat: 33.8756, lng: 130.8189, lines: ['ky_monorail'], prefecture: '福岡県' },
  { id: 'ky_tokuriki_kodanmae', name: '徳力公団前', lat: 33.8683, lng: 130.8100, lines: ['ky_monorail'], prefecture: '福岡県' },
  { id: 'ky_tokuriki_arashiyamaguchi', name: '徳力嵐山口', lat: 33.8625, lng: 130.8019, lines: ['ky_monorail'], prefecture: '福岡県' },
  { id: 'ky_shii', name: '志井', lat: 33.8558, lng: 130.7953, lines: ['ky_monorail'], prefecture: '福岡県' },
  { id: 'ky_kikugaoka', name: '企救丘', lat: 33.8497, lng: 130.7886, lines: ['ky_monorail'], prefecture: '福岡県' },

  // ========== 熊本市電 A系統 ==========
  { id: 'ky_tasakibashi', name: '田崎橋', lat: 32.7944, lng: 130.6772, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_nihongi_guchi', name: '二本木口', lat: 32.7942, lng: 130.6819, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_kumamoto_ekimae', name: '熊本駅前', lat: 32.7907, lng: 130.6867, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_gionbashi', name: '祇園橋', lat: 32.7936, lng: 130.6942, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_gofukumachi_kumamoto', name: '呉服町', lat: 32.7958, lng: 130.6989, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_kawaramachi', name: '河原町', lat: 32.7981, lng: 130.7036, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_keitoku_komae', name: '慶徳校前', lat: 32.8000, lng: 130.7047, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_karashima_cho', name: '辛島町', lat: 32.8011, lng: 130.7072, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_hanabata_cho', name: '花畑町', lat: 32.8028, lng: 130.7078, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_kumamotojo_shiyakushomae', name: '熊本城・市役所前', lat: 32.8050, lng: 130.7072, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_torichosuji', name: '通町筋', lat: 32.8058, lng: 130.7103, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_suidocho', name: '水道町', lat: 32.8058, lng: 130.7144, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_kuhonji_kosaten', name: '九品寺交差点', lat: 32.8036, lng: 130.7183, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_kotsukyokumae', name: '交通局前', lat: 32.8008, lng: 130.7217, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_miso_tenjinmae', name: '味噌天神前', lat: 32.7994, lng: 130.7256, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_shin_suizenji_ekimae', name: '新水前寺駅前', lat: 32.7978, lng: 130.7300, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_kokufu', name: '国府', lat: 32.7961, lng: 130.7367, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_suizenji_koen', name: '水前寺公園', lat: 32.7939, lng: 130.7414, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_shiritsu_taiikukan_mae', name: '市立体育館前', lat: 32.7917, lng: 130.7472, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_shogyo_koko_mae', name: '商業高校前', lat: 32.7903, lng: 130.7525, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_hacchobaba', name: '八丁馬場', lat: 32.7889, lng: 130.7578, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_shinsui_kosaten', name: '神水交差点', lat: 32.7881, lng: 130.7619, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_kengun_komae', name: '健軍校前', lat: 32.7875, lng: 130.7669, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_dobutsu_shokubutsuen', name: '動植物園入口', lat: 32.7867, lng: 130.7728, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
  { id: 'ky_kengunmachi', name: '健軍町', lat: 32.7861, lng: 130.7786, lines: ['ky_kumamoto_tram'], prefecture: '熊本県' },
];

// ---------------------------------------------------------------------------
// 路線データ
// ---------------------------------------------------------------------------

const lines: LineData[] = [
  // 福岡市地下鉄 空港線
  {
    id: 'ky_subway_kuko',
    name: '福岡市地下鉄空港線',
    company: '福岡市交通局',
    color: '#F37321',
    vehicleType: 'subway',
    stationIds: [
      'ky_meinohama', 'ky_muromi', 'ky_fujisaki', 'ky_nishijin', 'ky_tojinmachi',
      'ky_ohori_koen', 'ky_akasaka', 'ky_tenjin', 'ky_nakasu_kawabata',
      'ky_gion', 'ky_hakata', 'ky_higashi_hie', 'ky_fukuoka_airport',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },

  // 福岡市地下鉄 箱崎線
  {
    id: 'ky_subway_hakozaki',
    name: '福岡市地下鉄箱崎線',
    company: '福岡市交通局',
    color: '#00A0DE',
    vehicleType: 'subway',
    stationIds: [
      'ky_nakasu_kawabata', 'ky_gofukumachi', 'ky_chiyo_kenchoguchi',
      'ky_maidashi_kyudai', 'ky_hakozaki_miyamae', 'ky_hakozaki_kyudaimae',
      'ky_kaizuka',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },

  // 福岡市地下鉄 七隈線
  {
    id: 'ky_subway_nanakuma',
    name: '福岡市地下鉄七隈線',
    company: '福岡市交通局',
    color: '#00813E',
    vehicleType: 'subway',
    stationIds: [
      'ky_hashimoto', 'ky_jiromaru', 'ky_kamo', 'ky_noke', 'ky_umebayashi',
      'ky_fukudaimae', 'ky_nanakuma', 'ky_kanayama', 'ky_chayama',
      'ky_beppu_fukuoka', 'ky_ropponmatsu', 'ky_sakurazaka', 'ky_yakuin_odori',
      'ky_yakuin', 'ky_watanabe_dori', 'ky_tenjin_minami',
      'ky_kushida_jinja_mae', 'ky_hakata',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },

  // JR鹿児島本線（福岡地区）
  {
    id: 'ky_jr_kagoshima',
    name: 'JR鹿児島本線',
    company: 'JR九州',
    color: '#FF0000',
    vehicleType: 'train',
    stationIds: [
      'ky_mojiko', 'ky_kokura', 'ky_yahata', 'ky_kurosaki', 'ky_orio',
      'ky_akama', 'ky_togo', 'ky_fukuma', 'ky_koga', 'ky_chihaya',
      'ky_hakozaki_jr', 'ky_yoshizuka', 'ky_hakata', 'ky_takeshita',
      'ky_sasabaru', 'ky_minami_fukuoka', 'ky_kasuga', 'ky_onojo',
      'ky_futsukaichi', 'ky_tosu', 'ky_kurume_jr',
    ],
    isLoop: false,
    avgIntervalMinutes: 4,
  },

  // JR日豊本線（主要駅）
  {
    id: 'ky_jr_nippo',
    name: 'JR日豊本線',
    company: 'JR九州',
    color: '#FF0000',
    vehicleType: 'train',
    stationIds: [
      'ky_kokura', 'ky_minami_kokura', 'ky_jono', 'ky_abeyama_koen',
      'ky_shimozone', 'ky_kushami', 'ky_kanda', 'ky_yukuhashi',
      'ky_nakatsu', 'ky_beppu', 'ky_oita',
    ],
    isLoop: false,
    avgIntervalMinutes: 8,
  },

  // 西鉄天神大牟田線
  {
    id: 'ky_nishitetsu_omuta',
    name: '西鉄天神大牟田線',
    company: '西日本鉄道',
    color: '#E4002B',
    vehicleType: 'train',
    stationIds: [
      'ky_nishitetsu_fukuoka', 'ky_yakuin', 'ky_nishitetsu_hirao', 'ky_takamiya',
      'ky_ohashi', 'ky_ijiri', 'ky_zasshonokuma', 'ky_kasugabaru',
      'ky_shirokibaru', 'ky_shimoori', 'ky_tofurokumae',
      'ky_nishitetsu_futsukaichi', 'ky_asakura_kaido', 'ky_chikushi',
      'ky_tsuko', 'ky_mikuni_ga_oka', 'ky_misawa', 'ky_ogori',
      'ky_miyanojin', 'ky_kushihara', 'ky_nishitetsu_kurume', 'ky_hanabatake',
      'ky_shikenjomae', 'ky_tsufuku', 'ky_yasutake', 'ky_daizenji',
      'ky_mizuma', 'ky_inuzuka', 'ky_omizo', 'ky_haccho_muta',
      'ky_kamachi', 'ky_yakabe', 'ky_nishitetsu_yanagawa', 'ky_shiozuka',
      'ky_nishitetsu_nakashima', 'ky_enoura', 'ky_hiraki',
      'ky_nishitetsu_ginsui', 'ky_higashi_amagi', 'ky_nishitetsu_watase',
      'ky_kuranaga', 'ky_higashi_omuta', 'ky_nishitetsu_omuta_sta',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },

  // 北九州モノレール
  {
    id: 'ky_monorail',
    name: '北九州モノレール',
    company: '北九州高速鉄道',
    color: '#FF6600',
    vehicleType: 'monorail',
    stationIds: [
      'ky_kokura', 'ky_heiwadori', 'ky_tanga', 'ky_kawaraguchi_mihagino',
      'ky_jono', 'ky_kitagata', 'ky_keibajomae', 'ky_moritsune',
      'ky_tokuriki_kodanmae', 'ky_tokuriki_arashiyamaguchi', 'ky_shii',
      'ky_kikugaoka',
    ],
    isLoop: false,
    avgIntervalMinutes: 5,
  },

  // 熊本市電 A系統
  {
    id: 'ky_kumamoto_tram',
    name: '熊本市電A系統',
    company: '熊本市交通局',
    color: '#228B22',
    vehicleType: 'tram',
    stationIds: [
      'ky_tasakibashi', 'ky_nihongi_guchi', 'ky_kumamoto_ekimae',
      'ky_gionbashi', 'ky_gofukumachi_kumamoto', 'ky_kawaramachi',
      'ky_keitoku_komae', 'ky_karashima_cho', 'ky_hanabata_cho',
      'ky_kumamotojo_shiyakushomae', 'ky_torichosuji', 'ky_suidocho',
      'ky_kuhonji_kosaten', 'ky_kotsukyokumae', 'ky_miso_tenjinmae',
      'ky_shin_suizenji_ekimae', 'ky_kokufu', 'ky_suizenji_koen',
      'ky_shiritsu_taiikukan_mae', 'ky_shogyo_koko_mae', 'ky_hacchobaba',
      'ky_shinsui_kosaten', 'ky_kengun_komae', 'ky_dobutsu_shokubutsuen',
      'ky_kengunmachi',
    ],
    isLoop: false,
    avgIntervalMinutes: 6,
  },
];

// ---------------------------------------------------------------------------
// エクスポート
// ---------------------------------------------------------------------------

export const kyushuData: RegionData = { stations, lines };
