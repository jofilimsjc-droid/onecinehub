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
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getMovies } from '../api';
import type { Movie } from '../types/api';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, GRADIENTS, SHADOWS, SIZES, FONTS, RADIUS, SPACING } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

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
          <View style={styles.loadingLogo}>
            <MaterialIcons name="search" size={48} color={COLORS.primary} />
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
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.headerSubtitle}>Find your next favorite film</Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
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
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={20} color={COLORS.textMuted} />
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
              <MaterialIcons name="search" size={56} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No movies found</Text>
            <Text style={styles.emptyText}>
              Try searching for a different title or genre
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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
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
  headerTitle: { 
    fontSize: FONTS.xxl, 
    fontWeight: '700', 
    color: COLORS.text 
  },
  placeholder: {
    width: 40,
  },
  headerSubtitle: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.md 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.surface, 
    marginHorizontal: SPACING.lg, 
    borderRadius: RADIUS.lg, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  searchIcon: {
    fontSize: 18,
    marginLeft: SPACING.lg,
  },
  searchInput: { 
    flex: 1, 
    padding: SPACING.lg, 
    color: COLORS.text, 
    fontSize: FONTS.md 
  },
  clearButton: {
    padding: SPACING.md,
    marginRight: SPACING.sm,
  },
  clearText: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.lg,
    fontWeight: '600',
  },
  resultsHeader: { 
    paddingHorizontal: SPACING.lg, 
    paddingVertical: SPACING.md 
  },
  resultCount: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.md 
  },
  list: { 
    padding: SPACING.lg, 
    paddingTop: 0, 
    paddingBottom: SPACING.xxxl 
  },
  row: { 
    justifyContent: 'space-between', 
    marginBottom: SPACING.lg 
  },
  card: { 
    width: '48%', 
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
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  badgeGradient: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  badgeText: { 
    color: COLORS.text, 
    fontSize: FONTS.xs, 
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  overlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: SPACING.md,
  },
  title: { 
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
  empty: { 
    flex: 1, 
    padding: SPACING.xxxl, 
    alignItems: 'center' 
  },
  emptyIcon: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: COLORS.surface,
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

