import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryCard } from '../components/CategoryCard';
import { spacing, typography } from '../constants/theme';
import { getAllCategories } from '../lib/content';
import { getProgressSummaries, type ProgressSummary } from '../lib/progress';
import { useEntitlement } from '../lib/purchases';
import type { PlaybookCategory } from '../lib/types';

// Static content -- loaded once at module scope. lib/content.ts's
// require()-based loader reads from bundled JSON, so this never changes
// at runtime and doesn't need to live in state.
const categories = getAllCategories();

export default function CategoryListScreen() {
  const router = useRouter();
  const { unlocked } = useEntitlement();
  const [progressByCategory, setProgressByCategory] = useState<
    Record<string, ProgressSummary>
  >({});

  // Re-read local progress every time this screen regains focus -- covers
  // both "checked a few boxes in a category and came back" and "just
  // unlocked the full playbook and came back from the paywall".
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getProgressSummaries(categories).then((summaries) => {
        if (!cancelled) setProgressByCategory(summaries);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const handlePressCategory = useCallback(
    (category: PlaybookCategory) => {
      const isReachable = category.free || unlocked;
      if (isReachable) {
        router.push({ pathname: '/category/[id]', params: { id: category.id } });
      } else {
        router.push({ pathname: '/paywall', params: { categoryId: category.id } });
      }
    },
    [router, unlocked]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={typography.bodyMuted}>
              Ten categories of real, specific interview content -- worked STAR
              examples, question banks with answer frameworks, and word-for-word
              negotiation scripts. Your practiced checkmarks are saved on this device.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            unlocked={item.free || unlocked}
            progress={progressByCategory[item.id]}
            onPress={() => handlePressCategory(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  listHeader: {
    marginBottom: spacing.lg,
  },
  separator: {
    height: spacing.md,
  },
});
