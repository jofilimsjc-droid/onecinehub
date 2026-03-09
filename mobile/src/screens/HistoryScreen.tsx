import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { checkAuth } from '../api';
import { useToast } from '../context/ToastContext';
import type { BookingHistoryItem } from '../types/api';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, GRADIENTS, SHADOWS, SIZES } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen(_props: Props) {
  const { showToast } = useToast();
  const [history, setHistory] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }
    try {
      const res = await checkAuth();
      if (res.ok && res.data?.bookingHistory) {
        setHistory(Array.isArray(res.data.bookingHistory) ? res.data.bookingHistory : []);
      }
    } catch {
      // Silent fail on network error - keep existing data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh history when screen comes into focus (to pick up new bookings)
  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [])
  );

  useEffect(() => {
    load();
  }, []);

  if (loading && history.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking History</Text>
        <Text style={styles.subtitle}>{history.length} booking{history.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.tx_number}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load(true);
            }}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <LinearGradient
              colors={GRADIENTS.card as any}
              style={styles.emptyIcon}
            >
              <Text style={styles.emptyEmoji}></Text>
            </LinearGradient>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>
              Your booking history will appear here after you make your first booking.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.movie.poster }} style={styles.poster} />
            <View style={styles.info}>
              <Text style={styles.movieTitle} numberOfLines={2}>{item.movie.title}</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detail}>{item.branch}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detail}>{item.date} at {item.time}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detail}>Seats: {item.seats.join(', ')}</Text>
              </View>
              
              <View style={styles.txContainer}>
                <Text style={styles.txLabel}>Transaction ID:</Text>
                <Text style={styles.tx}>{item.tx_number}</Text>
              </View>
            </View>
            
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingContainer: { alignItems: 'center' },
  loadingIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24, ...SHADOWS.glow },
  loadingEmoji: { fontSize: 36 },
  loadingText: { color: COLORS.textMuted, fontSize: 14, marginTop: 12 },
  header: { padding: 20, paddingTop: 8 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.text },
  subtitle: { color: COLORS.textMuted, fontSize: 14, marginTop: 4 },
  list: { padding: 20, paddingBottom: 100 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.surface, 
    borderRadius: SIZES.radius, 
    padding: 14, 
    marginBottom: 14, 
    ...SHADOWS.medium,
  },
  poster: { 
    width: 80, 
    height: 110, 
    borderRadius: SIZES.radiusSmall, 
    backgroundColor: COLORS.surfaceLighter 
  },
  info: { 
    flex: 1, 
    marginLeft: 14,
    justifyContent: 'center',
  },
  movieTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: COLORS.text, 
    marginBottom: 10,
    lineHeight: 20,
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  detailIcon: { 
    fontSize: 12, 
    marginRight: 8 
  },
  detail: { 
    color: COLORS.textSecondary, 
    fontSize: 13,
  },
  txContainer: { 
    marginTop: 10, 
    paddingTop: 10, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.surfaceLighter,
  },
  txLabel: { 
    color: COLORS.textMuted, 
    fontSize: 10,
    marginBottom: 2,
  },
  tx: { 
    color: COLORS.textMuted, 
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  empty: { flex: 1, padding: 40, alignItems: 'center' },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...SHADOWS.medium },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

