import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { lightTheme } from '../../theme';

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selectedChip]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: lightTheme.borderRadius.round,
    backgroundColor: lightTheme.colors.surface,
    marginRight: 10,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  selectedChip: {
    backgroundColor: lightTheme.colors.primary,
    borderColor: lightTheme.colors.primary,
  },
  label: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.textSecondary,
  },
  selectedLabel: {
    color: '#fff',
  },
});
