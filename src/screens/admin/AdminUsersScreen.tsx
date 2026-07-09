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
import { userService } from '../../api/services';
import { useAppSelector } from '../../redux/hooks';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { User } from '../../types';

type Props = NativeStackScreenProps<any, 'AdminUsers'>;

export const AdminUsersScreen: React.FC<Props> = ({ navigation }) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setError(null);
      const response = await userService.getAll();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleToggleRole = (user: User) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    Alert.alert(
      'Change Role',
      `Make ${user.name} ${newRole === 'admin' ? 'an Admin' : 'a Customer'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setBusyId(user.id);
              const response = await userService.update(user.id, { role: newRole });
              if (response.success) {
                setUsers((prev) =>
                  prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
                );
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update role');
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}'s account? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setBusyId(user.id);
              const response = await userService.delete(user.id);
              if (response.success) {
                setUsers((prev) => prev.filter((u) => u.id !== user.id));
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete user');
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const renderItem = ({ item }: { item: User }) => {
    const isSelf = item.id === currentUser?.id;
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            {isSelf && <Text style={styles.youBadge}>You</Text>}
          </View>
          <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.roleBadge,
              item.role === 'admin' ? styles.adminBadge : styles.customerBadge,
            ]}
            onPress={() => !isSelf && handleToggleRole(item)}
            disabled={isSelf || busyId === item.id}
          >
            <Ionicons
              name={item.role === 'admin' ? 'shield-checkmark' : 'person'}
              size={12}
              color={item.role === 'admin' ? '#6200EE' : '#757575'}
            />
            <Text
              style={[
                styles.roleText,
                { color: item.role === 'admin' ? '#6200EE' : '#757575' },
              ]}
            >
              {item.role}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => !isSelf && handleDelete(item)}
            disabled={isSelf || busyId === item.id}
          >
            <Ionicons
              name="trash-outline"
              size={16}
              color={isSelf ? '#E0E0E0' : '#F44336'}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  if (error && users.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Manage Users" onBackPress={() => navigation.goBack()} />
        <ErrorState message={error} onRetry={loadUsers} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Manage Users" onBackPress={() => navigation.goBack()} />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search users..."
      />

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No Users Found"
          message={search ? 'Try a different search term' : 'No registered users yet'}
        />
      ) : (
        <FlatList
          data={filteredUsers}
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
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    ...lightTheme.shadows.small,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F0F0',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  youBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4CAF50',
    backgroundColor: '#4CAF5020',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
    overflow: 'hidden',
  },
  email: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  phone: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  actions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  adminBadge: {
    backgroundColor: '#6200EE15',
  },
  customerBadge: {
    backgroundColor: '#75757515',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  deleteButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
