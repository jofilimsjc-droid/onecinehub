import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { checkAuth, getMovies } from '../api';
import { useToast } from '../context/ToastContext';
import type { Movie } from '../types/api';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, GRADIENTS, SHADOWS, SIZES } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export default function FavoritesScreen({ navigation }: Props) {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }
    try {
      const [authRes, moviesRes] = await Promise.all([checkAuth(), getMovies()]);
      
      if (authRes.ok && authRes.data) {
        setFavorites(Array.isArray(authRes.data.favorites) ? authRes.data.favorites : []);
      } else if (!isRefresh) {
        // Don't show error for network issues, just keep existing data
      }
      
      if (moviesRes.ok && Array.isArray(moviesRes.data)) {
        setMovies(moviesRes.data as Movie[]);
      }
    } catch {
      // Silent fail on network error - keep existing data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh favorites when screen comes into focus (to pick up changes from MovieDetailScreen)
  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [])
  );

  useEffect(() => {
    load();
  }, []);

  const favoriteMovies = useMemo(() => movies.filter((m) => favorites.includes(m.id)), [movies, favorites]);

  if (loading && favoriteMovies.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Favorites</Text>
        <Text style={styles.subtitle}>{favoriteMovies.length} movie{favoriteMovies.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={favoriteMovies}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
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
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyText}>
              Tap the heart icon on any movie to add it to your favorites list.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('MovieDetail', { movie: item, isFavorited: true })}
            activeOpacity={0.9}
          >
            <View style={styles.cardImageContainer}>
              <Image source={{ uri: item.poster }} style={styles.poster} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
                style={styles.cardGradient}
              />
            </View>
            
            <View style={styles.favoriteBadge}>
              <LinearGradient
                colors={GRADIENTS.primary as any}
                style={styles.favoriteBadgeGradient}
              >
                <Text style={styles.favoriteText}>★</Text>
              </LinearGradient>
            </View>
            
            {item.status === 'nowShowing' && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>NOW SHOWING</Text>
              </View>
            )}
            
            <View style={styles.overlay}>
              <Text style={styles.movieTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.meta}>{item.genre}</Text>
            </View>
          </TouchableOpacity>
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
  list: { padding: 16, paddingBottom: 100 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  card: { 
    width: CARD_WIDTH, 
    aspectRatio: 2 / 3, 
    borderRadius: SIZES.radius, 
    overflow: 'hidden', 
    backgroundColor: COLORS.surface,
    ...SHADOWS.medium,
  },
  cardImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  poster: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  overlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 12,
  },
  movieTitle: { 
    color: COLORS.text, 
    fontSize: 14, 
    fontWeight: '700', 
    marginBottom: 4,
    lineHeight: 18,
  },
  meta: { 
    color: COLORS.textSecondary, 
    fontSize: 12,
  },
  favoriteBadge: { 
    position: 'absolute', 
    top: 10, 
    right: 10,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  favoriteBadgeGradient: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteText: { 
    fontSize: 16,
    color: '#fff'
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: COLORS.text,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  empty: { flex: 1, padding: 40, alignItems: 'center' },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...SHADOWS.medium },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

