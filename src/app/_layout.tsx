import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { colors } from '@/theme/tokens';
import { useApp } from '@/store/useApp';
import { LaunchAnimation } from '@/components/brand/LaunchAnimation';
import { ToastHost } from '@/components/ui/Screen';
import { CelebrateHost } from '@/components/Celebrate';

SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});

let introPlayedThisSession = false;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const hydrated = useApp((s) => s.hydrated);
  const launches = useApp((s) => s.launches);
  const [showIntro, setShowIntro] = useState(!introPlayedThisSession);
  const [short] = useState(() => useApp.getState().launches > 0);

  useEffect(() => {
    if (fontsLoaded && hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, hydrated]);

  if (!fontsLoaded || !hydrated) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="upload/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="cards/open" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        </Stack>
        <ToastHost />
        <CelebrateHost />
        {showIntro && (
          <LaunchAnimation
            short={short || launches > 0}
            onDone={() => {
              introPlayedThisSession = true;
              useApp.getState().markLaunched();
              setShowIntro(false);
            }}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}
