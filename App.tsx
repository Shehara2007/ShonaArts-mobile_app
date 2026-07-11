import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, View } from 'react-native';
import { useFonts as usePlayfairFonts, PlayfairDisplay_500Medium, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { useFonts as useDMSansFonts, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { store } from './src/redux/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { getAuthData } from './src/utils/storage';
import { mockApi } from './src/api/mockApi';
import { lightTheme } from './src/theme';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  const [playfairLoaded] = usePlayfairFonts({
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });
  const [dmSansLoaded] = useDMSansFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const fontsLoaded = playfairLoaded && dmSansLoaded;

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

  if (!isReady || !fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: lightTheme.colors.background }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <StatusBar barStyle="dark-content" backgroundColor={lightTheme.colors.background} />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
