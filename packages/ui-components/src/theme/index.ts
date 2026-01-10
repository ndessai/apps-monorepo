/**
 * Design System Theme - Material Design 3
 *
 * Professional, warm, accessible design tokens
 * for consistent UI across all apps
 */

export { colors, lightColors, darkColors, getThemeColors } from './colors';
export type { ThemeMode } from './colors';
export { typography, fontFamily, fontWeight, fontSize, letterSpacing, lineHeight } from './typography';
export { spacing, componentSpacing } from './spacing';
export { radius, componentRadius } from './radius';
export { shadow, elevation, componentElevation } from './shadows';
export { paperTheme, paperLightTheme, paperDarkTheme, getPaperTheme } from './paperTheme';

export type { RadiusKey } from './radius';
export type { TypographyVariant } from './typography';
export type { ShadowLevel, ElevationLevel } from './shadows';

// Re-export everything as a single theme object for convenience
import { colors } from './colors';
import { typography, fontFamily, fontWeight, fontSize, letterSpacing, lineHeight } from './typography';
import { spacing, componentSpacing } from './spacing';
import { radius, componentRadius } from './radius';
import { shadow, elevation, componentElevation } from './shadows';

export const theme = {
  colors,
  typography,
  fontFamily,
  fontWeight,
  fontSize,
  letterSpacing,
  lineHeight,
  spacing,
  componentSpacing,
  radius,
  componentRadius,
  shadow,
  elevation,
  componentElevation,
} as const;

export type Theme = typeof theme;
