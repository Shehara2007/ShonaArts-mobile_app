import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header, LoadingSpinner, ErrorState } from '../../components/common';
import { lightTheme } from '../../theme';
import { formatCurrency, getOrderStatusColor } from '../../utils/helpers';
import { paintingService, orderService } from '../../api/services';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Order, Painting } from '../../types';

type Props = NativeStackScreenProps<any, 'AdminAnalytics'>;

const CATEGORY_COLORS = ['#C0954C', '#8C6A3F', '#5C7A52', '#B0562D', '#7A6A8C', '#3F5E7A'];

export const AdminAnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const [paintingsRes, ordersRes] = await Promise.all([
        paintingService.getAll(),
        orderService.getAllForAdmin(),
      ]);
      if (paintingsRes.success) setPaintings(paintingsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingSpinner message="Crunching numbers..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Analytics" onBackPress={() => navigation.goBack()} />
        <ErrorState message={error} onRetry={loadData} />
      </View>
    );
  }

  // Revenue only counts delivered orders (matches dashboard stat logic)
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length > 0
    ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length
    : 0;

  // Orders by status
  const statusCounts: Record<Order['status'], number> = {
    pending: 0,
    delivered: 0,
    cancelled: 0,
  };
  orders.forEach((o) => { statusCounts[o.status] += 1; });
  const maxStatusCount = Math.max(...Object.values(statusCounts), 1);

  // Paintings by category
  const categoryMap: Record<string, number> = {};
  paintings.forEach((p) => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  });
  const categoryEntries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = Math.max(...categoryEntries.map(([, c]) => c), 1);

  // Top-selling paintings by units sold across all orders
  const salesMap: Record<string, { title: string; units: number; revenue: number }> = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!salesMap[item.paintingId]) {
        salesMap[item.paintingId] = { title: item.title, units: 0, revenue: 0 };
      }
      salesMap[item.paintingId].units += item.quantity;
      salesMap[item.paintingId].revenue += item.price * item.quantity;
    });
  });
  const topSelling = Object.values(salesMap)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const lowStock = paintings
    .filter((p) => p.stock <= 3)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <Header title="Analytics" onBackPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: lightTheme.colors.primary }]}>
            <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)}</Text>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#5C7A52' }]}>
            <Text style={styles.summaryValue}>{formatCurrency(Math.round(avgOrderValue))}</Text>
            <Text style={styles.summaryLabel}>Avg. Order Value</Text>
          </View>
        </View>

        {/* Orders by status */}
        <Text style={styles.sectionTitle}>Orders by Status</Text>
        <View style={styles.panel}>
          {(Object.keys(statusCounts) as Order['status'][]).map((status) => {
            const count = statusCounts[status];
            const color = getOrderStatusColor(status);
            const widthPct = (count / maxStatusCount) * 100;
            return (
              <View key={status} style={styles.barRow}>
                <Text style={styles.barLabel}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[styles.barFill, { width: `${widthPct}%`, backgroundColor: color }]}
                  />
                </View>
                <Text style={styles.barValue}>{count}</Text>
              </View>
            );
          })}
        </View>

        {/* Paintings by category */}
        <Text style={styles.sectionTitle}>Catalogue by Category</Text>
        <View style={styles.panel}>
          {categoryEntries.length === 0 ? (
            <Text style={styles.emptyText}>No paintings yet</Text>
          ) : (
            categoryEntries.map(([category, count], index) => (
              <View key={category} style={styles.barRow}>
                <Text style={styles.barLabel} numberOfLines={1}>{category}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${(count / maxCategoryCount) * 100}%`,
                        backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>{count}</Text>
              </View>
            ))
          )}
        </View>

        {/* Top selling paintings */}
        <Text style={styles.sectionTitle}>Top Selling Paintings</Text>
        <View style={styles.panel}>
          {topSelling.length === 0 ? (
            <Text style={styles.emptyText}>No sales data yet</Text>
          ) : (
            topSelling.map((item, index) => (
              <View key={item.title + index} style={styles.listRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.listRowContent}>
                  <Text style={styles.listRowTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.listRowSubtitle}>{item.units} sold</Text>
                </View>
                <Text style={styles.listRowValue}>{formatCurrency(item.revenue)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Low stock alerts */}
        <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
        <View style={styles.panel}>
          {lowStock.length === 0 ? (
            <Text style={styles.emptyText}>All paintings are well stocked</Text>
          ) : (
            lowStock.map((p) => (
              <View key={p.id} style={styles.listRow}>
                <Ionicons name="warning" size={18} color={lightTheme.colors.warning} />
                <View style={styles.listRowContent}>
                  <Text style={styles.listRowTitle} numberOfLines={1}>{p.title}</Text>
                  <Text style={styles.listRowSubtitle}>{p.artist}</Text>
                </View>
                <Text
                  style={[
                    styles.listRowValue,
                    { color: p.stock === 0 ? '#C0503F' : lightTheme.colors.warning },
                  ]}
                >
                  {p.stock} left
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F1E7',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    ...lightTheme.shadows.medium,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: lightTheme.fonts.bodyBold,
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: lightTheme.fonts.bodyBold,
    color: '#18181B',
    marginBottom: 10,
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: lightTheme.borderRadius.lg,
    padding: 16,
    marginBottom: 24,
    ...lightTheme.shadows.small,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  barLabel: {
    width: 84,
    fontSize: 12,
    color: '#616161',
    fontFamily: lightTheme.fonts.bodySemibold,
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EEEDF5',
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  barValue: {
    width: 28,
    fontSize: 12,
    fontFamily: lightTheme.fonts.bodyBold,
    color: '#18181B',
    textAlign: 'right',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: lightTheme.borderRadius.lg,
    backgroundColor: `${lightTheme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.primary,
  },
  listRowContent: {
    flex: 1,
    marginLeft: 12,
  },
  listRowTitle: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: '#18181B',
  },
  listRowSubtitle: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 1,
  },
  listRowValue: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.primary,
  },
  emptyText: {
    fontSize: 13,
    color: '#A1A1AA',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
