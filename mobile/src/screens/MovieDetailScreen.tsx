import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { toggleFavorite } from '../api';
import { useToast } from '../context/ToastContext';
import type { RootStackParamList } from '../types/navigation';
import type { Movie } from '../types/api';
import { COLORS, GRADIENTS, SHADOWS, SIZES } from '../theme';

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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareText}>↗</Text>
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
              <Text style={styles.ratingText}>{movie.rating}</Text>
            </LinearGradient>
          </View>

          <View style={styles.posterActions}>
            <TouchableOpacity 
              style={[styles.actionBtn, favorited && styles.actionBtnActive]} 
              onPress={handleToggleFavorite}
              disabled={loading}
            >
              <Text style={[styles.actionLabel, favorited && styles.actionLabelActive]}>
                {favorited ? 'Favorited' : 'Favorite'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{movie.title}</Text>
          </View>
          
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{movie.genre}</Text>
            <View style={styles.metaDivider} />
            <Text style={styles.metaText}>{movie.duration}</Text>
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
              >
                <Text style={styles.primaryBtnText}>Get Tickets</Text>
              </TouchableOpacity>
            </LinearGradient>

            {trailerUrl ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => openTrailer(trailerUrl)}>
                <Text style={styles.secondaryBtnText}>Watch Trailer</Text>
              </TouchableOpacity>
            ) : null}
          </View>


        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { paddingBottom: 40 },
  back: { 
    position: 'absolute', 
    top: 50, 
    left: 16, 
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  backText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  shareBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  shareText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
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
    top: 16,
    right: 16,
    borderRadius: 8,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  ratingGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ratingText: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  posterActions: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  actionBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(229,9,20,0.2)',
  },
  actionIcon: { fontSize: 20, marginRight: 8 },
  actionLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  actionLabelActive: { color: COLORS.primary },
  info: { paddingHorizontal: 20, marginTop: -40 },
  titleRow: { marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, lineHeight: 34 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: { fontSize: 14, marginRight: 6 },
  metaText: { color: COLORS.textSecondary, fontSize: 14 },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 12,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    ...SHADOWS.small,
  },
  statusText: { color: COLORS.text, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  statusTextDark: { color: '#000' },
  section: { marginBottom: 24 },
  sectionTitle: { 
    color: COLORS.primary, 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 12 
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: 16,
    ...SHADOWS.small,
  },
  body: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 24 },
  buttons: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 8,
    marginBottom: 32,
  },
  primaryBtnGradient: {
    flex: 1,
    borderRadius: SIZES.radius,
    ...SHADOWS.glow,
  },
  primaryBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', 
    padding: 16, 
    borderRadius: SIZES.radius,
  },
  primaryBtnIcon: { fontSize: 18, marginRight: 8 },
  primaryBtnText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  secondaryBtn: { 
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16, 
    borderRadius: SIZES.radius, 
    borderWidth: 2, 
    borderColor: COLORS.surfaceLighter,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  secondaryBtnIcon: { fontSize: 16, marginRight: 8 },
  secondaryBtnText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  infoCardIcon: { fontSize: 24, marginBottom: 8 },
  infoCardTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  infoCardText: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center' },
});

