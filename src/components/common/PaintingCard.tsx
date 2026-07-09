import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
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

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export const PaintingCard: React.FC<PaintingCardProps> = ({
  painting,
  onPress,
  onAddToWishlist,
  isInWishlist = false,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: painting.image }} style={styles.image} />
        {painting.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        {onAddToWishlist && (
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={onAddToWishlist}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={20}
              color={isInWishlist ? '#E91E63' : '#fff'}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {painting.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {painting.artist}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>{formatCurrency(painting.price)}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>{painting.rating}</Text>
          </View>
        </View>
        
        {painting.stock === 0 && (
          <View style={styles.outOfStock}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    ...lightTheme.shadows.medium,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: cardWidth,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: lightTheme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  artist: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: lightTheme.colors.primary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#212121',
    marginLeft: 4,
    fontWeight: '600',
  },
  outOfStock: {
    marginTop: 8,
    backgroundColor: '#FFEBEE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  outOfStockText: {
    fontSize: 10,
    color: '#C62828',
    fontWeight: '600',
  },
});
