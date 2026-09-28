import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PlaybookCategory, SectionProgress } from './types';

/**
 * Local "practiced" checkbox persistence for free-category sections.
 *
 * Storage shape: one AsyncStorage entry per category, keyed
 * `progress:<categoryId>`, holding a JSON-encoded SectionProgress map
 * (`{ [sectionId]: boolean }`). Namespacing by category (rather than one
 * giant blob, or one key per section) keeps reads/writes cheap and keeps
 * category+section scoping unambiguous even though section ids are only
 * unique within their own category.
 */

function progressKey(categoryId: string): string {
  return `progress:${categoryId}`;
}

/** Reads the practiced/not-practiced state for every section in one category. */
export async function getCategoryProgress(categoryId: string): Promise<SectionProgress> {
  try {
    const raw = await AsyncStorage.getItem(progressKey(categoryId));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as SectionProgress;
    }
    return {};
  } catch (error) {
    if (__DEV__) {
      console.warn(`[progress] Failed to read progress for "${categoryId}":`, error);
    }
    return {};
  }
}

/**
 * Sets one section's practiced state and persists the whole category map.
 * Returns the updated map so callers can update local state without a
 * second read.
 */
export async function setSectionPracticed(
  categoryId: string,
  sectionId: string,
  practiced: boolean
): Promise<SectionProgress> {
  const current = await getCategoryProgress(categoryId);
  const next: SectionProgress = { ...current, [sectionId]: practiced };
  try {
    await AsyncStorage.setItem(progressKey(categoryId), JSON.stringify(next));
  } catch (error) {
    if (__DEV__) {
      console.warn(`[progress] Failed to save progress for "${categoryId}":`, error);
    }
  }
  return next;
}

export interface ProgressSummary {
  practiced: number;
  total: number;
}

/** Counts practiced sections against a category's real section list. */
export function summarizeProgress(
  progress: SectionProgress,
  category: PlaybookCategory
): ProgressSummary {
  const total = category.sections.length;
  let practiced = 0;
  for (const section of category.sections) {
    if (progress[section.id]) practiced += 1;
  }
  return { practiced, total };
}

/**
 * Reads and summarizes progress for a whole list of categories in one
 * pass -- used by the category list screen to show "X/Y practiced" per
 * card without every card managing its own AsyncStorage read.
 */
export async function getProgressSummaries(
  categories: PlaybookCategory[]
): Promise<Record<string, ProgressSummary>> {
  const entries = await Promise.all(
    categories.map(async (category) => {
      const progress = await getCategoryProgress(category.id);
      return [category.id, summarizeProgress(progress, category)] as const;
    })
  );
  return Object.fromEntries(entries);
}
