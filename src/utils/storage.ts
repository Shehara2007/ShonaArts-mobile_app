import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { User } from '../types';

// Store auth data
export const storeAuthData = async (token: string, user: User) => {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, token],
      [STORAGE_KEYS.USER, JSON.stringify(user)],
    ]);
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw error;
  }
};

// Get stored auth data
export const getAuthData = async (): Promise<{ token: string; user: User } | null> => {
  try {
    const values = await AsyncStorage.multiGet([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
    ]);
    
    const token = values[0][1];
    const userStr = values[1][1];
    
    if (token && userStr) {
      return {
        token,
        user: JSON.parse(userStr),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
};

// Clear auth data
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

// Theme storage
export const storeTheme = async (theme: 'light' | 'dark') => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error('Error storing theme:', error);
  }
};

export const getStoredTheme = async (): Promise<'light' | 'dark'> => {
  try {
    const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return (theme as 'light' | 'dark') || 'light';
  } catch (error) {
    console.error('Error getting theme:', error);
    return 'light';
  }
};
