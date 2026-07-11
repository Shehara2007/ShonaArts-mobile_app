import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, Header } from '../components/common';
import { lightTheme } from '../theme';
import { authService } from '../api/services';
import { useAppDispatch } from '../redux/hooks';
import { setCredentials } from '../redux/slices/authSlice';
import { storeAuthData } from '../utils/storage';
import { validateEmail, validatePhone } from '../utils/helpers';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Register'>;

const FIELDS: Array<{
  key: 'name' | 'email' | 'phone' | 'address';
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words';
}> = [
  { key: 'name', icon: 'person-outline', placeholder: 'Full Name', autoCapitalize: 'words' },
  { key: 'email', icon: 'mail-outline', placeholder: 'Email Address', keyboardType: 'email-address', autoCapitalize: 'none' },
  { key: 'phone', icon: 'call-outline', placeholder: 'Phone (+94XXXXXXXXX)', keyboardType: 'phone-pad' },
  { key: 'address', icon: 'location-outline', placeholder: 'Address', autoCapitalize: 'words' },
];

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+94');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const values = { name, email, phone, address };
  const setters = { name: setName, email: setEmail, phone: setPhone, address: setAddress };

  const handleRegister = async () => {
    if (!name || !email || !phone || !address || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number (+94XXXXXXXXX)');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        name,
        email,
        phone,
        address,
        password,
      });

      if (response.success && response.data) {
        const { user, token } = response.data;

        await storeAuthData(token, user);
        dispatch(setCredentials({ user, token }));

        Alert.alert('Success', 'Registration successful!', [
          {
            text: 'OK',
            onPress: () => navigation.replace('MainTabs'),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Could not create account'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Create Account" onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Join Shona Arts</Text>
          <Text style={styles.subtitle}>Create an account to start collecting art</Text>

          {FIELDS.map((field) => (
            <View key={field.key} style={styles.inputContainer}>
              <View style={styles.inputIconWrap}>
                <Ionicons name={field.icon} size={18} color={lightTheme.colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor={lightTheme.colors.textTertiary}
                value={values[field.key]}
                onChangeText={setters[field.key]}
                keyboardType={field.keyboardType}
                autoCapitalize={field.autoCapitalize}
                autoCorrect={false}
              />
            </View>
          ))}

          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={lightTheme.colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password (min 6 characters)"
              placeholderTextColor={lightTheme.colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={lightTheme.colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={lightTheme.colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={lightTheme.colors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>

          <PrimaryButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
            style={styles.loginContainer}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: lightTheme.fonts.display,
    color: lightTheme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
    marginBottom: 28,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 56,
    ...lightTheme.shadows.small,
  },
  inputIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: lightTheme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: lightTheme.colors.text,
  },
  registerButton: {
    marginTop: 20,
  },
  loginContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
  },
  loginLink: {
    color: lightTheme.colors.primary,
    fontFamily: lightTheme.fonts.bodyBold,
  },
});
