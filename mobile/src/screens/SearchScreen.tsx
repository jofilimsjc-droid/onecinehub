import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getMovies } from '../api';
import type { Movie } from '../types/api';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, GRADIENTS, SHADOWS, SIZES } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const res = await getMovies();
      if (res.ok && Array.isArray(res.data)) {
        setMovies(res.data as Movie[]);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMovies();
    }, [])
  );

  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return movies;
    const query = searchQuery.toLowerCase().trim();
    return movies.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.genre.toLowerCase().includes(query)
    );
  }, [movies, searchQuery]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setSearchLoading(false);
  };

  const renderMovie = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('MovieDetail', { movie: item })}
      activeOpacity={0.9}
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.poster }} style={styles.poster} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.cardGradient}
        />
      </View>
      
      {item.status === 'nowShowing' && (
        <View style={styles.badge}>
          <LinearGradient
            colors={GRADIENTS.primary as any}
            style={styles.badgeGradient}
          >
            <Text style={styles.badgeText}>NOW SHOWING</Text>
          </LinearGradient>
        </View>
      )}
      
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.meta} numberOfLines={1}>{item.genre} | {item.duration}</Text>
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
        <Text style={styles.headerTitle}>Search Movies</Text>
        <Text style={styles.headerSubtitle}>Find your next favorite film</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or genre..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultCount}>
          {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <FlatList
        data={filteredMovies}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMovie}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>🔍</Text>
            </View>
            <Text style={styles.emptyTitle}>No movies found</Text>
            <Text style={styles.emptyText}>
              Try searching for a different title or genre
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
  loadingContainer: { alignItems: 'center' },
  loadingIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24, ...SHADOWS.glow },
  loadingEmoji: { fontSize: 36 },
  loadingText: { color: COLORS.textMuted, fontSize: 14, marginTop: 12 },
  header: { padding: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: COLORS.text },
  headerSubtitle: { color: COLORS.textMuted, fontSize: 14, marginTop: 4 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.surface, 
    marginHorizontal: 20, 
    borderRadius: SIZES.radius, 
    borderWidth: 1, 
    borderColor: COLORS.surfaceLighter,
    ...SHADOWS.small,
  },
  searchInput: { 
    flex: 1, 
    padding: 16, 
    color: COLORS.text, 
    fontSize: 16 
  },
  clearButton: {
    padding: 12,
  },
  clearText: { 
    color: COLORS.primary, 
    fontSize: 14,
    fontWeight: '600',
  },
  resultsHeader: { paddingHorizontal: 20, paddingVertical: 12 },
  resultCount: { color: COLORS.textMuted, fontSize: 13 },
  list: { padding: 16, paddingTop: 0, paddingBottom: 100 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  card: { 
    width: '48%', 
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
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  badgeGradient: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: { 
    color: COLORS.text, 
    fontSize: 8, 
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  overlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 12,
  },
  title: { 
    color: COLORS.text, 
    fontSize: 14, 
    fontWeight: '700', 
    marginBottom: 4,
    lineHeight: 18,
  },
  meta: { 
    color: COLORS.textSecondary, 
    fontSize: 11,
  },
  empty: { flex: 1, padding: 40, alignItems: 'center' },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...SHADOWS.medium },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
});

