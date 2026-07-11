import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, LoadingSpinner, EmptyState } from '../components/common';
import { lightTheme } from '../theme';
import { formatCurrency } from '../utils/helpers';
import { cartService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  setCart,
  updateCartItemQuantity,
  removeFromCart,
  selectCartTotal,
} from '../redux/slices/cartSlice';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CartItem } from '../types';

type Props = NativeStackScreenProps<any, 'Cart'>;

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const total = useAppSelector(selectCartTotal);

  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getAll();
      if (response.success) {
        dispatch(setCart(response.data));
      }
    } catch (error) {
      console.error('Load cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.painting.stock) return;

    setUpdatingItems((prev) => new Set(prev).add(item.id));

    try {
      const response = await cartService.updateQuantity(item.id, newQuantity);
      if (response.success) {
        dispatch(updateCartItemQuantity({ id: item.id, quantity: newQuantity }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (item: CartItem) => {
    Alert.alert(
      'Remove Item',
      `Remove ${item.painting.title} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await cartService.remove(item.id);
              dispatch(removeFromCart(item.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }
    navigation.navigate('Checkout');
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const isUpdating = updatingItems.has(item.id);
    const itemTotal = item.painting.price * item.quantity;

    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.painting.image }} style={styles.itemImage} />

        <View style={styles.itemDetails}>
          <View style={styles.itemTop}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.painting.title}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveItem(item)}
              hitSlop={6}
            >
              <Ionicons name="close" size={16} color={lightTheme.colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.itemArtist}>{item.painting.artist}</Text>

          <View style={styles.itemFooter}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, item.quantity === 1 && styles.quantityButtonDisabled]}
                onPress={() => handleUpdateQuantity(item, item.quantity - 1)}
                disabled={isUpdating || item.quantity === 1}
              >
                <Ionicons name="remove" size={14} color={item.quantity === 1 ? lightTheme.colors.textTertiary : lightTheme.colors.text} />
              </TouchableOpacity>

              <Text style={styles.quantityText}>{item.quantity}</Text>

              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  item.quantity >= item.painting.stock && styles.quantityButtonDisabled,
                ]}
                onPress={() => handleUpdateQuantity(item, item.quantity + 1)}
                disabled={isUpdating || item.quantity >= item.painting.stock}
              >
                <Ionicons
                  name="add"
                  size={14}
                  color={item.quantity >= item.painting.stock ? lightTheme.colors.textTertiary : lightTheme.colors.text}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.itemTotal}>{formatCurrency(itemTotal)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading cart..." />;
  }

  return (
    <View style={styles.container}>
      <Header title="Shopping Cart" onBackPress={() => navigation.goBack()} />

      {items.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="Your Cart is Empty"
          message="Add some paintings to your cart to get started"
          actionLabel="Browse Paintings"
          onAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        />
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryFree}>Free</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>

            <PrimaryButton
              title={`Proceed to Checkout (${items.length})`}
              onPress={handleCheckout}
              style={styles.checkoutButton}
              icon={<Ionicons name="arrow-forward-circle" size={18} color="#fff" />}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  listContent: {
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    padding: 12,
    marginBottom: 14,
    ...lightTheme.shadows.small,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: lightTheme.borderRadius.md,
    backgroundColor: lightTheme.colors.surfaceAlt,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.text,
    marginRight: 8,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: lightTheme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemArtist: {
    fontSize: 12,
    color: lightTheme.colors.textSecondary,
    marginTop: 2,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.surfaceAlt,
    borderRadius: lightTheme.borderRadius.round,
    padding: 3,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: lightTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: 'transparent',
  },
  quantityText: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.text,
    marginHorizontal: 12,
    minWidth: 14,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 15,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.primary,
  },
  footer: {
    padding: 20,
    paddingBottom: 28,
    backgroundColor: lightTheme.colors.surface,
    borderTopLeftRadius: lightTheme.borderRadius.xl,
    borderTopRightRadius: lightTheme.borderRadius.xl,
    ...lightTheme.shadows.medium,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.text,
  },
  summaryFree: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: lightTheme.colors.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.primary,
  },
  checkoutButton: {
    marginTop: 16,
  },
});
