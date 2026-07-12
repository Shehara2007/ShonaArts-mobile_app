import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton } from '../components/common';
import { lightTheme } from '../theme';
import { authService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setCredentials } from '../redux/slices/authSlice';
import { storeAuthData } from '../utils/storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [saving, setSaving] = useState(false);

  const handleChangeAvatar = () => {
    Alert.alert('Update Photo', 'Choose a source for your profile photo', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: openGallery },
      ...(avatar ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: () => setAvatar('') }] : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera Access Needed', 'Please allow camera access in your device settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatar(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo Library Access Needed', 'Please allow photo library access in your device settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Missing Information', 'Please enter your phone number');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Missing Information', 'Please enter your address');
      return;
    }

    setSaving(true);
    try {
      const res = await authService.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        avatar: avatar || undefined,
      });

      if (res.success) {
        dispatch(setCredentials({ user: res.data, token: token as string }));
        await storeAuthData(token as string, res.data);
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handleChangeAvatar} activeOpacity={0.85}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={36} color="#fff" />
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={13} color="#fff" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleChangeAvatar} activeOpacity={0.7}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color={lightTheme.colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={lightTheme.colors.textTertiary}
            />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputWrap, styles.inputWrapDisabled]}>
            <Ionicons name="mail-outline" size={18} color={lightTheme.colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.email}
              editable={false}
            />
          </View>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="call-outline" size={18} color={lightTheme.colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+94XXXXXXXXX"
              placeholderTextColor={lightTheme.colors.textTertiary}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.label}>Address</Text>
          <View style={[styles.inputWrap, styles.textAreaWrap]}>
            <Ionicons name="location-outline" size={18} color={lightTheme.colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Your shipping address"
              placeholderTextColor={lightTheme.colors.textTertiary}
              multiline
            />
          </View>

          <PrimaryButton
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            icon={<Ionicons name="checkmark-circle-outline" size={17} color="#fff" />}
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: lightTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: lightTheme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: lightTheme.colors.background,
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.accent,
  },
  label: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    paddingHorizontal: 16,
    marginBottom: 16,
    minHeight: 54,
  },
  inputWrapDisabled: {
    backgroundColor: lightTheme.colors.surfaceAlt,
  },
  textAreaWrap: {
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.text,
  },
  inputDisabled: {
    color: lightTheme.colors.textTertiary,
  },
  textArea: {
    minHeight: 60,
  },
  saveButton: {
    marginTop: 8,
  },
});
