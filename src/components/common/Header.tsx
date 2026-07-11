import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '../../theme';

interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  showCart?: boolean;
  cartCount?: number;
  onCartPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  rightComponent,
  showCart,
  cartCount = 0,
  onCartPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={lightTheme.colors.background} />
      <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
        <View style={styles.leftContainer}>
          {onBackPress && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={19} color={lightTheme.colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.rightContainer}>
          {showCart && onCartPress && (
            <TouchableOpacity
              onPress={onCartPress}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name="cart-outline" size={19} color={lightTheme.colors.text} />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {rightComponent}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: lightTheme.colors.background,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontFamily: lightTheme.fonts.displaySemibold,
    color: lightTheme.colors.text,
    textAlign: 'center',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: lightTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...lightTheme.shadows.small,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: lightTheme.colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: lightTheme.colors.background,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: lightTheme.fonts.bodyBold,
  },
});
