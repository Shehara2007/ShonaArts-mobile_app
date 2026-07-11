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
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/common';
import { lightTheme } from '../theme';
import { authService } from '../api/services';
import { useAppDispatch } from '../redux/hooks';
import { setCredentials } from '../redux/slices/authSlice';
import { storeAuthData } from '../utils/storage';
import { validateEmail } from '../utils/helpers';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        const { user, token } = response.data;

        await storeAuthData(token, user);
        dispatch(setCredentials({ user, token }));

        if (user.role === 'admin') {
          navigation.replace('AdminDashboard');
        } else {
          navigation.replace('MainTabs');
        }
      }
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'customer' | 'admin') => {
    setEmail(role === 'admin' ? 'admin@gmail.com' : 'customer@gmail.com');
    setPassword('123456');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[lightTheme.colors.gradient1, lightTheme.colors.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 32 }]}
        >
          <View style={styles.logoCircle}>
            <Ionicons name="color-palette" size={40} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Shona Arts</Text>
          <Text style={styles.headerSubtitle}>Welcome back! Sign in to continue</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrap}>
              <Ionicons name="mail-outline" size={18} color={lightTheme.colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={lightTheme.colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={lightTheme.colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password"
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

          <PrimaryButton
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}
          >
            <Text style={styles.signupText}>
              Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          {/* Demo Credentials */}
          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Quick Demo Login</Text>
            <View style={styles.demoButtons}>
              <TouchableOpacity style={styles.demoChip} onPress={() => fillDemo('customer')}>
                <Ionicons name="person-outline" size={14} color={lightTheme.colors.primary} />
                <Text style={styles.demoChipText}>Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.demoChip} onPress={() => fillDemo('admin')}>
                <Ionicons name="shield-checkmark-outline" size={14} color={lightTheme.colors.primary} />
                <Text style={styles.demoChipText}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: lightTheme.borderRadius.xxl,
    borderBottomRightRadius: lightTheme.borderRadius.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: lightTheme.fonts.display,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontFamily: lightTheme.fonts.bodyMedium,
  },
  formCard: {
    flex: 1,
    marginTop: -28,
    marginHorizontal: 20,
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.xl,
    padding: 24,
    ...lightTheme.shadows.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.surfaceAlt,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 56,
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
  loginButton: {
    marginTop: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: lightTheme.colors.border,
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 12,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.textTertiary,
  },
  signupText: {
    textAlign: 'center',
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
  },
  signupLink: {
    color: lightTheme.colors.primary,
    fontFamily: lightTheme.fonts.bodyBold,
  },
  demoContainer: {
    marginTop: 28,
    padding: 16,
    backgroundColor: lightTheme.colors.surfaceAlt,
    borderRadius: lightTheme.borderRadius.md,
  },
  demoTitle: {
    fontSize: 13,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.textSecondary,
    marginBottom: 10,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTheme.colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: lightTheme.borderRadius.round,
    gap: 6,
    flex: 1,
    ...lightTheme.shadows.small,
  },
  demoChipText: {
    fontSize: 12,
    fontFamily: lightTheme.fonts.bodyBold,
    color: lightTheme.colors.primary,
  },
});
