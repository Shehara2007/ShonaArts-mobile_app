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
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.painting.title}
          </Text>
          <Text style={styles.itemArtist}>{item.painting.artist}</Text>
          
          <View style={styles.itemFooter}>
            <Text style={styles.itemPrice}>{formatCurrency(item.painting.price)}</Text>
            
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, item.quantity === 1 && styles.quantityButtonDisabled]}
                onPress={() => handleUpdateQuantity(item, item.quantity - 1)}
                disabled={isUpdating || item.quantity === 1}
              >
                <Ionicons name="remove" size={16} color={item.quantity === 1 ? '#BDBDBD' : '#212121'} />
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
                  size={16}
                  color={item.quantity >= item.painting.stock ? '#BDBDBD' : '#212121'}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.itemTotal}>{formatCurrency(itemTotal)}</Text>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
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
              <Text style={styles.summaryValue}>Free</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>

            <PrimaryButton
              title={`Proceed to Checkout (${items.length} items)`}
              onPress={handleCheckout}
              style={styles.checkoutButton}
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
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    ...lightTheme.shadows.small,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  itemArtist: {
    fontSize: 13,
    color: '#757575',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: '#757575',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#FAFAFA',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: lightTheme.colors.primary,
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#757575',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: lightTheme.colors.primary,
  },
  checkoutButton: {
    marginTop: 16,
  },
});
