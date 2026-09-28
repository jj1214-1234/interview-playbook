import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, shadow, spacing, typography } from '../constants/theme';
import { CATEGORY_IDS, getLockedCategories, type CategoryId } from '../lib/content';
import { purchaseFullPlaybook, restorePurchases, useEntitlement } from '../lib/purchases';

const PRODUCT_NAME = 'Full Playbook';
const PRICE_DISPLAY = '$9.99';

type PaywallStatus = 'idle' | 'purchasing' | 'restoring' | 'success';

function isCategoryId(value: string | undefined): value is CategoryId {
  return typeof value === 'string' && (CATEGORY_IDS as readonly string[]).includes(value);
}

/**
 * RevenueCat purchase/restore rejections are plain objects shaped like
 * `{ code, message, userCancelled }` (see @revenuecat/purchases-typescript-internal),
 * not necessarily `Error` instances -- so this checks defensively rather than
 * assuming a class.
 */
function isUserCancelled(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  return (error as { userCancelled?: boolean | null }).userCancelled === true;
}

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return 'Something went wrong. Please try again.';
}

/**
 * The real paywall: value prop, what's included (the 8 locked categories,
 * read live from lib/content.ts so this can never drift from the actual
 * catalog), price, the primary unlock action, and restore. Mirrors
 * lib/purchases.ts's mock/real duality automatically -- this screen never
 * branches on IS_MOCK_MODE itself, it just calls purchaseFullPlaybook() /
 * restorePurchases() and reacts to the result.
 */
export default function PaywallScreen() {
  const router = useRouter();
  const { categoryId: rawCategoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const categoryId = isCategoryId(rawCategoryId) ? rawCategoryId : null;

  const { unlocked, loading: entitlementLoading } = useEntitlement();
  const [status, setStatus] = useState<PaywallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);

  const lockedCategories = useMemo(() => getLockedCategories(), []);

  // Lets handleRestore read the latest entitlement value from inside a
  // setTimeout without retriggering on every render.
  const unlockedRef = useRef(unlocked);
  useEffect(() => {
    unlockedRef.current = unlocked;
  }, [unlocked]);

  const isBusy = status === 'purchasing' || status === 'restoring';
  const alreadyOwned = !entitlementLoading && unlocked && status === 'idle';

  const goToDestination = () => {
    if (categoryId) {
      router.replace({ pathname: '/category/[id]', params: { id: categoryId } });
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  // Success state: briefly confirm, then land back in the category that was
  // originally tapped (or just close the paywall if there wasn't one).
  useEffect(() => {
    if (status !== 'success') return;
    const timer = setTimeout(goToDestination, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleUnlock = async () => {
    setError(null);
    setRestoreNotice(null);
    setStatus('purchasing');
    try {
      await purchaseFullPlaybook();
      setStatus('success');
    } catch (err) {
      setStatus('idle');
      if (!isUserCancelled(err)) {
        setError(errorMessage(err));
      }
    }
  };

  const handleRestore = async () => {
    setError(null);
    setRestoreNotice(null);
    setStatus('restoring');
    try {
      await restorePurchases();
    } catch (err) {
      setStatus('idle');
      setError(errorMessage(err));
      return;
    }
    // Give the customer-info listener a beat to flush into useEntitlement()
    // before deciding there was nothing on this account to restore.
    setTimeout(() => {
      if (unlockedRef.current) {
        setStatus('success');
      } else {
        setStatus('idle');
        setRestoreNotice('No previous purchase found on this device.');
      }
    }, 400);
  };

  if (entitlementLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'success') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          <Text style={typography.title}>Full Playbook unlocked</Text>
          <Text style={typography.bodyMuted}>Taking you back in...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="lock-open-outline" size={26} color={colors.primary} />
        </View>
        <Text style={typography.screenTitle}>Unlock the Full Playbook</Text>
        <Text style={[typography.bodyMuted, styles.heroBody]}>
          Every industry question bank, word-for-word salary-negotiation scripts, and the
          closing-strong questions and follow-up templates -- everything beyond the two free
          starter categories, unlocked once, on this device.
        </Text>

        <View style={styles.card}>
          <Text style={typography.caption}>WHAT&apos;S INCLUDED</Text>
          <View style={styles.list}>
            {lockedCategories.map((category) => (
              <View key={category.id} style={styles.listRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.listRowText}>{category.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.priceCard}>
          <View style={styles.priceCardText}>
            <Text style={typography.cardTitle}>{PRODUCT_NAME}</Text>
            <Text style={typography.bodyMuted}>One-time purchase. No subscription.</Text>
          </View>
          <Text style={styles.price}>{PRICE_DISPLAY}</Text>
        </View>

        {alreadyOwned ? (
          <View style={styles.ownedBanner}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.ownedBannerText}>You already own the Full Playbook.</Text>
          </View>
        ) : (
          <Pressable
            onPress={handleUnlock}
            disabled={isBusy}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isBusy) && styles.primaryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: isBusy, busy: status === 'purchasing' }}
          >
            {status === 'purchasing' && <ActivityIndicator color={colors.white} />}
            <Text style={styles.primaryButtonText}>
              {status === 'purchasing' ? 'Unlocking...' : `Unlock Full Playbook -- ${PRICE_DISPLAY}`}
            </Text>
          </Pressable>
        )}

        {alreadyOwned && (
          <Pressable style={styles.primaryButton} onPress={goToDestination}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {restoreNotice && !error && <Text style={styles.noticeText}>{restoreNotice}</Text>}

        {!alreadyOwned && (
          <Pressable
            onPress={handleRestore}
            disabled={isBusy}
            style={styles.restoreLink}
            accessibilityRole="button"
          >
            {status === 'restoring' ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.restoreLinkText}>Restore Purchases</Text>
            )}
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  heroIconWrap: {
    alignSelf: 'flex-start',
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  heroBody: {
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  list: {
    gap: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  listRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.accentTint,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  priceCardText: {
    flex: 1,
    gap: 2,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.accent,
  },
  ownedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successTint,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  ownedBannerText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.dangerTint,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
  noticeText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.inkMuted,
  },
  restoreLink: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  restoreLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
