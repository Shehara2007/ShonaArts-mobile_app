import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header, LoadingSpinner, EmptyState, ErrorState, CategoryChip } from '../../components/common';
import { lightTheme } from '../../theme';
import { formatCurrency, formatDateTime, getOrderStatusColor } from '../../utils/helpers';
import { orderService } from '../../api/services';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Order } from '../../types';

type Props = NativeStackScreenProps<any, 'AdminOrders'>;

const STATUS_FILTERS: Array<'All' | Order['status']> = ['All', 'pending', 'delivered', 'cancelled'];
const NEXT_STATUSES: Order['status'][] = ['pending', 'delivered', 'cancelled'];

export const AdminOrdersScreen: React.FC<Props> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | Order['status']>('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setError(null);
      const response = await orderService.getAllForAdmin();
      if (response.success) {
        // Newest first
        setOrders([...response.data].reverse());
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleChangeStatus = (order: Order) => {
    const otherStatuses = NEXT_STATUSES.filter((s) => s !== order.status);
    Alert.alert(
      `Order #${order.id}`,
      'Update status to:',
      [
        ...otherStatuses.map((status) => ({
          text: status.charAt(0).toUpperCase() + status.slice(1),
          onPress: async () => {
            try {
              setUpdatingId(order.id);
              const response = await orderService.updateStatus(order.id, status);
              if (response.success) {
                setOrders((prev) =>
                  prev.map((o) => (o.id === order.id ? { ...o, status } : o))
                );
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update order status');
            } finally {
              setUpdatingId(null);
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDelete = (order: Order) => {
    Alert.alert(
      'Delete Order',
      `Delete order #${order.id}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdatingId(order.id);
              const response = await orderService.delete(order.id);
              if (response.success) {
                setOrders((prev) => prev.filter((o) => o.id !== order.id));
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete order');
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const filteredOrders =
    statusFilter === 'All' ? orders : orders.filter((o) => o.status === statusFilter);

  const renderItem = ({ item }: { item: Order }) => {
    const statusColor = getOrderStatusColor(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text style={styles.orderDate}>{formatDateTime(item.date)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#71717A" />
          <Text style={styles.detailText}>Customer #{item.userId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={16} color="#71717A" />
          <Text style={styles.detailText}>{item.items.length} item(s)</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#71717A" />
          <Text style={styles.detailText} numberOfLines={1}>{item.shippingAddress}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <Text style={styles.total}>{formatCurrency(item.total)}</Text>
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.statusButton]}
              onPress={() => handleChangeStatus(item)}
              disabled={updatingId === item.id}
            >
              <Ionicons name="sync-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Status</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
              disabled={updatingId === item.id}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Manage Orders" onBackPress={() => navigation.goBack()} />
        <ErrorState message={error} onRetry={loadOrders} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Manage Orders" onBackPress={() => navigation.goBack()} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {STATUS_FILTERS.map((status) => (
          <CategoryChip
            key={status}
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            selected={statusFilter === status}
            onPress={() => setStatusFilter(status)}
          />
        ))}
      </ScrollView>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No Orders Found"
          message={
            statusFilter === 'All'
              ? 'No orders have been placed yet'
              : `No ${statusFilter} orders`
          }
        />
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F1E7',
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: lightTheme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    ...lightTheme.shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 15,
    fontFamily: lightTheme.fonts.bodyBold,
    color: '#18181B',
  },
  orderDate: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: lightTheme.borderRadius.lg,
  },
  statusText: {
    fontSize: 11,
    fontFamily: lightTheme.fonts.bodyBold,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEDF5',
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#616161',
    marginLeft: 8,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    fontSize: 16,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.primary,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  statusButton: {
    backgroundColor: '#C0954C',
  },
  deleteButton: {
    backgroundColor: '#C0503F',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: lightTheme.fonts.bodySemibold,
  },
});
