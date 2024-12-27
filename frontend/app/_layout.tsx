import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/auth';
import { store, persistor } from '../store/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeHeader from '@/components/HomeHeader';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
          >
            <SafeAreaProvider
              style={{
                backgroundColor: '#FFFCF4',
                flex: 1,
              }}
            >
              <Stack>
                <Stack.Screen name='(auth)' options={{ headerShown: false }} />
                <Stack.Screen
                  name='(household)'
                  options={{ headerShown: false }}
                />
                <Stack.Screen name='home' options={{ headerShown: false }} />
              </Stack>
              <StatusBar style='auto' />
            </SafeAreaProvider>
          </ThemeProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}
