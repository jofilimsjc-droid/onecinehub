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
  Animated,
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
import type { Movie, Trailer, BookingHistoryItem } from '../types/api';
import { COLORS, GRADIENTS, SHADOWS, SIZES } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

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
  const [recentBookings, setRecentBookings] = useState<BookingHistoryItem[]>([]);
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
        if (authRes.data.bookingHistory) {
          setRecentBookings(authRes.data.bookingHistory.slice(0, 3));
        }
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

  // Refresh data when screen comes into focus (to pick up new favorites/bookings)
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
          >
            <Text style={styles.btnText}>Get Tickets</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderRecentBooking = ({ item }: { item: BookingHistoryItem }) => (
    <TouchableOpacity 
      style={styles.recentCard}
      onPress={() => {
        if (item.movie) {
          const movieId = item.movie_id || item.movie.id;
          const isFavorited = favorites.includes(movieId);
          navigation.navigate('MovieDetail', { 
            movie: { 
              ...item.movie, 
              id: movieId,
              status: 'nowShowing' as const,
              genre: '',
              duration: '',
              rating: '',
              synopsis: '',
            }, 
            trailerUrl: '', 
            isFavorited: isFavorited 
          });
        }
      }}
    >
      <Image source={{ uri: item.movie?.poster }} style={styles.recentPoster} />
      <View style={styles.recentInfo}>
        <Text style={styles.recentTitle} numberOfLines={1}>{item.movie?.title}</Text>
        <Text style={styles.recentDetails}>{item.branch} | {new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.recentDetails}>{item.time}</Text>
      </View>
      <View style={styles.recentArrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {recentBookings.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Watching</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentBookings}
            keyExtractor={(item) => item.tx_number}
            renderItem={renderRecentBooking}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
          />
        </View>
      )}

      <View style={styles.offerSection}>
        <TouchableOpacity style={styles.offerCard} activeOpacity={0.8}>
          <LinearGradient
            colors={GRADIENTS.primary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.offerGradient}
          >
            <Text style={styles.offerTitle}>Special Offer</Text>
          </LinearGradient>
          <View style={styles.offerContent}>
            <Text style={styles.offerText}>Get 20% off on weekend bookings!</Text>
            <Text style={styles.offerCode}>Use code: WEEKEND20</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsRow}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'nowShowing' && styles.tabActive]}
            onPress={() => setTab('nowShowing')}
          >
            <Text style={[styles.tabText, tab === 'nowShowing' && styles.tabTextActive]}>NOW SHOWING</Text>
            {tab === 'nowShowing' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'comingSoon' && styles.tabActive]}
            onPress={() => setTab('comingSoon')}
          >
            <Text style={[styles.tabText, tab === 'comingSoon' && styles.tabTextActive]}>COMING SOON</Text>
            {tab === 'comingSoon' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.genreButton}
          onPress={() => setShowGenreModal(true)}
        >
          <Text style={styles.genreButtonText}>{selectedGenre} ▼</Text>
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
            <Text style={styles.emptyIcon}></Text>
            <Text style={styles.emptyText}>
              {tab === 'nowShowing' ? 'No movies currently showing' : 'No upcoming movies'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.glow,
  },
  loadingEmoji: {
    fontSize: 36,
  },
  loadingText: { color: COLORS.textMuted, fontSize: 14, marginTop: 12 },
  header: { padding: 20, paddingTop: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  tagline: { fontSize: 14, color: COLORS.textMuted },
  searchBtn: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: COLORS.surface, 
    justifyContent: 'center', 
    alignItems: 'center',
    ...SHADOWS.small,
  },
  searchIcon: { fontSize: 20 },
  recentSection: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  seeAll: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  recentList: { paddingHorizontal: 20 },
  recentCard: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.surface, 
    borderRadius: SIZES.radius, 
    padding: 12, 
    marginRight: 12, 
    width: 280, 
    alignItems: 'center',
    ...SHADOWS.small,
  },
  recentPoster: { width: 60, height: 90, borderRadius: 8, backgroundColor: COLORS.surfaceLighter },
  recentInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  recentTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  recentDetails: { color: COLORS.textMuted, fontSize: 12, marginBottom: 2 },
  recentArrow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: COLORS.textMuted,
    fontSize: 24,
    fontWeight: '300',
  },
  offerSection: { paddingHorizontal: 20, marginBottom: 16 },
  offerCard: { 
    backgroundColor: COLORS.surface, 
    borderRadius: SIZES.radius, 
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  offerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  offerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  offerContent: {
    padding: 16,
    paddingTop: 12,
  },
  offerText: { color: COLORS.textSecondary, fontSize: 13 },
  offerCode: { 
    color: COLORS.gold, 
    fontSize: 13, 
    fontWeight: '700', 
    marginTop: 4,
  },
  tabsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  tabs: { flexDirection: 'row', gap: 24 },
  tab: { paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center' },
  tabActive: {},
  tabText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.text },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  genreButton: { 
    backgroundColor: COLORS.surface, 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: COLORS.surfaceLighter,
    ...SHADOWS.small,
  },
  genreButtonText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLarge, width: '85%', maxHeight: '70%', overflow: 'hidden' },
  modalHeader: {
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  genreList: { maxHeight: 300, paddingHorizontal: 8 },
  genreItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceLighter },
  genreItemActive: { backgroundColor: 'rgba(229,9,20,0.1)', borderRadius: SIZES.radiusSmall },
  genreItemText: { fontSize: 16, color: COLORS.textSecondary },
  genreItemTextActive: { color: COLORS.primary, fontWeight: '600' },
  checkmark: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  closeModalBtn: { margin: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.surfaceLighter, borderRadius: SIZES.radius },
  closeModalText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  list: { padding: 16, paddingTop: 0, paddingBottom: 100 },
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
  poster: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  badgeNowShowing: { position: 'absolute', top: 8, left: 8, borderRadius: 4, overflow: 'hidden' },
  badgeComingSoon: { position: 'absolute', top: 8, left: 8, borderRadius: 4, overflow: 'hidden' },
  badgeGradient: {
    paddingHorizontal: 8, 
    paddingVertical: 4,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  badgeTextDark: { color: '#000', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, paddingTop: 40 },
  title: { color: COLORS.text, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  meta: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 8 },
  btn: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 6, 
    alignSelf: 'flex-start',
    ...SHADOWS.small,
  },
  btnText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  empty: { flex: 1, padding: 40, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: COLORS.textMuted, fontSize: 16 },
});

