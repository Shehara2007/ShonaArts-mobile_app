import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingSpinner } from '../components/common';
import { lightTheme } from '../theme';
import { formatCurrency } from '../utils/helpers';
import { dashboardService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import { clearAuthData } from '../utils/storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardStats } from '../types';

type Props = NativeStackScreenProps<any, 'AdminDashboard'>;

export const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Load stats error:', error);
      Alert.alert('Error', 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearAuthData();
            dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const menuItems: Array<{
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    color: string;
    onPress: () => void;
  }> = [
    {
      icon: 'color-palette',
      title: 'Manage Paintings',
      subtitle: 'Add, edit, or delete paintings',
      color: lightTheme.colors.primary,
      onPress: () => navigation.navigate('AdminPaintings'),
    },
    {
      icon: 'receipt',
      title: 'Manage Orders',
      subtitle: 'View and update order status',
      color: lightTheme.colors.secondary,
      onPress: () => navigation.navigate('AdminOrders'),
    },
    {
      icon: 'people',
      title: 'Manage Users',
      subtitle: 'View and manage user accounts',
      color: '#B0562D',
      onPress: () => navigation.navigate('AdminUsers'),
    },
    {
      icon: 'analytics',
      title: 'Analytics',
      subtitle: 'View detailed analytics',
      color: '#5C7A52',
      onPress: () => navigation.navigate('AdminAnalytics'),
    },
  ];

  if (loading && !stats) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
            <Text style={styles.headerTitle}>Hi, {user?.name?.split(' ')[0] ?? 'Admin'}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutIconButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <View style={styles.statIconWrap}>
              <Ionicons name="color-palette" size={20} color="#fff" />
            </View>
            <Text style={styles.statValue}>{stats?.totalPaintings || 0}</Text>
            <Text style={styles.statLabel}>Paintings</Text>
          </View>

          <View style={[styles.statCard, styles.statCardSecondary]}>
            <View style={styles.statIconWrap}>
              <Ionicons name="receipt" size={20} color="#fff" />
            </View>
            <Text style={styles.statValue}>{stats?.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardSuccess]}>
            <View style={styles.statIconWrap}>
              <Ionicons name="people" size={20} color="#fff" />
            </View>
            <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWarning]}>
            <View style={styles.statIconWrap}>
              <Ionicons name="cash" size={20} color="#fff" />
            </View>
            <Text style={styles.statValue}>
              {formatCurrency(stats?.revenue || 0).replace('LKR ', '')}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Management</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}18` }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={lightTheme.colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  header: {
    backgroundColor: lightTheme.colors.primary,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: lightTheme.borderRadius.xxl,
    borderBottomRightRadius: lightTheme.borderRadius.xxl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: lightTheme.borderRadius.round,
    gap: 5,
    marginBottom: 10,
  },
  adminBadgeText: {
    fontSize: 11,
    fontFamily: lightTheme.fonts.bodyBold,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: lightTheme.fonts.display,
    color: '#fff',
  },
  logoutIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    padding: 20,
    marginTop: -24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 18,
    borderRadius: lightTheme.borderRadius.lg,
    ...lightTheme.shadows.medium,
  },
  statCardPrimary: {
    backgroundColor: lightTheme.colors.primary,
  },
  statCardSecondary: {
    backgroundColor: lightTheme.colors.secondary,
  },
  statCardSuccess: {
    backgroundColor: '#5C7A52',
  },
  statCardWarning: {
    backgroundColor: '#C0954C',
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontFamily: lightTheme.fonts.bodyBold,
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: lightTheme.fonts.bodySemibold,
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.text,
    marginBottom: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.surface,
    padding: 16,
    borderRadius: lightTheme.borderRadius.lg,
    marginBottom: 12,
    ...lightTheme.shadows.small,
  },
  menuIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: lightTheme.colors.textSecondary,
  },
});
