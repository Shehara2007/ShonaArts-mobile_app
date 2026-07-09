import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { store } from './src/redux/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { getAuthData } from './src/utils/storage';
import { mockApi } from './src/api/mockApi';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Restore any previously stored session before the app renders
    const initializeAuth = async () => {
      try {
        const authData = await getAuthData();
        if (authData) {
          mockApi.setCurrentUser(authData.user, authData.token);
        }
      } catch (error) {
        console.log('No stored auth data found');
      } finally {
        setIsReady(true);
      }
    };

    initializeAuth();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
