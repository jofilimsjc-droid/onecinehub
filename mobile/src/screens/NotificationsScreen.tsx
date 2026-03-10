import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api';
import { useToast } from '../context/ToastContext';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, GRADIENTS, SHADOWS, SIZES, FONTS, RADIUS, SPACING } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

type Notification = {
  id: number;
  message: string;
  is_read: 0 | 1;
  created_at: string;
};

export default function NotificationsScreen({ navigation }: Props) {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }
    try {
      const res = await getNotifications();
      if (res.ok && Array.isArray(res.data)) {
        setNotifications(res.data as Notification[]);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications(true);
    }, [])
  );

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const res = await markNotificationRead(notificationId);
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: 1 as const } : n)
        );
      }
    } catch {
      showToast('Failed to mark notification as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllNotificationsRead();
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 as const })));
        showToast('All notifications marked as read', 'success');
      }
    } catch {
      showToast('Failed to mark all notifications as read', 'error');
    }
  };

  const unreadCount = notifications.filter(n => n.is_read === 0).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('booking') || lowerMessage.includes('ticket')) return 'confirmation-number';
    if (lowerMessage.includes('favorite') || lowerMessage.includes('heart')) return 'favorite';
    if (lowerMessage.includes('movie') || lowerMessage.includes('film')) return 'movie';
    if (lowerMessage.includes('offer') || lowerMessage.includes('discount')) return 'card-giftcard';
    if (lowerMessage.includes('account') || lowerMessage.includes('profile')) return 'person';
    return 'notifications';
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.card,
        item.is_read === 0 && styles.cardUnread
      ]}
      onPress={() => {
        if (item.is_read === 0) {
          handleMarkAsRead(item.id);
        }
      }}
      activeOpacity={0.7}
    >
      {item.is_read === 0 && (
        <LinearGradient
          colors={GRADIENTS.primary as any}
          style={styles.cardGradient}
        />
      )}
      <View style={styles.cardContent}>
        <View style={[
          styles.iconContainer,
          item.is_read === 0 && styles.iconContainerUnread
        ]}>
          <MaterialIcons name={getNotificationIcon(item.message) as any} size={24} color={item.is_read === 0 ? COLORS.primary : COLORS.textSecondary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.message,
            item.is_read === 0 && styles.messageUnread
          ]}>
            {item.message}
          </Text>
          <View style={styles.dateRow}>
            <View style={[
              styles.statusDot,
              item.is_read === 0 && styles.statusDotUnread
            ]} />
            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingLogo}>
            <MaterialIcons name="notifications" size={48} color={COLORS.primary} />
          </View>
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={GRADIENTS.primary as any}
                style={styles.markAllGradient}
              >
                <Text style={styles.markAllText}>Mark all read</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title}>Notifications</Text>
        {notifications.length > 0 && (
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </Text>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadNotifications(true);
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
              <MaterialIcons name="notifications" size={56} color={COLORS.primary} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>
              You're all caught up! Check back later for updates.
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
    paddingBottom: SPACING.sm,
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.md 
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  backText: { 
    color: COLORS.text, 
    fontSize: 20, 
    fontWeight: '600' 
  },
  markAllButton: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  markAllGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  markAllText: { 
    color: COLORS.text, 
    fontSize: FONTS.sm, 
    fontWeight: '600' 
  },
  title: { 
    fontSize: FONTS.xxl, 
    fontWeight: '700', 
    color: COLORS.text 
  },
  subtitle: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.md, 
    marginTop: SPACING.xs 
  },
  list: { 
    padding: SPACING.lg, 
    paddingTop: SPACING.sm, 
    paddingBottom: SPACING.xxxl 
  },
  card: { 
    backgroundColor: COLORS.surface, 
    borderRadius: RADIUS.lg, 
    padding: SPACING.lg, 
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  cardUnread: {},
  cardGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: { 
    flexDirection: 'row', 
    alignItems: 'flex-start' 
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconContainerUnread: {
    backgroundColor: COLORS.primary + '20',
  },
  iconText: {
    fontSize: 24,
  },
  textContainer: { 
    flex: 1 
  },
  message: { 
    color: COLORS.textSecondary, 
    fontSize: FONTS.md, 
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  messageUnread: { 
    color: COLORS.text,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLighter,
    marginRight: SPACING.sm,
  },
  statusDotUnread: {
    backgroundColor: COLORS.primary,
  },
  date: { 
    color: COLORS.textMuted, 
    fontSize: FONTS.sm 
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

