import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MockModeBadge } from '../components/MockModeBadge';
import { colors } from '../constants/theme';
import { configurePurchases } from '../lib/purchases';

// Root layout: mounted once for the whole app. Configures the purchases
// SDK (or logs that mock mode is active) before any screen renders, wraps
// every screen in a SafeAreaProvider so inset-aware layouts work anywhere
// in the tree, and applies one consistent header style across the stack.
export default function RootLayout() {
  useEffect(() => {
    configurePurchases();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: colors.paper },
          headerShadowVisible: false,
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Interview Playbook' }} />
        <Stack.Screen name="category/[id]" options={{ title: '' }} />
        <Stack.Screen
          name="paywall"
          options={{ title: 'Full Playbook', presentation: 'modal' }}
        />
      </Stack>
      {/* Dev-only "MOCK MODE" pill; renders on top of every screen, and
          renders nothing at all once a real RevenueCat key is configured. */}
      <MockModeBadge />
    </SafeAreaProvider>
  );
}
