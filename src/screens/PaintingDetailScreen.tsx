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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, LoadingSpinner, ErrorState } from '../components/common';
import { lightTheme } from '../theme';
import { formatCurrency, formatDate } from '../utils/helpers';
import { paintingService, cartService, wishlistService, reviewService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Painting, Review } from '../types';

type Props = NativeStackScreenProps<any, 'PaintingDetail'>;

export const PaintingDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { paintingId } = route.params as { paintingId: string };
  const dispatch = useAppDispatch();
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const { user } = useAppSelector((state) => state.auth);

  const [painting, setPainting] = useState<Painting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const myReview = reviews.find((r) => r.userId === user?.id);

  const isInWishlist = wishlistItems.some((item) => item.painting.id === paintingId);

  useEffect(() => {
    loadPainting();
    loadReviews();
  }, [paintingId]);

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await reviewService.getForPainting(paintingId);
      if (res.success) setReviews(res.data);
    } catch (error) {
      // ignore
    } finally {
      setLoadingReviews(false);
    }
  };

  const openReviewForm = (existing?: Review) => {
    if (existing) {
      setEditingReviewId(existing.id);
      setReviewRating(existing.rating);
      setReviewComment(existing.comment);
    } else {
      setEditingReviewId(null);
      setReviewRating(5);
      setReviewComment('');
    }
    setShowReviewForm(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      Alert.alert('Missing Review', 'Please write a comment for your review');
      return;
    }

    setSubmittingReview(true);
    try {
      if (editingReviewId) {
        const res = await reviewService.update(editingReviewId, {
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
        if (res.success) {
          setReviews((prev) => prev.map((r) => (r.id === editingReviewId ? res.data : r)));
        }
      } else {
        const res = await reviewService.add(paintingId, reviewRating, reviewComment.trim());
        if (res.success) {
          setReviews((prev) => [res.data, ...prev]);
        }
      }
      setShowReviewForm(false);
      loadPainting();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = (review: Review) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete your review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await reviewService.delete(review.id);
            setReviews((prev) => prev.filter((r) => r.id !== review.id));
            loadPainting();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete review');
          }
        },
      },
    ]);
  };

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

          <View style={styles.reviewsHeaderRow}>
            <Text style={styles.sectionTitle}>
              Reviews {reviews.length > 0 ? `(${reviews.length})` : ''}
            </Text>
            {!myReview && !showReviewForm && (
              <TouchableOpacity onPress={() => openReviewForm()} activeOpacity={0.7}>
                <Text style={styles.writeReviewLink}>Write a Review</Text>
              </TouchableOpacity>
            )}
          </View>

          {showReviewForm && (
            <View style={styles.reviewForm}>
              <Text style={styles.reviewFormLabel}>Your Rating</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity key={n} onPress={() => setReviewRating(n)} hitSlop={4}>
                    <Ionicons
                      name={n <= reviewRating ? 'star' : 'star-outline'}
                      size={26}
                      color={lightTheme.colors.accent}
                      style={{ marginRight: 6 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.reviewFormLabel}>Your Review</Text>
              <TextInput
                style={styles.reviewInput}
                value={reviewComment}
                onChangeText={setReviewComment}
                placeholder="Share your thoughts about this painting..."
                placeholderTextColor={lightTheme.colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.reviewFormActions}>
                <TouchableOpacity
                  style={styles.reviewCancelButton}
                  onPress={() => setShowReviewForm(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reviewCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.reviewSubmitButton}
                  onPress={handleSubmitReview}
                  disabled={submittingReview}
                  activeOpacity={0.85}
                >
                  <Text style={styles.reviewSubmitText}>
                    {submittingReview ? 'Saving...' : editingReviewId ? 'Update Review' : 'Submit Review'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {loadingReviews ? (
            <Text style={styles.reviewsLoadingText}>Loading reviews...</Text>
          ) : reviews.length === 0 ? (
            !showReviewForm && (
              <Text style={styles.noReviewsText}>
                No reviews yet. Be the first to share your thoughts.
              </Text>
            )
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewCardHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>{review.userName.charAt(0)}</Text>
                    </View>
                    <View style={styles.reviewCardHeaderText}>
                      <Text style={styles.reviewerName}>{review.userName}</Text>
                      <View style={styles.reviewStarsRow}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Ionicons
                            key={n}
                            name={n <= review.rating ? 'star' : 'star-outline'}
                            size={12}
                            color={lightTheme.colors.accent}
                          />
                        ))}
                        <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                      </View>
                    </View>
                    {review.userId === user?.id && (
                      <View style={styles.reviewOwnerActions}>
                        <TouchableOpacity onPress={() => openReviewForm(review)} hitSlop={6}>
                          <Ionicons name="pencil-outline" size={16} color={lightTheme.colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteReview(review)} hitSlop={6}>
                          <Ionicons name="trash-outline" size={16} color={lightTheme.colors.error} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))}
            </View>
          )}
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
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  writeReviewLink: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.accent,
  },
  reviewForm: {
    backgroundColor: lightTheme.colors.surfaceAlt,
    borderRadius: lightTheme.borderRadius.md,
    padding: 14,
    marginBottom: 16,
  },
  reviewFormLabel: {
    fontSize: 12,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.textSecondary,
    marginBottom: 8,
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  reviewInput: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    padding: 12,
    fontSize: 13,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.text,
    minHeight: 90,
    marginBottom: 12,
  },
  reviewFormActions: {
    flexDirection: 'row',
    gap: 10,
  },
  reviewCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: lightTheme.borderRadius.sm,
    alignItems: 'center',
    backgroundColor: lightTheme.colors.surface,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  reviewCancelText: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.textSecondary,
  },
  reviewSubmitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: lightTheme.borderRadius.sm,
    alignItems: 'center',
    backgroundColor: lightTheme.colors.primary,
  },
  reviewSubmitText: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: '#fff',
  },
  reviewsLoadingText: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textTertiary,
    marginBottom: 20,
  },
  noReviewsText: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textTertiary,
    marginBottom: 20,
  },
  reviewsList: {
    marginBottom: 12,
  },
  reviewCard: {
    borderTopWidth: 1,
    borderTopColor: lightTheme.colors.border,
    paddingVertical: 14,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: lightTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewAvatarText: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodyBold,
    color: '#fff',
  },
  reviewCardHeaderText: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.text,
    marginBottom: 3,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textTertiary,
    marginLeft: 6,
  },
  reviewOwnerActions: {
    flexDirection: 'row',
    gap: 14,
  },
  reviewComment: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textSecondary,
    lineHeight: 19,
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
