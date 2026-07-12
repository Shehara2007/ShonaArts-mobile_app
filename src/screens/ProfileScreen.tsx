import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '../theme';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import { clearAuthData } from '../utils/storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearAuthData();
            dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const menuItems: Array<{
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
  }> = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => {
        navigation.navigate('EditProfile');
      },
    },
    {
      icon: 'color-palette-outline',
      title: 'Custom Artwork Request',
      subtitle: 'Request a custom painting',
      onPress: () => {
        navigation.navigate('CustomOrder');
      },
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage your notifications',
      onPress: () => {
        navigation.navigate('Notifications');
      },
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'Password, preferences and privacy',
      onPress: () => {
        navigation.navigate('Settings');
      },
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => {
        Alert.alert('Help & Support', 'For support, please email: support@shonaarts.com');
      },
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      subtitle: 'Learn more about Shona Arts',
      onPress: () => {
        Alert.alert(
          'Shona Arts',
          'Version 1.0.0\n\nAI Powered Art Marketplace\n\nCreated for University Coursework'
        );
      },
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.profileHeader, { paddingTop: insets.top + 24 }]}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={34} color="#fff" />
            </View>
          )}
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={12} color={lightTheme.colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.userInfoCard}>
        <View style={styles.infoItem}>
          <View style={styles.infoIconWrap}>
            <Ionicons name="call-outline" size={15} color={lightTheme.colors.accent} />
          </View>
          <Text style={styles.infoText}>{user?.phone}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <View style={styles.infoIconWrap}>
            <Ionicons name="location-outline" size={15} color={lightTheme.colors.accent} />
          </View>
          <Text style={styles.infoText} numberOfLines={2}>
            {user?.address}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index === menuItems.length - 1 && styles.menuItemLast,
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name={item.icon} size={19} color={lightTheme.colors.text} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={lightTheme.colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={19} color={lightTheme.colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: lightTheme.colors.primary,
    paddingBottom: 44,
    paddingHorizontal: 20,
    borderBottomLeftRadius: lightTheme.borderRadius.xxl,
    borderBottomRightRadius: lightTheme.borderRadius.xxl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: lightTheme.colors.primary,
  },
  userName: {
    fontSize: 20,
    fontFamily: lightTheme.fonts.display,
    color: '#fff',
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.body,
    color: 'rgba(255,255,255,0.65)',
  },
  userInfoCard: {
    marginTop: -24,
    marginHorizontal: 20,
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    padding: 16,
    ...lightTheme.shadows.medium,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: lightTheme.colors.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    fontSize: 13,
    color: lightTheme.colors.textSecondary,
    fontFamily: lightTheme.fonts.bodyMedium,
    flex: 1,
  },
  infoDivider: {
    height: 1,
    backgroundColor: lightTheme.colors.border,
    marginVertical: 12,
  },
  menuSection: {
    backgroundColor: lightTheme.colors.surface,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: lightTheme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: lightTheme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTheme.colors.errorLight,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: lightTheme.borderRadius.lg,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textTertiary,
    marginBottom: 32,
  },
});
