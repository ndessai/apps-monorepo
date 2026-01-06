/**
 * Spacing System - 8px base unit
 *
 * Consistent spacing following Material Design guidelines
 */

// Base unit: 8px
const BASE_UNIT = 8;

export const spacing = {
  xs: BASE_UNIT * 0.5,    // 4px
  sm: BASE_UNIT,          // 8px
  md: BASE_UNIT * 2,      // 16px
  lg: BASE_UNIT * 3,      // 24px
  xl: BASE_UNIT * 4,      // 32px
  '2xl': BASE_UNIT * 5,   // 40px
  '3xl': BASE_UNIT * 6,   // 48px
  '4xl': BASE_UNIT * 8,   // 64px
  '5xl': BASE_UNIT * 10,  // 80px
} as const;

// Padding presets
export const padding = {
  none: 0,
  xs: spacing.xs,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
} as const;

// Margin presets
export const margin = {
  none: 0,
  xs: spacing.xs,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
} as const;

// Gap for flexbox/grid
export const gap = {
  none: 0,
  xs: spacing.xs,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
} as const;

export type SpacingKey = keyof typeof spacing;
