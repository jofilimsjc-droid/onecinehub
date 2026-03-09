import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api';
import { useToast } from '../context/ToastContext';
import type { RootStackParamList } from '../types/navigation';
import { COLORS, GRADIENTS, SHADOWS, SIZES } from '../theme';

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
          <Text style={styles.iconText}></Text>
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
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </View>
          </TouchableOpacity>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <LinearGradient
                colors={GRADIENTS.primary as any}
                style={styles.markAllButton}
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
              <Text style={styles.emptyEmoji}></Text>
            </LinearGradient>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>
              You're all caught up! Check back later for updates.
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
  header: { padding: 20, paddingBottom: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  backText: { color: COLORS.text, fontSize: 20, fontWeight: '600' },
  markAllButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  markAllText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.text },
  subtitle: { color: COLORS.textMuted, fontSize: 14, marginTop: 4 },
  list: { padding: 16, paddingTop: 8, paddingBottom: 100 },
  card: { 
    backgroundColor: COLORS.surface, 
    borderRadius: SIZES.radius, 
    padding: 16, 
    marginBottom: 12,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerUnread: {
    backgroundColor: COLORS.primary + '20',
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: { 
    flex: 1 
  },
  message: { 
    color: COLORS.textSecondary, 
    fontSize: 14, 
    lineHeight: 20,
    marginBottom: 8,
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceLighter,
    marginRight: 8,
  },
  statusDotUnread: {
    backgroundColor: COLORS.primary,
  },
  date: { 
    color: COLORS.textMuted, 
    fontSize: 12 
  },
  empty: { flex: 1, padding: 40, alignItems: 'center' },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...SHADOWS.medium },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
});

