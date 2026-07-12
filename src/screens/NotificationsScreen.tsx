import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, LoadingSpinner, EmptyState } from '../components/common';
import { lightTheme } from '../theme';
import { formatTimeAgo } from '../utils/helpers';
import { notificationService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  setNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
} from '../redux/slices/notificationSlice';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppNotification } from '../types';

type Props = NativeStackScreenProps<any, 'Notifications'>;

const ICONS: Record<AppNotification['type'], keyof typeof Ionicons.glyphMap> = {
  order: 'receipt-outline',
  promo: 'pricetag-outline',
  wishlist: 'heart-outline',
  system: 'information-circle-outline',
};

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.notification);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAll();
      if (res.success) dispatch(setNotifications(res.data));
    } catch (error) {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async (item: AppNotification) => {
    if (!item.read) {
      dispatch(markNotificationRead(item.id));
      try {
        await notificationService.markAsRead(item.id);
      } catch (error) {
        // ignore
      }
    }
  };

  const handleDelete = async (id: string) => {
    dispatch(removeNotification(id));
    try {
      await notificationService.delete(id);
    } catch (error) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    dispatch(markAllNotificationsRead());
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      // ignore
    }
  };

  const hasUnread = items.some((n) => !n.read);

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      activeOpacity={0.8}
      onPress={() => handlePress(item)}
    >
      <View style={[styles.iconWrap, !item.read && styles.iconWrapUnread]}>
        <Ionicons
          name={ICONS[item.type]}
          size={18}
          color={!item.read ? '#fff' : lightTheme.colors.textSecondary}
        />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          {!item.read && <View style={styles.dot} />}
        </View>
        <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.cardTime}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={styles.deleteButton}
        hitSlop={8}
      >
        <Ionicons name="close" size={16} color={lightTheme.colors.textTertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner message="Loading notifications..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          hasUnread ? (
            <TouchableOpacity onPress={handleMarkAllRead} hitSlop={8}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="No Notifications"
          message="You're all caught up. New updates will show here."
        />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  markAllText: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.accent,
  },
  listContent: {
    padding: 20,
    paddingTop: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  cardUnread: {
    borderColor: lightTheme.colors.accent,
    backgroundColor: lightTheme.colors.primaryLight,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lightTheme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconWrapUnread: {
    backgroundColor: lightTheme.colors.accent,
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.text,
    flexShrink: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: lightTheme.colors.accent,
  },
  cardMessage: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  cardTime: {
    fontSize: 11,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textTertiary,
    marginTop: 6,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 6,
  },
});
