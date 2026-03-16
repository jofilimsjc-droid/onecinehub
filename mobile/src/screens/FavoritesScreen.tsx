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
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { checkAuth, getMovies, getTrailers } from '../api';
import { useToast } from '../context/ToastContext';
import type { Movie, Trailer } from '../types/api';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, GRADIENTS, SHADOWS, SIZES, FONTS, RADIUS, SPACING } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export default function FavoritesScreen({ navigation }: Props) {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }
    try {
      const [authRes, moviesRes, trailersRes] = await Promise.all([
        checkAuth(),
        getMovies(),
        getTrailers()
      ]);
      
      if (authRes.ok && authRes.data) {
        setFavorites(Array.isArray(authRes.data.favorites) ? authRes.data.favorites : []);
      } else if (!isRefresh) {
        // Don't show error for network issues, just keep existing data
      }
      
      if (moviesRes.ok && Array.isArray(moviesRes.data)) {
        setMovies(moviesRes.data as Movie[]);
      }
      
      if (trailersRes.ok && Array.isArray(trailersRes.data)) {
        setTrailers(trailersRes.data as Trailer[]);
      }
    } catch {
      // Silent fail on network error - keep existing data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [])
  );

  useEffect(() => {
    load();
  }, []);

  const favoriteMovies = useMemo(() => movies.filter((m) => favorites.includes(m.id)), [movies, favorites]);

  const getTrailerForMovie = (movieId: number) => trailers.find((t) => t.movie_id === movieId)?.url;

  if (loading && favoriteMovies.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingLogo}>
            <MaterialIcons name="favorite" size={48} color={COLORS.error} />
          </View>
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Favorites</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.subtitle}>
          {favoriteMovies.length} movie{favoriteMovies.length !== 1 ? 's' : ''} saved
        </Text>
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
              <MaterialIcons name="favorite" size={56} color={COLORS.error} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyText}>
              Tap the heart icon on any movie to add it to your favorites list.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const trailerUrl = getTrailerForMovie(item.id);
          return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('MovieDetail', { 
              movie: item, 
              isFavorited: true,
              trailerUrl
            })}
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
                <MaterialIcons name="favorite" size={16} color="#fff" />
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
          );
        }}
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
  row: { 
    justifyContent: 'space-between', 
    marginBottom: SPACING.lg 
  },
  card: { 
    width: CARD_WIDTH, 
    aspectRatio: 2 / 3, 
    borderRadius: RADIUS.lg, 
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
    padding: SPACING.md,
  },
  movieTitle: { 
    color: COLORS.text, 
    fontSize: FONTS.md, 
    fontWeight: '700', 
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  meta: { 
    color: COLORS.textSecondary, 
    fontSize: FONTS.sm,
  },
  favoriteBadge: { 
    position: 'absolute', 
    top: SPACING.sm, 
    right: SPACING.sm,
    borderRadius: RADIUS.full,
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
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    color: COLORS.text,
    fontSize: FONTS.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
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

