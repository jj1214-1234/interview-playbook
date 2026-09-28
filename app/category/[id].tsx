import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '../../components/ProgressBar';
import { SectionBody } from '../../components/SectionBody';
import { colors, radii, shadow, spacing, typography } from '../../constants/theme';
import { CATEGORY_IDS, getCategory, type CategoryId } from '../../lib/content';
import { getCategoryProgress, setSectionPracticed } from '../../lib/progress';
import { useEntitlement } from '../../lib/purchases';
import type { SectionProgress } from '../../lib/types';

function isCategoryId(value: string | undefined): value is CategoryId {
  return typeof value === 'string' && (CATEGORY_IDS as readonly string[]).includes(value);
}

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { unlocked, loading: entitlementLoading } = useEntitlement();
  const [progress, setProgress] = useState<SectionProgress>({});

  const validId = isCategoryId(id) ? id : null;
  const category = validId ? getCategory(validId) : null;
  const isGated = category ? !category.free && !unlocked : false;

  // Guard against reaching a locked category's content directly (e.g. a
  // stale nav state from before a category was locked, or a deep link) --
  // bounce to the paywall instead of rendering premium content. Waits for
  // the entitlement check to resolve first so an owner who *has* purchased
  // never gets bounced on a slow read.
  useEffect(() => {
    if (!entitlementLoading && isGated && validId) {
      router.replace({ pathname: '/paywall', params: { categoryId: validId } });
    }
  }, [entitlementLoading, isGated, router, validId]);

  const refreshProgress = useCallback(() => {
    if (!validId) return;
    let cancelled = false;
    getCategoryProgress(validId).then((value) => {
      if (!cancelled) setProgress(value);
    });
    return () => {
      cancelled = true;
    };
  }, [validId]);

  useFocusEffect(
    useCallback(() => {
      return refreshProgress();
    }, [refreshProgress])
  );

  const handleTogglePracticed = useCallback(
    async (sectionId: string, nextValue: boolean) => {
      if (!validId) return;
      // Optimistic update so the checkbox flips instantly.
      setProgress((current) => ({ ...current, [sectionId]: nextValue }));
      await setSectionPracticed(validId, sectionId, nextValue);
    },
    [validId]
  );

  if (!category || !validId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <View style={styles.notFound}>
          <Text style={typography.title}>Category not found</Text>
          <Text style={typography.bodyMuted}>
            This category doesn&apos;t exist. Go back and pick one from the list.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // While gated (locked and not yet confirmed unlocked), render nothing
  // instead of a flash of premium content -- the effect above is already
  // navigating to the paywall.
  if (isGated || entitlementLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: category.title }} />
      </SafeAreaView>
    );
  }

  const total = category.sections.length;
  const practicedCount = category.sections.filter((section) => progress[section.id]).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: category.title }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <Text style={typography.bodyMuted}>{category.summary}</Text>
          {total > 0 && (
            <View style={styles.progressRow}>
              <View style={styles.progressBarWrap}>
                <ProgressBar ratio={practicedCount / total} height={8} />
              </View>
              <Text style={styles.progressLabel}>
                {practicedCount}/{total} practiced
              </Text>
            </View>
          )}
        </View>

        {category.sections.map((section) => {
          const practiced = Boolean(progress[section.id]);
          return (
            <View key={section.id} style={styles.sectionCard}>
              <Text style={typography.sectionHeading}>{section.heading}</Text>
              <View style={styles.sectionBodyWrap}>
                <SectionBody body={section.body} />
              </View>

              <Pressable
                onPress={() => handleTogglePracticed(section.id, !practiced)}
                style={styles.checkboxRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: practiced }}
                accessibilityLabel={`Mark "${section.heading}" as practiced`}
              >
                <Ionicons
                  name={practiced ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={practiced ? colors.success : colors.inkFaint}
                />
                <Text style={[styles.checkboxLabel, practiced && styles.checkboxLabelDone]}>
                  {practiced ? 'Practiced' : 'Mark as practiced'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBarWrap: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
  sectionBodyWrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkMuted,
  },
  checkboxLabelDone: {
    color: colors.success,
  },
});
