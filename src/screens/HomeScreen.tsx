import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
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
import { paintingService, wishlistService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  setPaintings,
  setFilters,
  setLoading,
  setError,
} from '../redux/slices/paintingSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { selectCartItemCount } from '../redux/slices/cartSlice';
import { debounce } from '../utils/helpers';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { paintings, filters, loading, error } = useAppSelector(
    (state) => state.painting
  );
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const cartCount = useAppSelector(selectCartItemCount);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    loadPaintings();
  }, [filters]);

  const loadPaintings = async () => {
    console.log('🏠 HomeScreen: Loading paintings...');
    dispatch(setLoading(true));
    dispatch(setError(null)); // Clear previous errors
    try {
      console.log('📡 HomeScreen: Calling paintingService.getAll with filters:', filters);
      const response = await paintingService.getAll(filters);
      console.log('📥 HomeScreen: Received response, success:', response.success, 'paintings:', response.data?.length);
      if (response.success) {
        dispatch(setPaintings(response.data));
        console.log('✅ HomeScreen: Paintings loaded successfully:', response.data.length);
      }
    } catch (err: any) {
      console.error('❌ HomeScreen: Failed to load paintings:', err);
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

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome to</Text>
          <Text style={styles.headerTitle}>Shona Arts</Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <SearchBar
        value={filters.search || ''}
        onChangeText={handleSearch}
        placeholder="Search paintings, artists..."
      />

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
      <View style={styles.container}>
        {renderHeader()}
        <EmptyState
          icon="images-outline"
          title="No Paintings Found"
          message="Try adjusting your search or filters"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: '#757575',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
  },
  cartButton: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: lightTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...lightTheme.shadows.small,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E91E63',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  resultCount: {
    fontSize: 14,
    color: '#757575',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
});
