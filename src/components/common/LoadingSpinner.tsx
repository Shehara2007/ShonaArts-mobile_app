import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { lightTheme } from '../../theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'large',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <ActivityIndicator size={size} color={lightTheme.colors.primary} />
      </View>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.background,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: lightTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  message: {
    marginTop: 18,
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodyMedium,
    color: lightTheme.colors.textSecondary,
  },
});
