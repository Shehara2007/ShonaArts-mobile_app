import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { lightTheme } from '../../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'gradient' | 'solid' | 'outline' | 'ghost';
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'gradient',
  icon,
}) => {
  const isDisabled = disabled || loading;

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[styles.container, styles.outlineContainer, isDisabled && styles.outlineDisabled, style]}
      >
        {loading ? (
          <ActivityIndicator color={lightTheme.colors.primary} />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, styles.outlineText, textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.6}
        style={[styles.container, styles.ghostContainer, style]}
      >
        {loading ? (
          <ActivityIndicator color={lightTheme.colors.primary} />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, styles.outlineText, textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // 'gradient' and 'solid' both render as the same solid near-black button
  // to match the reference design's dark CTA style.
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.container,
        styles.solidContainer,
        isDisabled && styles.disabledContainer,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: lightTheme.borderRadius.md,
    overflow: 'hidden',
  },
  solidContainer: {
    flexDirection: 'row',
    backgroundColor: lightTheme.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    gap: 8,
  },
  outlineContainer: {
    flexDirection: 'row',
    backgroundColor: lightTheme.colors.primaryLight,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    gap: 8,
  },
  outlineDisabled: {
    backgroundColor: lightTheme.colors.surfaceAlt,
  },
  ghostContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    gap: 8,
  },
  disabledContainer: {
    backgroundColor: lightTheme.colors.textTertiary,
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontFamily: lightTheme.fonts.bodyBold,
    letterSpacing: 0.2,
  },
  outlineText: {
    color: lightTheme.colors.primary,
  },
});
