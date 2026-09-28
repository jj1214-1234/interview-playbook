/**
 * Interview Playbook design tokens.
 *
 * Single source of truth for color, spacing, radius, and type-scale
 * constants. Screens and components should import from here rather than
 * hard-coding hex values or magic numbers -- that's what keeps the app
 * looking like one deliberate product instead of a pile of ad hoc screens.
 *
 * Palette intent: clean and professional (a career tool, not a toy), with
 * warmth coming from the paper-toned neutrals and an amber accent rather
 * than from bright/playful colors. Primary brand color is a deep teal --
 * confident without being cold navy/corporate-blue.
 */

export const colors = {
  // Brand
  primary: '#1F4B43',
  primaryDark: '#153631',
  primaryTint: '#E5EFEC',

  // Warm accent (progress, CTAs that aren't the primary purchase button)
  accent: '#C97A3B',
  accentTint: '#F7E9DA',

  // Neutrals (warm, not pure gray)
  ink: '#211D19',
  inkMuted: '#6F6A63',
  inkFaint: '#A39D93',
  paper: '#FBF8F4',
  surface: '#FFFFFF',
  border: '#E7E0D6',
  borderStrong: '#D8CEC1',

  // Status
  success: '#3E7B4F',
  successTint: '#E6F0E8',
  locked: '#8A8177',
  lockedTint: '#EFEBE4',
  danger: '#B3402C',
  dangerTint: '#F7E7E3',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  screenTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.ink,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.ink,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.ink,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.ink,
    lineHeight: 22,
  },
  bodyMuted: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.inkMuted,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
} as const;
