import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

/**
 * Any valid icon name from @expo/vector-icons' Ionicons set.
 * Keeps content JSON honest against a real, typed icon library instead of a
 * loose string.
 */
export type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * One expandable section within a category (a sub-topic, a worked example,
 * a script, etc.). `body` is plain text that supports a very small
 * markdown-ish convention so content authors can write naturally:
 *  - "\n\n" starts a new paragraph
 *  - a line starting with "\n- " (i.e. a line beginning with "- ") is a
 *    bullet list item
 * Rendering code (in the UI stage) is responsible for interpreting this.
 */
export interface PlaybookSection {
  id: string;
  heading: string;
  body: string;
}

/**
 * One top-level category in the playbook (e.g. "The STAR Method").
 * This is the exact on-disk shape of every file in `content/`.
 */
export interface PlaybookCategory {
  id: string;
  title: string;
  free: boolean;
  icon: IoniconName;
  summary: string;
  sections: PlaybookSection[];
}

/** Per-section "practiced" completion state, keyed by section id. */
export type SectionProgress = Record<string, boolean>;

/** Per-category progress map, keyed by category id. */
export type CategoryProgressMap = Record<string, SectionProgress>;
