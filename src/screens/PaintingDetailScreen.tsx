import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
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
      } else {
        const response = await wishlistService.add(painting.id);
        if (response.success) {
          dispatch(addToWishlist(response.data));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    if (!painting) return;
    try {
      await Share.share({
        message: `Check out "${painting.title}" by ${painting.artist} on Shona Arts — ${formatCurrency(painting.price)}`,
      });
    } catch (error) {
      // user dismissed share sheet, nothing to do
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
          <TouchableOpacity onPress={handleShare} style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={18} color={lightTheme.colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: painting.image }} style={styles.image} />
          <TouchableOpacity
            onPress={handleWishlistToggle}
            style={styles.wishlistButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={18}
              color={isInWishlist ? lightTheme.colors.error : lightTheme.colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{painting.title}</Text>
          <View style={styles.artistRow}>
            <View style={styles.artistAvatar}>
              <Text style={styles.artistAvatarText}>{painting.artist.charAt(0)}</Text>
            </View>
            <Text style={styles.artist}>By {painting.artist}</Text>
            <View style={styles.categoryChip}>
              <Text style={styles.category}>{painting.category}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.infoLabel}>Price</Text>
                <Text style={styles.priceValue}>{formatCurrency(painting.price)}</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoLabel}>Availability</Text>
                <View style={styles.stockRow}>
                  <Ionicons
                    name={painting.stock > 0 ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={painting.stock > 0 ? lightTheme.colors.success : lightTheme.colors.error}
                  />
                  <Text style={[styles.stockText, { color: painting.stock > 0 ? lightTheme.colors.success : lightTheme.colors.error }]}>
                    {painting.stock > 0 ? `${painting.stock} in stock` : 'Out of stock'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Quantity</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
                  onPress={decrementQuantity}
                  disabled={quantity === 1}
                >
                  <Ionicons name="remove" size={16} color={quantity === 1 ? lightTheme.colors.textTertiary : '#fff'} />
                </TouchableOpacity>
                <View style={styles.quantityValueBox}>
                  <Text style={styles.quantityText}>{quantity}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.quantityButton, quantity >= painting.stock && styles.quantityButtonDisabled]}
                  onPress={incrementQuantity}
                  disabled={quantity >= painting.stock}
                >
                  <Ionicons name="add" size={16} color={quantity >= painting.stock ? lightTheme.colors.textTertiary : '#fff'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={15} color={lightTheme.colors.accent} />
            <Text style={styles.ratingText}>{painting.rating} rating</Text>
            {painting.featured && (
              <View style={styles.featuredTag}>
                <Ionicons name="sparkles" size={11} color={lightTheme.colors.accent} />
                <Text style={styles.featuredTagText}>Featured Piece</Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{painting.description}</Text>
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
          icon={<Ionicons name="cart" size={17} color="#fff" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  content: {
    flex: 1,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: lightTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...lightTheme.shadows.small,
  },
  imageWrap: {
    position: 'relative',
    marginHorizontal: 20,
  },
  image: {
    width: '100%',
    height: 320,
    borderRadius: lightTheme.borderRadius.xl,
    backgroundColor: lightTheme.colors.surfaceAlt,
  },
  wishlistButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: lightTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: lightTheme.fonts.display,
    color: lightTheme.colors.text,
    marginBottom: 12,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  artistAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: lightTheme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistAvatarText: {
    fontSize: 12,
    fontFamily: lightTheme.fonts.bodyBold,
    color: '#fff',
  },
  artist: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodyMedium,
    color: lightTheme.colors.textSecondary,
    flex: 1,
  },
  categoryChip: {
    backgroundColor: lightTheme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: lightTheme.borderRadius.round,
  },
  category: {
    fontSize: 11,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.text,
  },
  infoCard: {
    backgroundColor: lightTheme.colors.primary,
    borderRadius: lightTheme.borderRadius.lg,
    padding: 18,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRight: {
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: lightTheme.fonts.body,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontFamily: lightTheme.fonts.display,
    color: lightTheme.colors.accent,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodySemibold,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: lightTheme.borderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  quantityValueBox: {
    width: 32,
    height: 32,
    borderRadius: lightTheme.borderRadius.sm,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodyMedium,
    color: lightTheme.colors.textSecondary,
    marginRight: 8,
  },
  featuredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: lightTheme.colors.warningLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: lightTheme.borderRadius.round,
  },
  featuredTagText: {
    fontSize: 11,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.accentDark,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: lightTheme.fonts.displaySemibold,
    color: lightTheme.colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: lightTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: lightTheme.colors.border,
  },
  totalContainer: {
    marginRight: 16,
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textSecondary,
  },
  totalPrice: {
    fontSize: 18,
    fontFamily: lightTheme.fonts.displaySemibold,
    color: lightTheme.colors.text,
  },
  addButton: {
    flex: 1,
    marginTop: 0,
  },
});
