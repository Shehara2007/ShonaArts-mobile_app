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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner, EmptyState } from '../components/common';
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
      const cartResponse = await cartService.add(item.painting.id, 1);
      if (cartResponse.success) {
        dispatch(addToCart(cartResponse.data));
        await wishlistService.remove(item.id);
        dispatch(removeFromWishlist(item.id));
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
          <View style={styles.itemTop}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.painting.title}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFromWishlist(item)}
              hitSlop={6}
            >
              <Ionicons name="close" size={16} color={lightTheme.colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.itemArtist}>{item.painting.artist}</Text>

          <View style={styles.itemFooter}>
            <Text style={styles.itemPrice}>{formatCurrency(item.painting.price)}</Text>

            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#C0954C" />
              <Text style={styles.rating}>{item.painting.rating}</Text>
            </View>
          </View>

          {item.painting.stock === 0 && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.moveButton, item.painting.stock === 0 && styles.moveButtonDisabled]}
            onPress={() => handleMoveToCart(item)}
            disabled={isLoading || item.painting.stock === 0}
            activeOpacity={0.8}
          >
            <Ionicons
              name="cart-outline"
              size={15}
              color={item.painting.stock === 0 ? lightTheme.colors.textTertiary : '#fff'}
            />
            <Text
              style={[
                styles.moveButtonText,
                item.painting.stock === 0 && styles.moveButtonTextDisabled,
              ]}
            >
              {isLoading ? 'Moving...' : 'Move to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading wishlist..." />;
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Wishlist</Text>
        </View>
        <EmptyState
          icon="heart-outline"
          title="Your Wishlist is Empty"
          message="Add paintings you love to your wishlist"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{items.length}</Text>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  wishlistItem: {
    flexDirection: 'row',
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    padding: 12,
    marginBottom: 14,
    ...lightTheme.shadows.small,
  },
  itemImage: {
    width: 96,
    height: 120,
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
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: lightTheme.borderRadius.round,
  },
  rating: {
    fontSize: 11,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.text,
    marginLeft: 3,
  },
  outOfStockBadge: {
    backgroundColor: lightTheme.colors.errorLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: lightTheme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  outOfStockText: {
    fontSize: 10,
    color: lightTheme.colors.error,
    fontFamily: lightTheme.fonts.bodyBold,
  },
  moveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTheme.colors.primary,
    paddingVertical: 9,
    borderRadius: lightTheme.borderRadius.round,
    marginTop: 10,
    gap: 6,
  },
  moveButtonDisabled: {
    backgroundColor: lightTheme.colors.surfaceAlt,
  },
  moveButtonText: {
    fontSize: 12,
    fontFamily: lightTheme.fonts.bodyBold,
    color: '#fff',
  },
  moveButtonTextDisabled: {
    color: lightTheme.colors.textTertiary,
  },
});
