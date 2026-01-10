/**
 * React Native Paper Theme Configuration
 *
 * Maps our custom theme to React Native Paper's theme structure
 */

import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { lightColors, darkColors, type ThemeMode } from './colors';
import { fontFamily, fontWeight } from './typography';
import { radius } from './radius';

// For backwards compatibility
const colors = lightColors;

/**
 * Font configuration for React Native Paper
 */
const fontConfig = {
  displayLarge: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.semiBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.semiBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.semiBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.medium,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  default: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
} as const;

/**
 * Light theme for React Native Paper
 */
export const paperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.main,
    primaryContainer: colors.primary.container,
    onPrimary: colors.primary.onPrimary,
    onPrimaryContainer: colors.primary.onContainer,

    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.container,
    onSecondary: colors.secondary.onSecondary,
    onSecondaryContainer: colors.secondary.onContainer,

    tertiary: colors.tertiary.main,
    tertiaryContainer: colors.tertiary.container,
    onTertiary: colors.tertiary.onTertiary,
    onTertiaryContainer: colors.tertiary.onContainer,

    error: colors.error.main,
    errorContainer: colors.error.container,
    onError: colors.error.onError,
    onErrorContainer: colors.error.onContainer,

    background: colors.background.default,
    onBackground: colors.text.primary,

    surface: colors.surface.default,
    surfaceVariant: colors.surface.variant,
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,

    outline: colors.border.main,
    outlineVariant: colors.divider,

    shadow: colors.overlay.dark,
    scrim: colors.overlay.dark,

    inverseSurface: colors.neutral[800],
    inverseOnSurface: colors.neutral[50],
    inversePrimary: colors.primary.light,

    elevation: {
      level0: 'transparent',
      level1: colors.surface.default,
      level2: colors.surface.elevated,
      level3: colors.surface.elevated,
      level4: colors.surface.elevated,
      level5: colors.surface.elevated,
    },

    surfaceDisabled: `${colors.text.disabled}1F`, // 12% opacity
    onSurfaceDisabled: colors.text.disabled,
    backdrop: colors.overlay.dark,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: radius.md,
};

/**
 * Dark theme for React Native Paper
 */
export const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary.main,
    primaryContainer: darkColors.primary.container,
    onPrimary: darkColors.primary.onPrimary,
    onPrimaryContainer: darkColors.primary.onContainer,

    secondary: darkColors.secondary.main,
    secondaryContainer: darkColors.secondary.container,
    onSecondary: darkColors.secondary.onSecondary,
    onSecondaryContainer: darkColors.secondary.onContainer,

    tertiary: darkColors.tertiary.main,
    tertiaryContainer: darkColors.tertiary.container,
    onTertiary: darkColors.tertiary.onTertiary,
    onTertiaryContainer: darkColors.tertiary.onContainer,

    error: darkColors.error.main,
    errorContainer: darkColors.error.container,
    onError: darkColors.error.onError,
    onErrorContainer: darkColors.error.onContainer,

    background: darkColors.background.default,
    onBackground: darkColors.text.onBackground,

    surface: darkColors.surface.default,
    surfaceVariant: darkColors.surface.variant,
    onSurface: darkColors.text.onSurface,
    onSurfaceVariant: darkColors.text.secondary,

    outline: darkColors.border.main,
    outlineVariant: darkColors.divider,

    shadow: '#000000',
    scrim: '#000000',

    inverseSurface: darkColors.neutral[800],
    inverseOnSurface: darkColors.neutral[100],
    inversePrimary: lightColors.primary.main,

    elevation: {
      level0: 'transparent',
      level1: darkColors.surface.default,
      level2: darkColors.surface.variant,
      level3: darkColors.surface.elevated,
      level4: darkColors.surface.elevated,
      level5: darkColors.surface.elevated,
    },

    surfaceDisabled: `${darkColors.text.disabled}1F`, // 12% opacity
    onSurfaceDisabled: darkColors.text.disabled,
    backdrop: darkColors.overlay.dark,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: radius.md,
};

/**
 * Get Paper theme based on theme mode
 */
export const getPaperTheme = (themeMode: ThemeMode): MD3Theme => {
  return themeMode === 'dark' ? paperDarkTheme : paperLightTheme;
};

/**
 * Default export is light theme
 */
export const paperTheme = paperLightTheme;
