import { StyleSheet, Text, View } from 'react-native';

import { IS_MOCK_MODE } from '../lib/purchases';

/**
 * Small, unobtrusive corner pill that renders only when purchases are
 * running against the local mock (see lib/purchases.ts) -- i.e. whenever
 * no real EXPO_PUBLIC_REVENUECAT_API_KEY is configured, or
 * EXPO_PUBLIC_MOCK_PURCHASES=true. Renders nothing in real mode, so it
 * never appears in a production build wired to a real RevenueCat key.
 *
 * Styling here is intentionally minimal/self-contained; it will be
 * restyled to match the app's design system in the UI build stage.
 */
export function MockModeBadge() {
  if (!IS_MOCK_MODE) return null;

  return (
    <View style={styles.pill} pointerEvents="none">
      <Text style={styles.label}>MOCK MODE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#111111',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    opacity: 0.85,
    zIndex: 999,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
