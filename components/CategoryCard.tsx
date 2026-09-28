import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadow, spacing, typography } from '../constants/theme';
import type { PlaybookCategory } from '../lib/types';
import type { ProgressSummary } from '../lib/progress';
import { ProgressBar } from './ProgressBar';

interface CategoryCardProps {
  category: PlaybookCategory;
  /** Whether this category's content is currently reachable (free, or purchased). */
  unlocked: boolean;
  /** Practiced/total section counts; undefined while progress is still loading. */
  progress?: ProgressSummary;
  onPress: () => void;
}

export function CategoryCard({ category, unlocked, progress, onPress }: CategoryCardProps) {
  const isLocked = !unlocked;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${category.title}${isLocked ? ', locked' : ''}`}
    >
      <View style={[styles.iconWrap, isLocked && styles.iconWrapLocked]}>
        <Ionicons
          name={category.icon}
          size={24}
          color={isLocked ? colors.locked : colors.primary}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={typography.cardTitle} numberOfLines={1}>
            {category.title}
          </Text>
          {isLocked && (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={11} color={colors.locked} />
              <Text style={styles.lockBadgeText}>Locked</Text>
            </View>
          )}
        </View>

        <Text style={typography.bodyMuted} numberOfLines={2}>
          {category.summary}
        </Text>

        {!isLocked && progress && progress.total > 0 && (
          <View style={styles.progressRow}>
            <View style={styles.progressBarWrap}>
              <ProgressBar ratio={progress.practiced / progress.total} />
            </View>
            <Text style={styles.progressLabel}>
              {progress.practiced}/{progress.total} practiced
            </Text>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    ...shadow.card,
  },
  cardPressed: {
    backgroundColor: colors.paper,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapLocked: {
    backgroundColor: colors.lockedTint,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.lockedTint,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  lockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.locked,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  progressBarWrap: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkMuted,
  },
});
