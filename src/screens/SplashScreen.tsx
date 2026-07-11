import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '../theme';
import { getAuthData } from '../utils/storage';
import { useAppDispatch } from '../redux/hooks';
import { setCredentials } from '../redux/slices/authSlice';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1600));

      const authData = await getAuthData();

      if (authData) {
        dispatch(setCredentials(authData));

        if (authData.user.role === 'admin') {
          navigation.replace('AdminDashboard');
        } else {
          navigation.replace('MainTabs');
        }
      } else {
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      navigation.replace('Login');
    }
  };

  return (
    <LinearGradient
      colors={[lightTheme.colors.gradient1, lightTheme.colors.gradient2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Ionicons name="color-palette" size={56} color="#fff" />
        </View>
        <Text style={styles.title}>Shona Arts</Text>
        <Text style={styles.subtitle}>AI Powered Art Marketplace</Text>
      </Animated.View>

      <Text style={styles.footer}>Made with ♥ for University Coursework</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontFamily: lightTheme.fonts.display,
    color: '#fff',
    marginTop: 24,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    fontFamily: lightTheme.fonts.bodyMedium,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: lightTheme.fonts.bodyMedium,
  },
});
