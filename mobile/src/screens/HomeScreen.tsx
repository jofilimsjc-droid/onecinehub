import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getMovies, getTrailers, checkAuth } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';
import type { Movie, Trailer } from '../types/api';
import { COLORS, GRADIENTS, SHADOWS, SIZES, FONTS, RADIUS, SPACING, DEVICE } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [tab, setTab] = useState<'nowShowing' | 'comingSoon'>('nowShowing');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const load = async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }
    try {
      const [moviesRes, trailersRes, authRes] = await Promise.all([getMovies(), getTrailers(), checkAuth()]);
      
      if (moviesRes.ok) {
        setMovies(Array.isArray(moviesRes.data) ? (moviesRes.data as Movie[]) : []);
      }
      
      if (trailersRes.ok) {
        setTrailers(Array.isArray(trailersRes.data) ? (trailersRes.data as Trailer[]) : []);
      }
      
      if (authRes.ok && authRes.data) {
        if (authRes.data.favorites) {
          setFavorites(authRes.data.favorites);
        }
      }
    } catch {
      // Silent fail - keep existing data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [])
  );

  useEffect(() => {
    load();
  }, []);

  // Get unique genres from movies
  const genres = useMemo(() => {
    const allGenres = movies.map((m) => m.genre).filter(Boolean);
    const uniqueGenres = [...new Set(allGenres)];
    return ['All', ...uniqueGenres.sort()];
  }, [movies]);

  const nowShowing = useMemo(() => {
    let filtered = movies.filter((m) => m.status === 'nowShowing');
    if (selectedGenre !== 'All') {
      filtered = filtered.filter((m) => m.genre === selectedGenre);
    }
    return filtered;
  }, [movies, selectedGenre]);

  const comingSoon = useMemo(() => {
    let filtered = movies.filter((m) => m.status === 'comingSoon');
    if (selectedGenre !== 'All') {
      filtered = filtered.filter((m) => m.genre === selectedGenre);
    }
    return filtered;
  }, [movies, selectedGenre]);

  const list = tab === 'nowShowing' ? nowShowing : comingSoon;

  const getTrailerForMovie = (movieId: number) => trailers.find((t) => t.movie_id === movieId)?.url;

  const handleMoviePress = (movie: Movie) => {
    if (movie.status === 'nowShowing') {
      const isFavorited = favorites.includes(movie.id);
      navigation.navigate('MovieDetail', {
        movie: movie,
        trailerUrl: getTrailerForMovie(movie.id),
        isFavorited: isFavorited,
      });
    }
  };

  const renderMovie = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleMoviePress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.poster }} style={styles.poster} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
          style={styles.cardGradient}
        />
      </View>
      
      {item.status === 'nowShowing' ? (
        <View style={styles.badgeNowShowing}>
          <LinearGradient
            colors={GRADIENTS.primary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badgeGradient}
          >
            <Text style={styles.badgeText}>NOW SHOWING</Text>
          </LinearGradient>
        </View>
      ) : (
        <View style={styles.badgeComingSoon}>
          <LinearGradient
            colors={GRADIENTS.gold as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badgeGradient}
          >
            <Text style={styles.badgeTextDark}>COMING SOON</Text>
          </LinearGradient>
        </View>
      )}

      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.meta} numberOfLines={1}>{item.genre} | {item.duration}</Text>
        {item.status === 'nowShowing' ? (
          <TouchableOpacity
            style={styles.btn}
            onPress={() => handleMoviePress(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Get Tickets</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingLogo}>
            <Text style={styles.loadingEmoji}>🎬</Text>
          </View>
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading movies...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.username || 'Guest'}</Text>
            <Text style={styles.tagline}>What would you like to watch?</Text>
          </View>
          <TouchableOpacity 
            style={styles.searchBtn}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.7}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsRow}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'nowShowing' && styles.tabActive]}
            onPress={() => setTab('nowShowing')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, tab === 'nowShowing' && styles.tabTextActive]}>NOW SHOWING</Text>
            {tab === 'nowShowing' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'comingSoon' && styles.tabActive]}
            onPress={() => setTab('comingSoon')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, tab === 'comingSoon' && styles.tabTextActive]}>COMING SOON</Text>
            {tab === 'comingSoon' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.genreButton}
          onPress={() => setShowGenreModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.genreButtonText}>🎬 {selectedGenre}</Text>
        </TouchableOpacity>
      </View>

      {/* Genre Filter Modal */}
      <Modal
        visible={showGenreModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenreModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenreModal(false)}
        >
          <View style={styles.modalContent}>
            <LinearGradient
              colors={GRADIENTS.primary as any}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Select Genre</Text>
            </LinearGradient>
            <ScrollView style={styles.genreList}>
              {genres.map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genreItem,
                    selectedGenre === genre && styles.genreItemActive,
                  ]}
                  onPress={() => {
                    setSelectedGenre(genre);
                    setShowGenreModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.genreItemText,
                      selectedGenre === genre && styles.genreItemTextActive,
                    ]}
                  >
                    {genre}
                  </Text>
                  {selectedGenre === genre && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowGenreModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMovie}
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
            <Text style={styles.emptyIcon}>🎬</Text>
            <Text style={styles.emptyText}>
              {tab === 'nowShowing' ? 'No movies currently showing' : 'No upcoming movies'}
            </Text>
          </View>
        }
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
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  greeting: { 
    fontSize: FONTS.xxl, 
    fontWeight: '700', 
    color: COLORS.text, 
    marginBottom: SPACING.xs 
  },
  tagline: { 
    fontSize: FONTS.md, 
    color: COLORS.textMuted 
  },
  searchBtn: { 
    width: SIZES.iconButtonSize, 
    height: SIZES.iconButtonSize, 
    borderRadius: RADIUS.full, 
    backgroundColor: COLORS.surface, 
    justifyContent: 'center', 
    alignItems: 'center',
    ...SHADOWS.small,
  },
  searchIcon: { 
    fontSize: 20 
  },
  sectionHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SPACING.lg, 
    marginBottom: SPACING.md 
  },
  sectionTitle: { 
    fontSize: FONTS.lg, 
    fontWeight: '700', 
    color: COLORS.text 
  },
  seeAll: { 
    color: COLORS.primary, 
    fontSize: FONTS.sm, 
    fontWeight: '600' 
  },
  tabsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SPACING.lg, 
    marginBottom: SPACING.lg 
  },
  tabs: { 
    flexDirection: 'row', 
    gap: SPACING.xl 
  },
  tab: { 
    paddingVertical: SPACING.md, 
    paddingHorizontal: SPACING.sm, 
    alignItems: 'center' 
  },
  tabActive: {},
  tabText: { 
    fontSize: FONTS.sm, 
    fontWeight: '700', 
    color: COLORS.textMuted 
  },
  tabTextActive: { 
    color: COLORS.text 
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 50,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  genreButton: { 
    backgroundColor: COLORS.surface, 
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.sm, 
    borderRadius: RADIUS.full, 
    borderWidth: 1, 
    borderColor: COLORS.surfaceLighter,
    ...SHADOWS.small,
  },
  genreButtonText: { 
    color: COLORS.text, 
    fontSize: FONTS.sm, 
    fontWeight: '600' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: COLORS.overlay, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: COLORS.surface, 
    borderRadius: RADIUS.xl, 
    width: '85%', 
    maxHeight: '70%', 
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  modalHeader: {
    padding: SPACING.lg,
  },
  modalTitle: { 
    fontSize: FONTS.xl, 
    fontWeight: '700', 
    color: COLORS.text, 
    textAlign: 'center' 
  },
  genreList: { 
    maxHeight: 300, 
    paddingHorizontal: SPACING.sm 
  },
  genreItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: SPACING.lg, 
    paddingHorizontal: SPACING.lg, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.surfaceLighter 
  },
  genreItemActive: { 
    backgroundColor: 'rgba(229,9,20,0.1)', 
    borderRadius: RADIUS.md 
  },
  genreItemText: { 
    fontSize: FONTS.lg, 
    color: COLORS.textSecondary 
  },
  genreItemTextActive: { 
    color: COLORS.primary, 
    fontWeight: '600' 
  },
  checkmark: { 
    color: COLORS.primary, 
    fontSize: FONTS.lg, 
    fontWeight: '700' 
  },
  closeModalBtn: { 
    margin: SPACING.lg, 
    paddingVertical: SPACING.md, 
    alignItems: 'center', 
    backgroundColor: COLORS.surfaceLighter, 
    borderRadius: RADIUS.lg 
  },
  closeModalText: { 
    color: COLORS.text, 
    fontSize: FONTS.lg, 
    fontWeight: '600' 
  },
  list: { 
    padding: SPACING.lg, 
    paddingTop: 0, 
    paddingBottom: SIZES.tabBarHeight + SPACING.xl 
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
    height: '60%',
  },
  badgeNowShowing: { 
    position: 'absolute', 
    top: SPACING.sm, 
    left: SPACING.sm, 
    borderRadius: RADIUS.sm, 
    overflow: 'hidden' 
  },
  badgeComingSoon: { 
    position: 'absolute', 
    top: SPACING.sm, 
    left: SPACING.sm, 
    borderRadius: RADIUS.sm, 
    overflow: 'hidden' 
  },
  badgeGradient: {
    paddingHorizontal: SPACING.sm, 
    paddingVertical: SPACING.xs,
  },
  badgeText: { 
    color: '#fff', 
    fontSize: FONTS.xs, 
    fontWeight: '800', 
    letterSpacing: 0.5 
  },
  badgeTextDark: { 
    color: '#000', 
    fontSize: FONTS.xs, 
    fontWeight: '800', 
    letterSpacing: 0.5 
  },
  overlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: SPACING.md, 
    paddingTop: '40%' 
  },
  title: { 
    color: COLORS.text, 
    fontSize: FONTS.md, 
    fontWeight: '800', 
    marginBottom: SPACING.xs 
  },
  meta: { 
    color: COLORS.textSecondary, 
    fontSize: FONTS.sm, 
    marginBottom: SPACING.sm 
  },
  btn: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: SPACING.sm, 
    paddingHorizontal: SPACING.md, 
    borderRadius: RADIUS.sm, 
    alignSelf: 'flex-start',
    ...SHADOWS.small,
  },
  btnText: { 
    color: COLORS.text, 
    fontSize: FONTS.sm, 
    fontWeight: '700' 
  },
  empty: { 
    flex: 1, 
    padding: SPACING.xxxl, 
    alignItems: 'center' 
  },
  emptyIcon: { 
    fontSize: 48, 
    marginBottom: SPACING.lg 
  },
  emptyText: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.lg,
    textAlign: 'center',
  },
});

