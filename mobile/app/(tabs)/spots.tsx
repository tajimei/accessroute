import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SpotSummary, SpotDetail } from '../../src/types';
import { getNearbySpots, getSpotDetail } from '../../src/services/api';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Default coordinates: Tokyo Station
const DEFAULT_LAT = '35.6812';
const DEFAULT_LNG = '139.7671';

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

// モックデータ（API未接続時のフォールバック）
function mockSpots(): SpotSummary[] {
  return [
    {
      spotId: 'spot_search_1',
      name: 'バリアフリートイレ 丸の内',
      category: 'restroom',
      location: { lat: 35.6815, lng: 139.7675 },
      distanceMeters: 50,
      accessibilityScore: 95,
      wheelchairAccessible: true,
    },
    {
      spotId: 'spot_search_2',
      name: '休憩ベンチ 日比谷通り',
      category: 'rest_area',
      location: { lat: 35.6808, lng: 139.7665 },
      distanceMeters: 120,
      accessibilityScore: 80,
      wheelchairAccessible: true,
    },
    {
      spotId: 'spot_search_3',
      name: 'カフェ アクセス',
      category: 'cafe',
      location: { lat: 35.682, lng: 139.768 },
      distanceMeters: 200,
      accessibilityScore: 72,
      wheelchairAccessible: false,
    },
    {
      spotId: 'spot_search_4',
      name: 'エレベーター 地下鉄出口',
      category: 'elevator',
      location: { lat: 35.6805, lng: 139.7668 },
      distanceMeters: 80,
      accessibilityScore: 88,
      wheelchairAccessible: true,
    },
    {
      spotId: 'spot_search_5',
      name: '丸ビル',
      category: 'shopping',
      location: { lat: 35.6819, lng: 139.7643 },
      distanceMeters: 300,
      accessibilityScore: 90,
      wheelchairAccessible: true,
    },
  ];
}

// モック詳細データ（API未接続時のフォールバック）
function mockSpotDetail(spot: SpotSummary): SpotDetail {
  const details: Record<string, Partial<SpotDetail>> = {
    spot_search_1: {
      address: '東京都千代田区丸の内1-9-1 地下1階',
      phoneNumber: undefined,
      openingHours: ['5:30〜24:30（年中無休）'],
      hasElevator: true,
      hasAccessibleRestroom: true,
      hasAutomaticDoor: true,
      description:
        '車椅子対応の多目的トイレ。オストメイト対応設備あり。ベビーベッド設置。',
    },
    spot_search_2: {
      address: '東京都千代田区日比谷通り沿い',
      openingHours: ['24時間利用可能'],
      hasElevator: false,
      hasAccessibleRestroom: false,
      hasAutomaticDoor: false,
      description: '屋根付きの休憩スペース。ベンチ3台設置。',
    },
    spot_search_3: {
      address: '東京都千代田区丸の内2-4-1 1階',
      phoneNumber: '03-1234-5678',
      openingHours: ['月〜金: 7:00〜21:00', '土日祝: 8:00〜20:00'],
      hasElevator: false,
      hasAccessibleRestroom: false,
      hasAutomaticDoor: true,
      description: 'バリアフリー対応カフェ。テーブル間隔が広く車椅子でも利用しやすい。',
    },
    spot_search_4: {
      address: '東京都千代田区丸の内1丁目 地下鉄丸ノ内線出口',
      openingHours: ['5:00〜25:00'],
      hasElevator: true,
      hasAccessibleRestroom: false,
      hasAutomaticDoor: true,
      description: '地上と地下鉄コンコースを結ぶエレベーター。車椅子・ベビーカー対応。',
    },
    spot_search_5: {
      address: '東京都千代田区丸の内2-4-1',
      phoneNumber: '03-5218-5100',
      openingHours: ['ショップ: 11:00〜21:00', 'レストラン: 11:00〜23:00'],
      hasElevator: true,
      hasAccessibleRestroom: true,
      hasAutomaticDoor: true,
      description:
        '地上37階建ての複合商業施設。全フロアにエレベーターでアクセス可能。多目的トイレ各階に設置。',
    },
  };

  const extra = details[spot.spotId] ?? {
    address: '住所情報なし',
    hasElevator: false,
    hasAccessibleRestroom: false,
    hasAutomaticDoor: false,
  };

  return {
    ...spot,
    address: extra.address ?? '住所情報なし',
    phoneNumber: extra.phoneNumber,
    openingHours: extra.openingHours,
    hasElevator: extra.hasElevator ?? false,
    hasAccessibleRestroom: extra.hasAccessibleRestroom ?? false,
    hasAutomaticDoor: extra.hasAutomaticDoor ?? false,
    description: extra.description,
  };
}

// スポットカテゴリのラベル
function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    restroom: 'トイレ',
    rest_area: '休憩所',
    cafe: 'カフェ',
    elevator: 'エレベーター',
    parking: '駐車場',
    station: '駅',
    shopping: 'ショッピング',
  };
  return labels[category] ?? category;
}

export default function SpotsScreen() {
  const [latText, setLatText] = useState(DEFAULT_LAT);
  const [lngText, setLngText] = useState(DEFAULT_LNG);
  const [spots, setSpots] = useState<SpotSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedSpotId, setExpandedSpotId] = useState<string | null>(null);
  const [spotDetails, setSpotDetails] = useState<Record<string, SpotDetail>>(
    {},
  );
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [coordError, setCoordError] = useState<string | null>(null);

  const searchSpots = useCallback(async () => {
    const lat = parseFloat(latText);
    const lng = parseFloat(lngText);
    if (isNaN(lat) || isNaN(lng)) {
      setCoordError('緯度・経度に有効な数値を入力してください');
      return;
    }
    setCoordError(null);

    setIsSearching(true);
    setHasSearched(true);
    setExpandedSpotId(null);

    let results: SpotSummary[];
    try {
      results = await getNearbySpots(lat, lng);
    } catch {
      // API未接続時はモックデータを使用
      results = mockSpots();
    }

    setSpots(results);
    setIsSearching(false);
  }, [latText, lngText]);

  const toggleDetail = useCallback(
    async (spotId: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      if (expandedSpotId === spotId) {
        setExpandedSpotId(null);
        return;
      }

      setExpandedSpotId(spotId);

      // Load detail if not cached
      if (!spotDetails[spotId]) {
        setLoadingDetailId(spotId);
        let detail: SpotDetail;
        try {
          detail = await getSpotDetail(spotId);
        } catch {
          // API未接続時はモック詳細データを使用
          const spot = spots.find((s) => s.spotId === spotId);
          if (spot) {
            detail = mockSpotDetail(spot);
          } else {
            setLoadingDetailId(null);
            return;
          }
        }
        setSpotDetails((prev) => ({ ...prev, [spotId]: detail }));
        setLoadingDetailId(null);
      }
    },
    [expandedSpotId, spotDetails, spots],
  );

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50';
    if (score >= 50) return '#FF9800';
    return '#F44336';
  };

  const renderSpotCard = useCallback(
    ({ item }: { item: SpotSummary }) => {
      const isExpanded = expandedSpotId === item.spotId;
      const detail = spotDetails[item.spotId];
      const isLoadingDetail = loadingDetailId === item.spotId;
      const scoreColor = getScoreColor(item.accessibilityScore);

      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => toggleDetail(item.spotId)}
          activeOpacity={0.7}
          hitSlop={HIT_SLOP}
          accessibilityLabel={`${item.name}、${categoryLabel(item.category)}、スコア${item.accessibilityScore}点`}
          accessibilityRole="button"
          accessibilityHint="タップして詳細を表示"
        >
          {/* Card header */}
          <View style={styles.cardHeader}>
            <View style={[styles.scoreCircle, { backgroundColor: scoreColor }]}>
              <Text style={styles.scoreText}>{item.accessibilityScore}</Text>
            </View>

            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.spotName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.wheelchairAccessible && (
                  <Text style={styles.wheelchairIcon} accessibilityLabel="車椅子対応">
                    {'♿'}
                  </Text>
                )}
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.categoryTag}>{categoryLabel(item.category)}</Text>
                <Text style={styles.distanceText}>
                  {item.distanceMeters < 1000
                    ? `${Math.round(item.distanceMeters)}m`
                    : `${(item.distanceMeters / 1000).toFixed(1)}km`}
                </Text>
              </View>
            </View>

            <Text style={styles.expandIcon}>{isExpanded ? '-' : '+'}</Text>
          </View>

          {/* Expanded detail */}
          {isExpanded && (
            <View style={styles.detailSection}>
              {isLoadingDetail ? (
                <ActivityIndicator
                  size="small"
                  color="#007AFF"
                  style={styles.detailLoader}
                />
              ) : detail ? (
                <SpotDetailContent detail={detail} />
              ) : null}
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [expandedSpotId, spotDetails, loadingDetailId, toggleDetail],
  );

  return (
    <View style={styles.container}>
      {/* Search form */}
      <View style={styles.searchForm}>
        <Text style={styles.searchLabel}>座標で検索</Text>
        <View style={styles.coordRow}>
          <View style={styles.coordInput}>
            <Text style={styles.coordLabel}>緯度</Text>
            <TextInput
              style={styles.textInput}
              value={latText}
              onChangeText={setLatText}
              keyboardType="numeric"
              placeholder="35.6812"
              placeholderTextColor="#999"
              accessibilityLabel="緯度"
            />
          </View>
          <View style={styles.coordInput}>
            <Text style={styles.coordLabel}>経度</Text>
            <TextInput
              style={styles.textInput}
              value={lngText}
              onChangeText={setLngText}
              keyboardType="numeric"
              placeholder="139.7671"
              placeholderTextColor="#999"
              accessibilityLabel="経度"
            />
          </View>
        </View>
        <TouchableOpacity
          style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
          onPress={searchSpots}
          disabled={isSearching}
          hitSlop={HIT_SLOP}
          activeOpacity={0.6}
          accessibilityLabel="スポットを検索"
          accessibilityRole="button"
        >
          {isSearching ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>周辺スポットを検索</Text>
          )}
        </TouchableOpacity>
        {coordError && (
          <Text style={styles.coordErrorText}>{coordError}</Text>
        )}
      </View>

      {/* Results */}
      {isSearching ? (
        <View style={styles.centerMessage}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.centerMessageText}>スポットを検索中...</Text>
        </View>
      ) : hasSearched && spots.length === 0 ? (
        <View style={styles.centerMessage}>
          <Text style={styles.emptyIcon}>{'📍'}</Text>
          <Text style={styles.centerMessageText}>
            周辺にスポットが見つかりませんでした
          </Text>
        </View>
      ) : (
        <FlatList
          data={spots}
          keyExtractor={(item) => item.spotId}
          renderItem={renderSpotCard}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            spots.length > 0 ? (
              <Text style={styles.resultCount}>
                {spots.length}件のスポットが見つかりました
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

// Spot detail expanded content
function SpotDetailContent({ detail }: { detail: SpotDetail }) {
  return (
    <View style={styles.detailContent}>
      {/* Address */}
      <View style={styles.detailRow}>
        <Text style={styles.detailIcon}>{'📍'}</Text>
        <View style={styles.detailRowContent}>
          <Text style={styles.detailLabel}>住所</Text>
          <Text style={styles.detailValue}>{detail.address}</Text>
        </View>
      </View>

      {/* Phone */}
      {detail.phoneNumber && (
        <TouchableOpacity
          style={styles.detailRow}
          onPress={() => Linking.openURL(`tel:${detail.phoneNumber}`)}
          hitSlop={HIT_SLOP}
          activeOpacity={0.6}
          accessibilityLabel={`電話: ${detail.phoneNumber}`}
          accessibilityRole="link"
        >
          <Text style={styles.detailIcon}>{'📞'}</Text>
          <View style={styles.detailRowContent}>
            <Text style={styles.detailLabel}>電話番号</Text>
            <Text style={[styles.detailValue, styles.linkText]}>
              {detail.phoneNumber}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Opening hours */}
      {detail.openingHours && detail.openingHours.length > 0 && (
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>{'🕐'}</Text>
          <View style={styles.detailRowContent}>
            <Text style={styles.detailLabel}>営業時間</Text>
            {detail.openingHours.map((hours, index) => (
              <Text key={index} style={styles.detailValue}>
                {hours}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Description */}
      {detail.description && (
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>{'📝'}</Text>
          <View style={styles.detailRowContent}>
            <Text style={styles.detailLabel}>説明</Text>
            <Text style={styles.detailValue}>{detail.description}</Text>
          </View>
        </View>
      )}

      {/* Facilities */}
      <View style={styles.facilitiesSection}>
        <Text style={styles.facilitiesTitle}>バリアフリー設備</Text>
        <View style={styles.facilitiesGrid}>
          <FacilityBadge
            label="エレベーター"
            available={detail.hasElevator}
          />
          <FacilityBadge
            label="多目的トイレ"
            available={detail.hasAccessibleRestroom}
          />
          <FacilityBadge
            label="自動ドア"
            available={detail.hasAutomaticDoor}
          />
          <FacilityBadge
            label="車椅子対応"
            available={detail.wheelchairAccessible}
          />
        </View>
      </View>
    </View>
  );
}

function FacilityBadge({
  label,
  available,
}: {
  label: string;
  available: boolean;
}) {
  return (
    <View
      style={[
        styles.facilityBadge,
        available ? styles.facilityAvailable : styles.facilityUnavailable,
      ]}
      accessibilityLabel={`${label}: ${available ? '対応' : '非対応'}`}
    >
      <Text
        style={[
          styles.facilityCheck,
          { color: available ? '#4CAF50' : '#999' },
        ]}
      >
        {available ? '○' : '×'}
      </Text>
      <Text
        style={[
          styles.facilityLabel,
          { color: available ? '#1c1c1e' : '#999' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchForm: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  coordRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  coordInput: {
    flex: 1,
  },
  coordLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1c1c1e',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#99c9ff',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  coordErrorText: {
    color: '#F44336',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  centerMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  centerMessageText: {
    fontSize: 15,
    color: '#666',
  },
  emptyIcon: {
    fontSize: 48,
  },
  listContent: {
    padding: 12,
  },
  resultCount: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    minHeight: 44,
  },
  scoreCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spotName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    flexShrink: 1,
  },
  wheelchairIcon: {
    fontSize: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  categoryTag: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  distanceText: {
    fontSize: 12,
    color: '#888',
  },
  expandIcon: {
    fontSize: 22,
    color: '#999',
    fontWeight: '300',
    marginLeft: 8,
    width: 24,
    textAlign: 'center',
  },
  detailSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  detailLoader: {
    paddingVertical: 20,
  },
  detailContent: {
    padding: 14,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    minHeight: 44,
  },
  detailIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  detailRowContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  linkText: {
    color: '#007AFF',
  },
  facilitiesSection: {
    marginTop: 4,
  },
  facilitiesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    minHeight: 36,
  },
  facilityAvailable: {
    backgroundColor: '#E8F5E9',
  },
  facilityUnavailable: {
    backgroundColor: '#f5f5f5',
  },
  facilityCheck: {
    fontSize: 14,
    fontWeight: '600',
  },
  facilityLabel: {
    fontSize: 12,
  },
});
