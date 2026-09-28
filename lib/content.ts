import type { PlaybookCategory } from './types';

/**
 * The fixed, ordered list of playbook category ids. This is the canonical
 * display order used throughout the app. Do not reorder, add, or remove
 * entries without a corresponding content/<id>.json file.
 */
export const CATEGORY_IDS = [
  'behavioral-basics',
  'star-method',
  'industry-tech',
  'industry-sales',
  'industry-healthcare',
  'industry-finance',
  'industry-marketing',
  'industry-customer-service',
  'salary-negotiation',
  'closing-strong',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

/**
 * Loads one category's JSON content file.
 *
 * Each `require(...)` call below uses a static string literal path, which
 * Metro (the Expo/React Native bundler) resolves at bundle time exactly
 * like a static `import` -- the JSON is inlined into the app bundle, with
 * no filesystem access or IO cost on-device. A per-case `require` (instead
 * of ten top-level `import` statements) is used deliberately so this file
 * type-checks cleanly even before every content/<id>.json exists; as each
 * one is authored it is picked up automatically with no other code changes.
 */
function requireCategoryFile(id: CategoryId): unknown {
  switch (id) {
    case 'behavioral-basics':
      return require('../content/behavioral-basics.json');
    case 'star-method':
      return require('../content/star-method.json');
    case 'industry-tech':
      return require('../content/industry-tech.json');
    case 'industry-sales':
      return require('../content/industry-sales.json');
    case 'industry-healthcare':
      return require('../content/industry-healthcare.json');
    case 'industry-finance':
      return require('../content/industry-finance.json');
    case 'industry-marketing':
      return require('../content/industry-marketing.json');
    case 'industry-customer-service':
      return require('../content/industry-customer-service.json');
    case 'salary-negotiation':
      return require('../content/salary-negotiation.json');
    case 'closing-strong':
      return require('../content/closing-strong.json');
  }
}

function isPlaybookCategory(value: unknown): value is PlaybookCategory {
  if (!value || typeof value !== 'object') return false;
  const category = value as Record<string, unknown>;
  return (
    typeof category.id === 'string' &&
    typeof category.title === 'string' &&
    typeof category.free === 'boolean' &&
    typeof category.icon === 'string' &&
    typeof category.summary === 'string' &&
    Array.isArray(category.sections)
  );
}

/**
 * Loads a single category by id.
 * Throws if content/<id>.json is missing, malformed, or its "id" field
 * does not match the filename -- that is a content bug to fix at the
 * source, not something to silently paper over.
 */
export function getCategory(id: CategoryId): PlaybookCategory {
  const data = requireCategoryFile(id);
  if (!isPlaybookCategory(data) || data.id !== id) {
    throw new Error(
      `content/${id}.json is missing, malformed, or its "id" field does not match the filename.`
    );
  }
  return data;
}

/**
 * Loads every category, in canonical order (CATEGORY_IDS). Used by the
 * category list screen. A single missing/malformed file is logged and
 * skipped rather than crashing the whole list, since content rolls out
 * category-by-category during development.
 */
export function getAllCategories(): PlaybookCategory[] {
  const categories: PlaybookCategory[] = [];
  for (const id of CATEGORY_IDS) {
    try {
      categories.push(getCategory(id));
    } catch (error) {
      if (__DEV__) {
        console.warn(`[content] Failed to load category "${id}":`, error);
      }
    }
  }
  return categories;
}

/** The 2 categories available without purchasing (#1-2). */
export function getFreeCategories(): PlaybookCategory[] {
  return getAllCategories().filter((category) => category.free);
}

/** The 8 categories locked behind the "full_playbook" entitlement (#3-10). */
export function getLockedCategories(): PlaybookCategory[] {
  return getAllCategories().filter((category) => !category.free);
}
