import {
  Inter_400Regular,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ensureSchemaVersion } from '@/src/utils/storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      ensureSchemaVersion().then(() => SplashScreen.hideAsync());
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 250,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen
              name="game"
              options={{
                gestureEnabled: false,
                animation: 'fade_from_bottom',
                animationDuration: 300,
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="shop"
              options={{
                animation: 'fade_from_bottom',
                animationDuration: 250,
              }}
            />
            <Stack.Screen
              name="stats"
              options={{
                animation: 'fade_from_bottom',
                animationDuration: 250,
              }}
            />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </GestureHandlerRootView>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
