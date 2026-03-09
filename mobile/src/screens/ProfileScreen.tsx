import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';
import { COLORS, GRADIENTS, SHADOWS, SIZES } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout, reload } = useAuth();
  const { showToast } = useToast();

  // Refresh user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

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
    { title: 'Notifications', screen: 'Notifications', color: COLORS.primary },
    { title: 'Booking History', screen: 'History', color: COLORS.gold },
    { title: 'Favorites', screen: 'Favorites', color: '#ef4444' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.logo}>ONECINEHUB</Text>
              <Text style={styles.tagline}>Your Profile</Text>
            </View>
          </View>
        </View>

        <View style={styles.profileCard}>
          <LinearGradient
            colors={GRADIENTS.primary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileGradient}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.username?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.avatarRing} />
            </View>
          </LinearGradient>
          
          <Text style={styles.username}>{user?.username || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statBadge, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.statLabel}>Movies</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statBadge, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statBadge, { backgroundColor: COLORS.gold }]} />
              <Text style={styles.statLabel}>Bookings</Text>
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
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
              <View style={styles.menuArrow}>
                <Text style={styles.arrowText}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LinearGradient
            colors={['rgba(239,68,68,0.1)', 'rgba(239,68,68,0.05)']}
            style={styles.logoutGradient}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ONECINEHUB</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© 2024 All rights reserved</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  logo: { fontSize: 24, fontWeight: '700', color: COLORS.primary },
  tagline: { color: COLORS.textMuted, fontSize: 14, marginTop: 4 },
  profileCard: { 
    backgroundColor: COLORS.surface, 
    marginHorizontal: 20, 
    marginBottom: 20, 
    borderRadius: SIZES.radiusLarge, 
    padding: 24, 
    alignItems: 'center',
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  profileGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: COLORS.surface, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.surface,
    ...SHADOWS.medium,
  },
  avatarRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarText: { 
    color: COLORS.primary, 
    fontSize: 32, 
    fontWeight: '700' 
  },
  username: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: COLORS.text, 
    marginBottom: 4 
  },
  email: { 
    color: COLORS.textMuted, 
    fontSize: 14,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLighter,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.surface,
  },
  menuContainer: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: COLORS.textMuted, 
    marginBottom: 12, 
    textTransform: 'uppercase', 
    letterSpacing: 1 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.surface, 
    padding: 16, 
    borderRadius: SIZES.radius, 
    marginBottom: 10, 
    ...SHADOWS.small,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIcon: { 
    fontSize: 20 
  },
  menuText: { 
    flex: 1, 
    color: COLORS.text, 
    fontSize: 16,
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
    marginHorizontal: 20, 
    marginTop: 8, 
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutText: { 
    color: COLORS.error, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  footer: { 
    alignItems: 'center', 
    marginTop: 30, 
    marginBottom: 40 
  },
  footerText: { 
    color: COLORS.primary, 
    fontSize: 16, 
    fontWeight: '700',
    letterSpacing: 1,
  },
  version: { 
    color: COLORS.textMuted, 
    fontSize: 12, 
    marginTop: 8 
  },
  copyright: { 
    color: COLORS.textMuted, 
    fontSize: 11, 
    marginTop: 4 
  },
});

