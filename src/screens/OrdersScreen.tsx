import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner, EmptyState } from '../components/common';
import { lightTheme } from '../theme';
import { formatCurrency, formatDateTime, getOrderStatusColor } from '../utils/helpers';
import { orderService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setOrders } from '../redux/slices/orderSlice';
import type { Order } from '../types';

export const OrdersScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.order);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      if (response.success) {
        dispatch(setOrders(response.data));
      }
    } catch (error) {
      console.error('Load orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'ellipse';
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusColor = getOrderStatusColor(item.status);

    return (
      <TouchableOpacity style={styles.orderItem} activeOpacity={0.85}>
        <View style={styles.orderHeader}>
          <View style={styles.orderIconWrap}>
            <Ionicons name="receipt" size={18} color={lightTheme.colors.primary} />
          </View>
          <View style={styles.orderHeaderText}>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text style={styles.orderDate}>{formatDateTime(item.date)}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
            <Ionicons name={getStatusIcon(item.status)} size={13} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="cube-outline" size={15} color={lightTheme.colors.textSecondary} />
            <Text style={styles.detailText}>{item.items.length} items</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={15} color={lightTheme.colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.shippingAddress}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons
              name={item.paymentMethod === 'cod' ? 'cash-outline' : 'card-outline'}
              size={15}
              color={lightTheme.colors.textSecondary}
            />
            <Text style={styles.detailText}>
              {item.paymentMethod === 'cod' ? 'Cash on Delivery' : 'PayHere'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <EmptyState
          icon="receipt-outline"
          title="No Orders Yet"
          message="You haven't placed any orders yet"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{orders.length}</Text>
        </View>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: lightTheme.fonts.display,
    color: lightTheme.colors.text,
  },
  countBadge: {
    backgroundColor: lightTheme.colors.primaryLight,
    borderRadius: lightTheme.borderRadius.round,
    minWidth: 26,
    height: 26,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 12,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.primary,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 120,
  },
  orderItem: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    padding: 16,
    marginBottom: 14,
    ...lightTheme.shadows.small,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lightTheme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderHeaderText: {
    flex: 1,
  },
  orderId: {
    fontSize: 15,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.text,
  },
  orderDate: {
    fontSize: 12,
    color: lightTheme.colors.textSecondary,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: lightTheme.borderRadius.round,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: lightTheme.fonts.bodyBold,
  },
  divider: {
    height: 1,
    backgroundColor: lightTheme.colors.border,
    marginVertical: 12,
  },
  orderDetails: {
    gap: 9,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: lightTheme.colors.textSecondary,
    marginLeft: 10,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: lightTheme.colors.textSecondary,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.primary,
  },
});
