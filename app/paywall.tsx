import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing, typography } from '../constants/theme';

/**
 * Placeholder paywall route.
 *
 * This UI stage only needs navigation to a locked category to land
 * somewhere real instead of crashing -- the actual paywall (value prop,
 * locked-category list, price, "Unlock Full Playbook" / "Restore
 * Purchases" via lib/purchases.ts) is built in the next stage on top of
 * this route. `categoryId` (which category the person tapped) is already
 * threaded through via the route params so that stage can navigate
 * straight into it after a successful purchase.
 */
export default function PaywallScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={typography.title}>Full Playbook</Text>
        <Text style={typography.bodyMuted}>
          The paywall screen (value prop, price, unlock, and restore) is built in the
          next stage.
          {categoryId ? ` You tapped: ${categoryId}.` : ''}
        </Text>

        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
