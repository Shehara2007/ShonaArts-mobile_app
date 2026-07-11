import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '../../theme';

interface ImagePickerFieldProps {
  value: string;
  onChange: (uri: string) => void;
  aspect?: [number, number];
}

export const ImagePickerField: React.FC<ImagePickerFieldProps> = ({
  value,
  onChange,
  aspect = [4, 3],
}) => {
  const [processing, setProcessing] = useState(false);

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Camera Access Needed',
        'Please allow camera access in your device settings to take a photo.'
      );
      return;
    }

    setProcessing(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect,
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        onChange(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open the camera. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo Access Needed',
        'Please allow photo library access in your device settings to choose an image.'
      );
      return;
    }

    setProcessing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect,
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        onChange(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open the photo library. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePress = () => {
    const options = [
      { text: 'Take Photo', onPress: openCamera },
      { text: 'Choose from Gallery', onPress: openGallery },
      { text: 'Cancel', style: 'cancel' as const },
    ];

    if (Platform.OS === 'web') {
      // Web has no camera roll UI distinction; just open the library picker
      openGallery();
      return;
    }

    Alert.alert('Painting Image', 'Add an image using:', options);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.85}
      disabled={processing}
    >
      {value ? (
        <>
          <Image source={{ uri: value }} style={styles.image} />
          <View style={styles.overlay}>
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={16} color="#fff" />
                <Text style={styles.editBadgeText}>Change Photo</Text>
              </View>
            )}
          </View>
        </>
      ) : (
        <View style={styles.placeholder}>
          {processing ? (
            <ActivityIndicator color={lightTheme.colors.primary} />
          ) : (
            <>
              <View style={styles.placeholderIcon}>
                <Ionicons name="camera" size={28} color={lightTheme.colors.primary} />
              </View>
              <Text style={styles.placeholderTitle}>Add Painting Photo</Text>
              <Text style={styles.placeholderSubtitle}>Tap to take a photo or choose from gallery</Text>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: lightTheme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: lightTheme.colors.surfaceAlt,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.55)',
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodyBold,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: lightTheme.colors.border,
    borderStyle: 'dashed',
    borderRadius: lightTheme.borderRadius.lg,
    paddingHorizontal: 20,
  },
  placeholderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: lightTheme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholderTitle: {
    fontSize: 15,
    fontFamily: lightTheme.fonts.displaySemibold,
    color: lightTheme.colors.text,
    marginBottom: 4,
  },
  placeholderSubtitle: {
    fontSize: 12,
    color: lightTheme.colors.textSecondary,
    textAlign: 'center',
  },
});
