import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header, SearchBar, LoadingSpinner, EmptyState, ErrorState } from '../../components/common';
import { lightTheme } from '../../theme';
import { formatCurrency } from '../../utils/helpers';
import { paintingService } from '../../api/services';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Painting } from '../../types';

type Props = NativeStackScreenProps<any, 'AdminPaintings'>;

export const AdminPaintingsScreen: React.FC<Props> = ({ navigation }) => {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPaintings = async () => {
    try {
      setError(null);
      const response = await paintingService.getAll();
      if (response.success) {
        setPaintings(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load paintings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaintings();
  }, []);

  // Refresh the list whenever this screen regains focus (e.g. after add/edit)
  useFocusEffect(
    useCallback(() => {
      loadPaintings();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPaintings();
    setRefreshing(false);
  };

  const handleDelete = (painting: Painting) => {
    Alert.alert(
      'Delete Painting',
      `Are you sure you want to delete "${painting.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(painting.id);
              const response = await paintingService.delete(painting.id);
              if (response.success) {
                setPaintings((prev) => prev.filter((p) => p.id !== painting.id));
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete painting');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const filteredPaintings = paintings.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.artist.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const renderItem = ({ item }: { item: Painting }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.thumbnail} />
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.stock}>Stock: {item.stock}</Text>
        </View>
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('AdminPaintingForm', { painting: item })}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
          disabled={deletingId === item.id}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Loading paintings..." />;
  }

  if (error && paintings.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Manage Paintings" onBackPress={() => navigation.goBack()} />
        <ErrorState message={error} onRetry={loadPaintings} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Manage Paintings"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AdminPaintingForm', {})}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search paintings..."
      />

      {filteredPaintings.length === 0 ? (
        <EmptyState
          icon="color-palette-outline"
          title={search ? 'No matches found' : 'No Paintings Yet'}
          message={
            search
              ? 'Try a different search term'
              : 'Add your first painting to the catalogue'
          }
          actionLabel={search ? undefined : 'Add Painting'}
          onAction={() => navigation.navigate('AdminPaintingForm', {})}
        />
      ) : (
        <FlatList
          data={filteredPaintings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F1E7',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: lightTheme.borderRadius.lg,
    padding: 12,
    marginBottom: 12,
    ...lightTheme.shadows.small,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#EEEDF5',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontFamily: lightTheme.fonts.bodyBold,
    color: '#18181B',
  },
  artist: {
    fontSize: 13,
    color: '#71717A',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  categoryBadge: {
    backgroundColor: `${lightTheme.colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.primary,
  },
  stock: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  price: {
    fontSize: 15,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.primary,
    marginTop: 4,
  },
  actions: {
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#C0954C',
  },
  deleteButton: {
    backgroundColor: '#C0503F',
  },
});
