import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { checkAuth } from '../api';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';
import { COLORS, GRADIENTS, SHADOWS, SIZES, FONTS, RADIUS, SPACING, DEVICE } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout, reload } = useAuth();
  const { showToast } = useToast();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const loadUserActivity = async () => {
    try {
      const res = await checkAuth();
      if (res.ok && res.data) {
        setFavoritesCount(res.data.favorites?.length || 0);
        setBookingsCount(res.data.bookingHistory?.length || 0);
      }
    } catch {
      // Keep default values on error
    } finally {
      setLoadingStats(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      reload();
      loadUserActivity();
    }, [reload])
  );

  useEffect(() => {
    loadUserActivity();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive', 
        onPress: async () => {
          await logout();
          showToast('Signed out successfully', 'success');
        } 
      },
    ]);
  };

  const menuItems = [
    { title: 'Settings', screen: 'Settings', icon: 'settings', color: COLORS.primary },
    { title: 'Notifications', screen: 'Notifications', icon: 'notifications', color: COLORS.blue },
    { title: 'Booking History', screen: 'History', icon: 'confirmation-number', color: COLORS.gold },
    { title: 'Favorites', screen: 'Favorites', icon: 'favorite', color: COLORS.error },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
          <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLogoWrapper}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.headerLogoImage}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.logo}>ONECINEHUB</Text>
                <Text style={styles.tagline}>Your Profile</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.username?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{user?.username || 'User'}</Text>
              <Text style={styles.email}>{user?.email || ''}</Text>
              <View style={styles.memberBadge}>
                <MaterialIcons name="movie" size={14} color={COLORS.primary} />
                <Text style={styles.memberBadgeText}> Movie Enthusiast</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              {loadingStats ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <View>
                  <Text style={styles.statValue}>{favoritesCount}</Text>
                  <Text style={styles.statLabel}>Favorites</Text>
                </View>
              )}
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              {loadingStats ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <View>
                  <Text style={styles.statValue}>{bookingsCount}</Text>
                  <Text style={styles.statLabel}>Bookings</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>My Account</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                <MaterialIcons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
              <View style={styles.menuArrow}>
                <MaterialIcons name="chevron-right" size={24} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['rgba(239,68,68,0.1)', 'rgba(239,68,68,0.05)']}
            style={styles.logoutGradient}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ONECINEHUB</Text>
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
  scrollContent: {
    paddingBottom: SIZES.tabBarHeight + SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  header: { 
    padding: SPACING.lg, 
    paddingTop: SPACING.md 
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  headerLogoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerLogoImage: {
    width: 36,
    height: 36,
  },
  logo: { 
    fontSize: FONTS.xxl, 
    fontWeight: '700', 
    color: COLORS.primary 
  },
  tagline: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.md, 
    marginTop: SPACING.xs 
  },
  profileCard: { 
    backgroundColor: COLORS.surface, 
    marginBottom: SPACING.lg, 
    borderRadius: RADIUS.xl, 
    padding: SPACING.xl, 
    overflow: 'hidden',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    ...SHADOWS.medium,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarWrapper: {
    marginRight: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: RADIUS.full, 
    backgroundColor: COLORS.surfaceLight, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  avatarText: { 
    color: COLORS.primary, 
    fontSize: 32, 
    fontWeight: '700' 
  },
  profileInfo: {
    flex: 1,
  },
  username: { 
    fontSize: FONTS.xxl, 
    fontWeight: '700', 
    color: COLORS.text, 
    marginBottom: SPACING.xs 
  },
  email: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.md,
    marginBottom: SPACING.sm,
  },
  memberBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  memberBadgeText: {
    color: COLORS.primary,
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLighter,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONTS.xxl,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.sm,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.surface,
  },
  menuContainer: { 
    marginBottom: SPACING.lg,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  sectionTitle: { 
    fontSize: FONTS.sm, 
    fontWeight: '700', 
    color: COLORS.textMuted, 
    marginBottom: SPACING.md, 
    textTransform: 'uppercase', 
    letterSpacing: 1 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.surface, 
    padding: SPACING.lg, 
    borderRadius: RADIUS.lg, 
    marginBottom: SPACING.md, 
    ...SHADOWS.small,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuIcon: { 
    fontSize: 22 
  },
  menuText: { 
    flex: 1, 
    color: COLORS.text, 
    fontSize: FONTS.lg,
    fontWeight: '500',
  },
  menuArrow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: { 
    color: COLORS.textMuted, 
    fontSize: 24, 
    fontWeight: '300' 
  },
  logoutBtn: { 
    marginTop: SPACING.sm, 
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  logoutText: { 
    color: COLORS.error, 
    fontSize: FONTS.lg, 
    fontWeight: '600' 
  },
  footer: { 
    alignItems: 'center', 
    marginTop: SPACING.xxxl, 
    marginBottom: SPACING.xl 
  },
  footerText: { 
    color: COLORS.primary, 
    fontSize: FONTS.lg, 
    fontWeight: '700',
    letterSpacing: 1,
  },
  version: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.sm, 
    marginTop: SPACING.sm 
  },
  copyright: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.xs, 
    marginTop: SPACING.xs 
  },
});
