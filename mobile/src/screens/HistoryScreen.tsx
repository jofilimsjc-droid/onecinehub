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
import { COLORS, GRADIENTS, SHADOWS, SIZES, FONTS, RADIUS, SPACING } from '../theme';

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

  // Refresh history when screen comes into focus
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
          <View style={styles.loadingLogo}>
            <Text style={styles.loadingEmoji}>🎟️</Text>
          </View>
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => _props.navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Booking History</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.subtitle}>
          {history.length} booking{history.length !== 1 ? 's' : ''}
        </Text>
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
              <Text style={styles.emptyEmoji}>🎟️</Text>
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
                <Text style={styles.detailIcon}>📍</Text>
                <Text style={styles.detail}>{item.branch}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📅</Text>
                <Text style={styles.detail}>{item.date} at {item.time}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>💺</Text>
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
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  centered: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.glow,
  },
  loadingEmoji: {
    fontSize: 48,
  },
  loadingIndicator: {
    marginBottom: SPACING.md,
  },
  loadingText: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.md 
  },
  header: { 
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  backText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
  },
  title: { 
    fontSize: FONTS.xxl, 
    fontWeight: '700', 
    color: COLORS.text 
  },
  placeholder: {
    width: 40,
  },
  subtitle: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.md 
  },
  list: { 
    padding: SPACING.lg, 
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxxl 
  },
  card: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.surface, 
    borderRadius: RADIUS.lg, 
    padding: SPACING.md, 
    marginBottom: SPACING.md, 
    ...SHADOWS.medium,
  },
  poster: { 
    width: 80, 
    height: 110, 
    borderRadius: RADIUS.md, 
    backgroundColor: COLORS.surfaceLighter 
  },
  info: { 
    flex: 1, 
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  movieTitle: { 
    fontSize: FONTS.lg, 
    fontWeight: '700', 
    color: COLORS.text, 
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: SPACING.xs 
  },
  detailIcon: { 
    fontSize: 12, 
    marginRight: SPACING.sm 
  },
  detail: { 
    color: COLORS.textSecondary, 
    fontSize: FONTS.sm,
    flex: 1,
  },
  txContainer: { 
    marginTop: SPACING.sm, 
    paddingTop: SPACING.sm, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.surfaceLighter,
  },
  txLabel: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.xs,
    marginBottom: 2,
  },
  tx: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.sm,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statusText: {
    color: COLORS.text,
    fontSize: FONTS.sm,
    fontWeight: '700',
  },
  empty: { 
    flex: 1, 
    padding: SPACING.xxxl, 
    alignItems: 'center' 
  },
  emptyIcon: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: SPACING.xl, 
    ...SHADOWS.medium 
  },
  emptyEmoji: { 
    fontSize: 56 
  },
  emptyTitle: { 
    fontSize: FONTS.xl, 
    fontWeight: '600', 
    color: COLORS.text, 
    marginBottom: SPACING.sm 
  },
  emptyText: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.md, 
    textAlign: 'center', 
    lineHeight: 22 
  },
});

