import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  SearchBar,
  PaintingCard,
  CategoryChip,
  LoadingSpinner,
  ErrorState,
  EmptyState,
} from '../components/common';
import { lightTheme } from '../theme';
import { CATEGORIES } from '../constants';
import { paintingService, wishlistService, notificationService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  setPaintings,
  setFilters,
  setLoading,
  setError,
} from '../redux/slices/paintingSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { selectCartItemCount } from '../redux/slices/cartSlice';
import { setNotifications, selectUnreadNotificationCount } from '../redux/slices/notificationSlice';
import { formatCurrency, debounce } from '../utils/helpers';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { paintings, filters, loading, error } = useAppSelector(
    (state) => state.painting
  );
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const cartCount = useAppSelector(selectCartItemCount);
  const unreadCount = useAppSelector(selectUnreadNotificationCount);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    loadPaintings();
  }, [filters]);

  useEffect(() => {
    notificationService
      .getAll()
      .then((res) => {
        if (res.success) dispatch(setNotifications(res.data));
      })
      .catch(() => {});
  }, []);

  const loadPaintings = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await paintingService.getAll(filters);
      if (response.success) {
        dispatch(setPaintings(response.data));
      }
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to load paintings'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPaintings();
    setRefreshing(false);
  }, [filters]);

  const handleSearch = debounce((text: string) => {
    dispatch(setFilters({ search: text }));
  }, 500);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    dispatch(setFilters({ category: category === 'All' ? undefined : category }));
  };

  const handlePaintingPress = (paintingId: string) => {
    navigation.navigate('PaintingDetail', { paintingId });
  };

  const handleWishlistToggle = async (paintingId: string) => {
    const existingItem = wishlistItems.find(
      (item) => item.painting.id === paintingId
    );

    try {
      if (existingItem) {
        await wishlistService.remove(existingItem.id);
        dispatch(removeFromWishlist(existingItem.id));
      } else {
        const response = await wishlistService.add(paintingId);
        if (response.success) {
          dispatch(addToWishlist(response.data));
        }
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
    }
  };

  const featured = paintings.find((p) => p.featured) ?? paintings[0];

  const renderHeader = () => (
    <>
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <Ionicons name="sparkles" size={16} color={lightTheme.colors.accent} />
          <Text style={styles.brandText}>Shona Arts</Text>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={18} color={lightTheme.colors.text} />
            {unreadCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={19} color={lightTheme.colors.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <SearchBar
        value={filters.search || ''}
        onChangeText={handleSearch}
        placeholder="Search paintings, artists..."
      />

      {featured && !filters.search && selectedCategory === 'All' && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Piece</Text>
          </View>
          <TouchableOpacity
            style={styles.featuredCard}
            activeOpacity={0.9}
            onPress={() => handlePaintingPress(featured.id)}
          >
            <Image source={{ uri: featured.image }} style={styles.featuredImage} />
            <TouchableOpacity
              style={styles.featuredHeart}
              onPress={() => handleWishlistToggle(featured.id)}
              hitSlop={8}
            >
              <Ionicons
                name={wishlistItems.some((w) => w.painting.id === featured.id) ? 'heart' : 'heart-outline'}
                size={17}
                color={wishlistItems.some((w) => w.painting.id === featured.id) ? lightTheme.colors.error : '#fff'}
              />
            </TouchableOpacity>
            <View style={styles.featuredCategoryPill}>
              <Text style={styles.featuredCategoryText}>{featured.category}</Text>
            </View>
            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredTitle} numberOfLines={1}>{featured.title}</Text>
              <View style={styles.featuredMetaRow}>
                <View style={styles.featuredPriceWrap}>
                  <Ionicons name="pricetag" size={12} color={lightTheme.colors.accent} />
                  <Text style={styles.featuredPrice}>{formatCurrency(featured.price)}</Text>
                </View>
                <View style={styles.featuredArtistWrap}>
                  <View style={styles.artistAvatar}>
                    <Text style={styles.artistAvatarText}>{featured.artist.charAt(0)}</Text>
                  </View>
                  <Text style={styles.featuredArtist} numberOfLines={1}>{featured.artist}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        <CategoryChip
          label="All"
          selected={selectedCategory === 'All'}
          onPress={() => handleCategorySelect('All')}
        />
        {CATEGORIES.map((category) => (
          <CategoryChip
            key={category}
            label={category}
            selected={selectedCategory === category}
            onPress={() => handleCategorySelect(category)}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'All' ? 'All Paintings' : selectedCategory}
        </Text>
        <Text style={styles.resultCount}>{paintings.length} items</Text>
      </View>
    </>
  );

  if (loading && !refreshing && paintings.length === 0) {
    return <LoadingSpinner message="Loading paintings..." />;
  }

  if (error && paintings.length === 0) {
    return <ErrorState message={error} onRetry={loadPaintings} />;
  }

  if (paintings.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <EmptyState
          icon="images-outline"
          title="No Paintings Found"
          message="Try adjusting your search or filters"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={paintings}
        renderItem={({ item }) => (
          <PaintingCard
            painting={item}
            onPress={() => handlePaintingPress(item.id)}
            onAddToWishlist={() => handleWishlistToggle(item.id)}
            isInWishlist={wishlistItems.some(
              (w) => w.painting.id === item.id
            )}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={lightTheme.colors.primary} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 18,
    fontFamily: lightTheme.fonts.displaySemibold,
    color: lightTheme.colors.text,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartButton: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: lightTheme.colors.surface,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: lightTheme.colors.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: lightTheme.colors.background,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: lightTheme.fonts.bodyBold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: lightTheme.fonts.displaySemibold,
    color: lightTheme.colors.text,
  },
  resultCount: {
    fontSize: 12,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textSecondary,
  },
  featuredSection: {
    marginTop: 6,
    marginBottom: 6,
  },
  featuredCard: {
    marginHorizontal: 20,
    height: 220,
    borderRadius: lightTheme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: lightTheme.colors.surfaceAlt,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredHeart: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(30,27,22,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredCategoryPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(30,27,22,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: lightTheme.borderRadius.round,
  },
  featuredCategoryText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: lightTheme.fonts.bodySemibold,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(20,18,14,0.55)',
  },
  featuredTitle: {
    fontSize: 19,
    fontFamily: lightTheme.fonts.display,
    color: '#fff',
    marginBottom: 8,
  },
  featuredMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPriceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featuredPrice: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.accent,
  },
  featuredArtistWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '55%',
  },
  artistAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: lightTheme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistAvatarText: {
    fontSize: 10,
    fontFamily: lightTheme.fonts.bodyBold,
    color: '#fff',
  },
  featuredArtist: {
    fontSize: 12,
    fontFamily: lightTheme.fonts.bodyMedium,
    color: '#fff',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
});
