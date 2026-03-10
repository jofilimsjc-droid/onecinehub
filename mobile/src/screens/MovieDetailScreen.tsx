import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Share, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { toggleFavorite } from '../api';
import { useToast } from '../context/ToastContext';
import type { RootStackParamList } from '../types/navigation';
import type { Movie } from '../types/api';
import { COLORS, GRADIENTS, SHADOWS, SIZES, FONTS, RADIUS, SPACING, DEVICE } from '../theme';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

export default function MovieDetailScreen({ route, navigation }: Props) {
  const { movie, trailerUrl, isFavorited: initialFavorited } = route.params as { movie: Movie; trailerUrl?: string; isFavorited?: boolean };
  const { showToast } = useToast();
  const [favorited, setFavorited] = useState<boolean>(initialFavorited ?? false);
  const [loading, setLoading] = useState(false);

  const openTrailer = async (url?: string) => {
    if (!url) return;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      showToast('Could not open trailer', 'error');
    }
  };

  const handleToggleFavorite = async () => {
    setLoading(true);
    try {
      const result = await toggleFavorite(movie.id);
      if (result.ok && result.data) {
        setFavorited(result.data.favorited);
        showToast(
          result.data.favorited ? 'Added to favorites' : 'Removed from favorites',
          result.data.favorited ? 'success' : 'info'
        );
      } else {
        showToast(result.data?.message || 'Failed to update favorite', 'error');
      }
    } catch {
      setFavorited(!favorited);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out "${movie.title}" on ONECINEHUB! ${trailerUrl || ''}`,
        title: movie.title,
      });
    } catch {
      showToast('Could not share', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={styles.back} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.shareBtn} 
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <View style={styles.shareButton}>
            <Text style={styles.shareText}>↗</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.posterWrap}>
          <Image source={{ uri: movie.poster }} style={styles.poster} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', COLORS.background]}
            style={styles.posterGradient}
          />
          
          <View style={styles.ratingBadge}>
            <LinearGradient
              colors={GRADIENTS.primary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ratingGradient}
            >
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={16} color="#fff" />
                <Text style={styles.ratingText}> {movie.rating}</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <TouchableOpacity 
              style={[styles.favoriteBtn, favorited && styles.favoriteBtnActive]} 
              onPress={handleToggleFavorite}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <MaterialIcons 
                  name={favorited ? "favorite" : "favorite-border"} 
                  size={20} 
                  color={favorited ? COLORS.error : COLORS.text} 
                />
              )}
            </TouchableOpacity>
            <Text style={styles.title}>{movie.title}</Text>
          </View>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialIcons name="movie" size={14} color={COLORS.textSecondary} />
              <Text style={styles.metaText}> {movie.genre}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={14} color={COLORS.textSecondary} />
              <Text style={styles.metaText}> {movie.duration}</Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            <LinearGradient
              colors={movie.status === 'nowShowing' ? GRADIENTS.primary : GRADIENTS.gold as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statusBadge}
            >
              <Text style={[styles.statusText, movie.status === 'comingSoon' && styles.statusTextDark]}>
                {movie.status === 'nowShowing' ? 'NOW SHOWING' : 'COMING SOON'}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Synopsis</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.body}>{movie.synopsis}</Text>
            </View>
          </View>

          {movie.cast ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cast</Text>
              <View style={styles.sectionContent}>
                <Text style={styles.body}>{movie.cast}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.buttons}>
            <LinearGradient
              colors={GRADIENTS.primary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}
            >
              <TouchableOpacity 
                style={styles.primaryBtn} 
                onPress={() => navigation.navigate('Booking', { movie })}
                activeOpacity={0.8}
              >
                <MaterialIcons name="confirmation-number" size={18} color={COLORS.text} />
                <Text style={styles.primaryBtnText}> Get Tickets</Text>
              </TouchableOpacity>
            </LinearGradient>

            {trailerUrl ? (
              <TouchableOpacity 
                style={styles.secondaryBtn} 
                onPress={() => openTrailer(trailerUrl)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="play-arrow" size={18} color={COLORS.text} />
                <Text style={styles.secondaryBtnText}> Watch Trailer</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  scrollView: { 
    flex: 1 
  },
  content: { 
    paddingBottom: SPACING.xxxl 
  },
  back: { 
    position: 'absolute', 
    top: DEVICE.statusBarHeight + SPACING.sm, 
    left: SPACING.lg, 
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  backText: { 
    color: COLORS.text, 
    fontSize: 18, 
    fontWeight: '600' 
  },
  shareBtn: {
    position: 'absolute',
    top: DEVICE.statusBarHeight + SPACING.sm,
    right: SPACING.lg,
    zIndex: 10,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  shareText: { 
    color: COLORS.text, 
    fontSize: 18, 
    fontWeight: '600' 
  },
  posterWrap: {
    width: width, 
    aspectRatio: 2 / 3,
    position: 'relative',
  },
  poster: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover',
  },
  posterGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  ratingBadge: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  ratingGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  ratingText: { 
    color: COLORS.text, 
    fontWeight: '700', 
    fontSize: FONTS.md 
  },
  info: {
    paddingHorizontal: SPACING.lg, 
    marginTop: -SPACING.xxxl 
  },
  titleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: SPACING.md 
  },
  favoriteBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.small,
  },
  favoriteBtnActive: {
    backgroundColor: 'rgba(229,9,20,0.15)',
  },
  favoriteIcon: { 
    fontSize: 18 
  },
  title: { 
    flex: 1,
    fontSize: FONTS.xxxl, 
    fontWeight: '800', 
    color: COLORS.text, 
    lineHeight: 38 
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: { 
    fontSize: 14, 
    marginRight: SPACING.sm 
  },
  metaText: { 
    color: COLORS.textSecondary, 
    fontSize: FONTS.md 
  },
  metaDivider: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: SPACING.md,
  },
  statusContainer: {
    marginBottom: SPACING.xl,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    ...SHADOWS.small,
  },
  statusText: { 
    color: COLORS.text, 
    fontSize: FONTS.sm, 
    fontWeight: '800', 
    letterSpacing: 1 
  },
  statusTextDark: { 
    color: '#000' 
  },
  section: { 
    marginBottom: SPACING.xl 
  },
  sectionTitle: { 
    color: COLORS.primary, 
    fontSize: FONTS.lg, 
    fontWeight: '700', 
    marginBottom: SPACING.md 
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  body: { 
    color: COLORS.textSecondary, 
    fontSize: FONTS.md, 
    lineHeight: 24 
  },
  buttons: { 
    flexDirection: 'row', 
    gap: SPACING.md, 
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  primaryBtnGradient: {
    flex: 1.2,
    borderRadius: RADIUS.lg,
    ...SHADOWS.glow,
  },
  primaryBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', 
    padding: SPACING.lg, 
    borderRadius: RADIUS.lg,
  },
  primaryBtnIcon: { 
    fontSize: 18, 
    marginRight: SPACING.sm 
  },
  primaryBtnText: { 
    color: COLORS.text, 
    fontSize: FONTS.lg, 
    fontWeight: '700' 
  },
  secondaryBtn: { 
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg, 
    borderRadius: RADIUS.lg, 
    borderWidth: 2, 
    borderColor: COLORS.surfaceLighter,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  secondaryBtnIcon: { 
    fontSize: 16, 
    marginRight: SPACING.sm 
  },
  secondaryBtnText: { 
    color: COLORS.text, 
    fontSize: FONTS.md, 
    fontWeight: '600' 
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  infoCardIcon: { 
    fontSize: 24, 
    marginBottom: SPACING.sm 
  },
  infoCardTitle: { 
    color: COLORS.text, 
    fontSize: FONTS.md, 
    fontWeight: '700', 
    marginBottom: SPACING.xs 
  },
  infoCardText: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.sm, 
    textAlign: 'center' 
  },
});

