import React from 'react';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '../theme';

// Auth Screens
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

// Customer Screens
import { HomeScreen } from '../screens/HomeScreen';
import { PaintingDetailScreen } from '../screens/PaintingDetailScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { CustomOrderScreen } from '../screens/CustomOrderScreen';

// Admin Screens
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { AdminPaintingsScreen } from '../screens/admin/AdminPaintingsScreen';
import { AdminPaintingFormScreen } from '../screens/admin/AdminPaintingFormScreen';
import { AdminOrdersScreen } from '../screens/admin/AdminOrdersScreen';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';
import { AdminAnalyticsScreen } from '../screens/admin/AdminAnalyticsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Wishlist: { active: 'compass', inactive: 'compass-outline' },
  Orders: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

const MainTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: lightTheme.colors.primary,
        tabBarInactiveTintColor: lightTheme.colors.textTertiary,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 12,
          backgroundColor: lightTheme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: lightTheme.colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 44 }}>
              <Ionicons
                name={focused ? icons.active : icons.inactive}
                size={22}
                color={color}
              />
              <View
                style={{
                  marginTop: 8,
                  width: 18,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: focused ? lightTheme.colors.primary : 'transparent',
                }}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="PaintingDetail" component={PaintingDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="CustomOrder" component={CustomOrderScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminPaintings" component={AdminPaintingsScreen} />
      <Stack.Screen name="AdminPaintingForm" component={AdminPaintingFormScreen} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
    </Stack.Navigator>
  );
};
