/**
 * Border Radius System
 *
 * Consistent rounded corners following Material Design 3
 */

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,  // Fully rounded
} as const;

// Component-specific radius
export const componentRadius = {
  button: radius.lg,
  card: radius.md,
  input: radius.sm,
  chip: radius.full,
  dialog: radius.xl,
  sheet: radius['2xl'],
} as const;

export type RadiusKey = keyof typeof radius;
