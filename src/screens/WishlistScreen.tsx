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
import { PrimaryButton, LoadingSpinner, EmptyState } from '../components/common';
import { lightTheme } from '../theme';
import { formatCurrency } from '../utils/helpers';
import { wishlistService, cartService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import type { WishlistItem } from '../types';

export const WishlistScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.wishlist);
  
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const response = await wishlistService.getAll();
      if (response.success) {
        dispatch(setWishlist(response.data));
      }
    } catch (error) {
      console.error('Load wishlist error:', error);
    }
  };

  const handleRemoveFromWishlist = async (item: WishlistItem) => {
    Alert.alert(
      'Remove from Wishlist',
      `Remove ${item.painting.title} from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await wishlistService.remove(item.id);
              dispatch(removeFromWishlist(item.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove from wishlist');
            }
          },
        },
      ]
    );
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    if (item.painting.stock === 0) {
      Alert.alert('Out of Stock', 'This painting is currently out of stock');
      return;
    }

    setLoadingItems((prev) => new Set(prev).add(item.id));

    try {
      // Add to cart
      const cartResponse = await cartService.add(item.painting.id, 1);
      if (cartResponse.success) {
        dispatch(addToCart(cartResponse.data));
        
        // Remove from wishlist
        await wishlistService.remove(item.id);
        dispatch(removeFromWishlist(item.id));
        
        Alert.alert('Success', 'Moved to cart!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to move to cart');
    } finally {
      setLoadingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => {
    const isLoading = loadingItems.has(item.id);

    return (
      <View style={styles.wishlistItem}>
        <Image source={{ uri: item.painting.image }} style={styles.itemImage} />
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.painting.title}
          </Text>
          <Text style={styles.itemArtist}>{item.painting.artist}</Text>
          
          <View style={styles.itemFooter}>
            <Text style={styles.itemPrice}>{formatCurrency(item.painting.price)}</Text>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.rating}>{item.painting.rating}</Text>
            </View>
          </View>

          {item.painting.stock === 0 && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleMoveToCart(item)}
              disabled={isLoading || item.painting.stock === 0}
            >
              <Ionicons
                name="cart-outline"
                size={18}
                color={item.painting.stock === 0 ? '#BDBDBD' : lightTheme.colors.primary}
              />
              <Text
                style={[
                  styles.actionText,
                  item.painting.stock === 0 && styles.actionTextDisabled,
                ]}
              >
                {isLoading ? 'Moving...' : 'Move to Cart'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromWishlist(item)}
        >
          <Ionicons name="close-circle" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading wishlist..." />;
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="heart-outline"
          title="Your Wishlist is Empty"
          message="Add paintings you love to your wishlist"
          actionLabel="Browse Paintings"
          onAction={() => {}}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.itemCount}>{items.length} items</Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  itemCount: {
    fontSize: 14,
    color: '#757575',
  },
  listContent: {
    padding: 16,
  },
  wishlistItem: {
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
    height: 120,
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
    fontSize: 16,
    fontWeight: '700',
    color: lightTheme.colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 4,
  },
  outOfStockBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  outOfStockText: {
    fontSize: 11,
    color: '#C62828',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightTheme.colors.primary,
    marginLeft: 6,
  },
  actionTextDisabled: {
    color: '#BDBDBD',
  },
  removeButton: {
    padding: 4,
  },
});
