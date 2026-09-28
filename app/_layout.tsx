import { useEffect } from 'react';
import { Stack } from 'expo-router';

import { configurePurchases } from '../lib/purchases';

// Root layout: mounted once for the whole app. Configures the purchases
// SDK (or logs that mock mode is active) before any screen renders.
// Full navigator structure (stacks/modals for the paywall, category
// detail, etc.) is filled in during the UI build stage -- this is
// intentionally a minimal, working layout for now.
export default function RootLayout() {
  useEffect(() => {
    configurePurchases();
  }, []);

  return <Stack screenOptions={{ headerTitleAlign: 'center' }} />;
}
