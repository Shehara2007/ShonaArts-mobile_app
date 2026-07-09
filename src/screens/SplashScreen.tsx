import React, { useEffect } from 'react';
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
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);

  useEffect(() => {
    // Animate logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Check auth status
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Show splash for 2 seconds
      
      const authData = await getAuthData();
      
      if (authData) {
        dispatch(setCredentials(authData));
        
        // Navigate based on user role
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
        <Ionicons name="color-palette" size={100} color="#fff" />
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
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
});
