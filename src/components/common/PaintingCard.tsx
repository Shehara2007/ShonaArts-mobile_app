import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Painting } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { lightTheme } from '../../theme';

interface PaintingCardProps {
  painting: Painting;
  onPress: () => void;
  onAddToWishlist?: () => void;
  isInWishlist?: boolean;
}

export const PaintingCard: React.FC<PaintingCardProps> = ({
  painting,
  onPress,
  onAddToWishlist,
  isInWishlist = false,
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 52) / 2;

  return (
    <TouchableOpacity style={[styles.card, { width: cardWidth }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.imageContainer, { height: cardWidth }]}>
        <Image source={{ uri: painting.image }} style={styles.image} />
        {onAddToWishlist && (
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={onAddToWishlist}
            activeOpacity={0.7}
            hitSlop={6}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={15}
              color={isInWishlist ? lightTheme.colors.error : lightTheme.colors.text}
            />
          </TouchableOpacity>
        )}
        {painting.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        {painting.stock === 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockOverlayText}>Out of Stock</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {painting.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          By {painting.artist}
        </Text>

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.price}>{formatCurrency(painting.price)}</Text>
          </View>
          <TouchableOpacity style={styles.viewButton} onPress={onPress} activeOpacity={0.8}>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: lightTheme.colors.surfaceAlt,
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(30, 27, 22, 0.7)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: lightTheme.borderRadius.round,
  },
  featuredText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: lightTheme.fonts.bodyBold,
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: lightTheme.colors.surface,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(30, 27, 22, 0.65)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  outOfStockOverlayText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: lightTheme.fonts.bodyBold,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.displaySemibold,
    color: lightTheme.colors.text,
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textSecondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textTertiary,
    marginBottom: 2,
  },
  price: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.accent,
  },
  viewButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: lightTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
