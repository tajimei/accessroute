import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

// Web用のMapView代替（プレースホルダー）
function MapViewWeb(props: any) {
  return (
    <View style={[styles.container, props.style]}>
      <View style={styles.inner}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.text}>地図表示（Web版では利用不可）</Text>
        <Text style={styles.sub}>Expo Go（iOS/Android）で地図が表示されます</Text>
      </View>
      {props.children}
    </View>
  );
}

export function Marker(_props: any) {
  return null;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  sub: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default MapViewWeb;
