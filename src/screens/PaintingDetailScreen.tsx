import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, LoadingSpinner, ErrorState } from '../components/common';
import { lightTheme } from '../theme';
import { formatCurrency } from '../utils/helpers';
import { paintingService, cartService, wishlistService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Painting } from '../types';

type Props = NativeStackScreenProps<any, 'PaintingDetail'>;

export const PaintingDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { paintingId } = route.params as { paintingId: string };
  const dispatch = useAppDispatch();
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  
  const [painting, setPainting] = useState<Painting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const isInWishlist = wishlistItems.some((item) => item.painting.id === paintingId);

  useEffect(() => {
    loadPainting();
  }, [paintingId]);

  const loadPainting = async () => {
    try {
      setLoading(true);
      const response = await paintingService.getById(paintingId);
      if (response.success) {
        setPainting(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load painting');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!painting) return;

    if (painting.stock === 0) {
      Alert.alert('Out of Stock', 'This painting is currently out of stock');
      return;
    }

    if (quantity > painting.stock) {
      Alert.alert('Error', `Only ${painting.stock} items available in stock`);
      return;
    }

    setAddingToCart(true);
    try {
      const response = await cartService.add(painting.id, quantity);
      if (response.success) {
        dispatch(addToCart(response.data));
        Alert.alert('Success', 'Added to cart!', [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!painting) return;

    const existingItem = wishlistItems.find((item) => item.painting.id === painting.id);

    try {
      if (existingItem) {
        await wishlistService.remove(existingItem.id);
        dispatch(removeFromWishlist(existingItem.id));
        Alert.alert('Removed', 'Removed from wishlist');
      } else {
        const response = await wishlistService.add(painting.id);
        if (response.success) {
          dispatch(addToWishlist(response.data));
          Alert.alert('Added', 'Added to wishlist');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const incrementQuantity = () => {
    if (painting && quantity < painting.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading painting details..." />;
  }

  if (error || !painting) {
    return (
      <View style={styles.container}>
        <Header title="Painting Detail" onBackPress={() => navigation.goBack()} />
        <ErrorState message={error || 'Painting not found'} onRetry={loadPainting} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Painting Detail"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={handleWishlistToggle} style={styles.wishlistButton}>
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={24}
              color={isInWishlist ? '#E91E63' : '#fff'}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: painting.image }} style={styles.image} />

        {painting.featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={16} color="#fff" />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}

        <View style={styles.detailsContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>{painting.title}</Text>
              <Text style={styles.artist}>by {painting.artist}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFB800" />
              <Text style={styles.rating}>{painting.rating}</Text>
            </View>
          </View>

          <View style={styles.categoryContainer}>
            <Ionicons name="color-filter" size={16} color={lightTheme.colors.primary} />
            <Text style={styles.category}>{painting.category}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(painting.price)}</Text>
            <View style={styles.stockContainer}>
              {painting.stock > 0 ? (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  <Text style={styles.inStock}>{painting.stock} in stock</Text>
                </>
              ) : (
                <>
                  <Ionicons name="close-circle" size={18} color="#F44336" />
                  <Text style={styles.outOfStock}>Out of Stock</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{painting.description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
              onPress={decrementQuantity}
              disabled={quantity === 1}
            >
              <Ionicons name="remove" size={20} color={quantity === 1 ? '#BDBDBD' : '#212121'} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity >= painting.stock && styles.quantityButtonDisabled,
              ]}
              onPress={incrementQuantity}
              disabled={quantity >= painting.stock}
            >
              <Ionicons
                name="add"
                size={20}
                color={quantity >= painting.stock ? '#BDBDBD' : '#212121'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            {formatCurrency(painting.price * quantity)}
          </Text>
        </View>
        <PrimaryButton
          title={painting.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          onPress={handleAddToCart}
          loading={addingToCart}
          disabled={painting.stock === 0}
          style={styles.addButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 400,
    backgroundColor: '#F5F5F5',
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  featuredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  wishlistButton: {
    padding: 4,
  },
  detailsContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    color: '#757575',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  category: {
    fontSize: 14,
    color: lightTheme.colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: lightTheme.colors.primary,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inStock: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 6,
  },
  outOfStock: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#616161',
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#FAFAFA',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#757575',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  addButton: {
    marginTop: 0,
  },
});
