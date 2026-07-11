import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, CategoryChip, ImagePickerField } from '../../components/common';
import { lightTheme } from '../../theme';
import { CATEGORIES } from '../../constants';
import { paintingService } from '../../api/services';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Painting } from '../../types';

type Props = NativeStackScreenProps<any, 'AdminPaintingForm'>;

export const AdminPaintingFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const editingPainting = (route.params as { painting?: Painting } | undefined)?.painting;
  const isEditMode = !!editingPainting;

  const [title, setTitle] = useState(editingPainting?.title ?? '');
  const [artist, setArtist] = useState(editingPainting?.artist ?? '');
  const [price, setPrice] = useState(editingPainting ? String(editingPainting.price) : '');
  const [description, setDescription] = useState(editingPainting?.description ?? '');
  const [category, setCategory] = useState(editingPainting?.category ?? CATEGORIES[0]);
  const [image, setImage] = useState(editingPainting?.image ?? '');
  const [stock, setStock] = useState(editingPainting ? String(editingPainting.stock) : '1');
  const [rating, setRating] = useState(editingPainting ? String(editingPainting.rating) : '4.5');
  const [featured, setFeatured] = useState(editingPainting?.featured ?? false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !artist.trim() || !price.trim() || !description.trim() || !image.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields, including a photo');
      return;
    }

    const priceNum = Number(price);
    const stockNum = Number(stock);
    const ratingNum = Number(rating);

    if (Number.isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    if (Number.isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Invalid Stock', 'Please enter a valid stock quantity');
      return;
    }

    if (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      Alert.alert('Invalid Rating', 'Rating must be between 0 and 5');
      return;
    }

    const payload = {
      title: title.trim(),
      artist: artist.trim(),
      price: priceNum,
      description: description.trim(),
      category,
      image: image.trim(),
      stock: stockNum,
      rating: ratingNum,
      featured,
    };

    setSaving(true);
    try {
      const response = isEditMode
        ? await paintingService.update(editingPainting!.id, payload)
        : await paintingService.create(payload);

      if (response.success) {
        Alert.alert(
          'Success',
          `Painting ${isEditMode ? 'updated' : 'created'} successfully`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || `Failed to ${isEditMode ? 'update' : 'create'} painting`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isEditMode ? 'Edit Painting' : 'Add Painting'}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ImagePickerField value={image} onChange={setImage} />

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Sunset Symphony"
            placeholderTextColor={lightTheme.colors.textTertiary}
          />

          <Text style={styles.label}>Artist *</Text>
          <TextInput
            style={styles.input}
            value={artist}
            onChangeText={setArtist}
            placeholder="e.g. Anil Jayasuriya"
            placeholderTextColor={lightTheme.colors.textTertiary}
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Price (LKR) *</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="15000"
                placeholderTextColor={lightTheme.colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Stock *</Text>
              <TextInput
                style={styles.input}
                value={stock}
                onChangeText={setStock}
                placeholder="5"
                placeholderTextColor={lightTheme.colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Rating (0-5)</Text>
          <TextInput
            style={styles.input}
            value={rating}
            onChangeText={setRating}
            placeholder="4.5"
            placeholderTextColor={lightTheme.colors.textTertiary}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the painting..."
            placeholderTextColor={lightTheme.colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                selected={category === cat}
                onPress={() => setCategory(cat)}
              />
            ))}
          </ScrollView>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <View style={styles.switchIconWrap}>
                <Ionicons name="star" size={16} color={lightTheme.colors.warning} />
              </View>
              <Text style={styles.switchText}>Featured Painting</Text>
            </View>
            <Switch
              value={featured}
              onValueChange={setFeatured}
              trackColor={{ false: lightTheme.colors.border, true: `${lightTheme.colors.primary}80` }}
              thumbColor={featured ? lightTheme.colors.primary : '#f4f3f4'}
            />
          </View>

          <PrimaryButton
            title={isEditMode ? 'Save Changes' : 'Add Painting'}
            onPress={handleSave}
            loading={saving}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: lightTheme.colors.text,
    marginBottom: 16,
    ...lightTheme.shadows.small,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    ...lightTheme.shadows.small,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: lightTheme.colors.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  switchText: {
    fontSize: 15,
    color: lightTheme.colors.text,
    fontFamily: lightTheme.fonts.bodySemibold,
  },
  saveButton: {
    marginTop: 4,
  },
});
