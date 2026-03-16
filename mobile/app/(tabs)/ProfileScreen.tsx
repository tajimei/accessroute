import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, 
  Dimensions, Platform, Animated
} from 'react-native';
import { MOBILITY_OPTIONS, AVOID_OPTIONS, PREFER_OPTIONS } from './constants/profile';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function ProfileScreen() {
  const [mobility, setMobility] = useState('walk');
  const [avoids, setAvoids] = useState<string[]>([]);
  const [prefers, setPrefers] = useState<string[]>([]);
  const [distance, setDistance] = useState(1000);

  // トグルロジック
  const toggleSelect = (id: string, list: string[], setList: (l: string[]) => void) => {
    setList(list.includes(id) ? list.filter(i => i !== id) : [...list, id]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        {/* 1. 完了度：太いグラデーション風バー */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>プロファイル完了度</Text>
            <Text style={styles.percentageText}>65%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '65%' }]} />
          </View>
        </View>

        {/* 2. 移動手段：モダンなリスト選択 */}
        <Text style={styles.groupTitle}>移動手段</Text>
        <View style={styles.card}>
          {Object.entries(MOBILITY_OPTIONS).map(([key, opt]) => (
            <Pressable 
              key={key} 
              onPress={() => setMobility(key)}
              style={[styles.listRow, mobility === key && styles.selectedRow]}
            >
              <View style={[styles.iconBox, { backgroundColor: opt.color + '20' }]}>
                <Text style={styles.rowIcon}>{opt.icon}</Text>
              </View>
              <View style={styles.rowTextInfo}>
                <Text style={styles.rowLabel}>{opt.label}</Text>
                <Text style={styles.rowDesc}>{opt.desc}</Text>
              </View>
              <View style={[styles.radioOuter, mobility === key && styles.radioActive]}>
                {mobility === key && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          ))}
        </View>

        {/* 3. 回避・希望条件：タイル型グリッドレイアウト */}
        <Text style={styles.groupTitle}>回避・希望条件</Text>
        <View style={styles.grid}>
          {Object.entries({...AVOID_OPTIONS, ...PREFER_OPTIONS}).map(([key, opt]) => {
            const isSelected = avoids.includes(key) || prefers.includes(key);
            const isAvoid = key in AVOID_OPTIONS;
            return (
              <Pressable 
                key={key} 
                onPress={() => isAvoid ? toggleSelect(key, avoids, setAvoids) : toggleSelect(key, prefers, setPrefers)}
                style={[styles.tile, isSelected && styles.tileSelected]}
              >
                <Text style={styles.tileIcon}>{opt.icon}</Text>
                <Text style={[styles.tileLabel, isSelected && styles.tileLabelSelected]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* 4. 距離設定：強調されたスライダー */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>最大移動距離</Text>
          <View style={styles.distanceDisplay}>
            <Text style={styles.distanceKm}>{(distance/1000).toFixed(1)}</Text>
            <Text style={styles.distanceUnit}>km</Text>
          </View>
          <View style={styles.sliderContainer}>
            <Pressable style={styles.stepBtn} onPress={() => setDistance(d => Math.max(100, d-100))}>
              <Text style={styles.stepBtnText}>−</Text>
            </Pressable>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(distance/5000)*100}%` }]} />
            </View>
            <Pressable style={styles.stepBtn} onPress={() => setDistance(d => Math.min(5000, d+100))}>
              <Text style={styles.stepBtnText}>＋</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* フローティング保存ボタン */}
      <View style={styles.footer}>
        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>設定を保存する</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FB' },
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  
  // カード・セクション
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, 
          ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 3 } }) },
  groupTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 12, marginLeft: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#8E8E93' },
  
  // 完了度
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  percentageText: { fontSize: 24, fontWeight: '800', color: '#007AFF' },
  progressTrack: { height: 12, backgroundColor: '#E5E5EA', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#007AFF', borderRadius: 6 },

  // リスト行
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F2F2F7' },
  selectedRow: { backgroundColor: '#F0F7FF', borderRadius: 12, marginHorizontal: -10, paddingHorizontal: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  rowIcon: { fontSize: 22 },
  rowTextInfo: { flex: 1 },
  rowLabel: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  rowDesc: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  
  // ラジオボタン
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#C7C7CC', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#007AFF' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#007AFF' },

  // グリッドタイル
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  tile: { width: CARD_WIDTH, backgroundColor: '#FFF', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'transparent' },
  tileSelected: { borderColor: '#007AFF', backgroundColor: '#F0F7FF' },
  tileIcon: { fontSize: 28, marginBottom: 8 },
  tileLabel: { fontSize: 15, fontWeight: '600', color: '#3A3A3C' },
  tileLabelSelected: { color: '#007AFF' },

  // 距離設定
  distanceDisplay: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginVertical: 15 },
  distanceKm: { fontSize: 48, fontWeight: '800', color: '#1C1C1E' },
  distanceUnit: { fontSize: 20, fontWeight: '600', color: '#8E8E93', marginLeft: 4 },
  sliderContainer: { flexDirection: 'row', alignItems: 'center' },
  track: { flex: 1, height: 8, backgroundColor: '#E5E5EA', borderRadius: 4, marginHorizontal: 15, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#007AFF' },
  stepBtn: { width: 44, height: 44, backgroundColor: '#F2F2F7', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  stepBtnText: { fontSize: 24, color: '#007AFF', fontWeight: '500' },

  // フッター
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, backgroundColor: 'rgba(248,249,251,0.9)' },
  saveButton: { backgroundColor: '#007AFF', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});