import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton } from '../components/common';
import { lightTheme } from '../theme';
import { authService } from '../api/services';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logout, setCredentials } from '../redux/slices/authSlice';
import { clearAuthData, storeAuthData } from '../utils/storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Settings'>;

const DEFAULT_PREFS = {
  orderUpdates: true,
  promotions: true,
  wishlistRestock: false,
};

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  const [prefs, setPrefs] = useState(user?.notificationPrefs ?? DEFAULT_PREFS);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleTogglePref = async (key: keyof typeof prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSavingPrefs(true);
    try {
      const res = await authService.updateProfile({ notificationPrefs: updated });
      if (res.success && token) {
        dispatch(setCredentials({ user: res.data, token }));
        await storeAuthData(token, res.data);
      }
    } catch (error) {
      // revert on failure
      setPrefs(prefs);
      Alert.alert('Error', 'Failed to update notification preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all password fields');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirmation do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert('Success', 'Your password has been changed');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      Alert.alert('Confirmation Required', 'Please type DELETE to confirm account deletion');
      return;
    }

    Alert.alert(
      'Delete Account',
      'This will permanently delete your account, orders, and saved data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await authService.deleteAccount();
              await clearAuthData();
              dispatch(logout());
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete account');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Notification preferences */}
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <View style={styles.card}>
            <View style={styles.prefRow}>
              <View style={styles.prefTextWrap}>
                <Text style={styles.prefTitle}>Order Updates</Text>
                <Text style={styles.prefSubtitle}>Status changes on your orders</Text>
              </View>
              <Switch
                value={prefs.orderUpdates}
                onValueChange={() => handleTogglePref('orderUpdates')}
                disabled={savingPrefs}
                trackColor={{ false: lightTheme.colors.border, true: lightTheme.colors.accent }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.prefDivider} />
            <View style={styles.prefRow}>
              <View style={styles.prefTextWrap}>
                <Text style={styles.prefTitle}>Promotions & Offers</Text>
                <Text style={styles.prefSubtitle}>Sales, discounts and news</Text>
              </View>
              <Switch
                value={prefs.promotions}
                onValueChange={() => handleTogglePref('promotions')}
                disabled={savingPrefs}
                trackColor={{ false: lightTheme.colors.border, true: lightTheme.colors.accent }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.prefDivider} />
            <View style={styles.prefRow}>
              <View style={styles.prefTextWrap}>
                <Text style={styles.prefTitle}>Wishlist Restocks</Text>
                <Text style={styles.prefSubtitle}>When wishlist items are back in stock</Text>
              </View>
              <Switch
                value={prefs.wishlistRestock}
                onValueChange={() => handleTogglePref('wishlistRestock')}
                disabled={savingPrefs}
                trackColor={{ false: lightTheme.colors.border, true: lightTheme.colors.accent }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Change password */}
          <Text style={styles.sectionTitle}>Change Password</Text>
          <View style={styles.card}>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current Password"
                placeholderTextColor={lightTheme.colors.textTertiary}
                secureTextEntry={!showCurrent}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} hitSlop={8}>
                <Ionicons
                  name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={lightTheme.colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New Password"
                placeholderTextColor={lightTheme.colors.textTertiary}
                secureTextEntry={!showNew}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} hitSlop={8}>
                <Ionicons
                  name={showNew ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={lightTheme.colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm New Password"
                placeholderTextColor={lightTheme.colors.textTertiary}
                secureTextEntry={!showNew}
              />
            </View>

            <PrimaryButton
              title="Update Password"
              onPress={handleChangePassword}
              loading={changingPassword}
              variant="outline"
              style={styles.passwordButton}
            />
          </View>

          {/* Danger zone */}
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
          <View style={[styles.card, styles.dangerCard]}>
            <Text style={styles.dangerText}>
              Deleting your account will permanently remove your profile, order history, wishlist
              and saved data. This cannot be undone.
            </Text>
            <TextInput
              style={styles.dangerInput}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder='Type "DELETE" to confirm'
              placeholderTextColor={lightTheme.colors.textTertiary}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
              disabled={deleting}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
              <Text style={styles.deleteButtonText}>
                {deleting ? 'Deleting...' : 'Delete My Account'}
              </Text>
            </TouchableOpacity>
          </View>
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
  sectionTitle: {
    fontSize: 15,
    fontFamily: lightTheme.fonts.displaySemibold,
    color: lightTheme.colors.text,
    marginBottom: 10,
    marginTop: 4,
  },
  dangerTitle: {
    color: lightTheme.colors.error,
  },
  card: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prefTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  prefTitle: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodySemibold,
    color: lightTheme.colors.text,
    marginBottom: 2,
  },
  prefSubtitle: {
    fontSize: 12,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.textSecondary,
  },
  prefDivider: {
    height: 1,
    backgroundColor: lightTheme.colors.border,
    marginVertical: 14,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.surfaceAlt,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.text,
  },
  passwordButton: {
    marginTop: 4,
  },
  dangerCard: {
    borderColor: lightTheme.colors.errorLight,
    backgroundColor: lightTheme.colors.errorLight,
  },
  dangerText: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.body,
    color: lightTheme.colors.text,
    lineHeight: 19,
    marginBottom: 14,
  },
  dangerInput: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: lightTheme.colors.error,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodyMedium,
    color: lightTheme.colors.text,
    marginBottom: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTheme.colors.error,
    borderRadius: lightTheme.borderRadius.md,
    paddingVertical: 14,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: lightTheme.fonts.bodyBold,
    color: '#fff',
  },
});
