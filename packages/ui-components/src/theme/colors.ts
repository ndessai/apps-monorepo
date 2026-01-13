/**
 * Color Palette - Material Design 3
 *
 * Turquoise Sapphire Serenade color scheme with:
 * - Deep sapphire blue primary for elegance and depth
 * - Turquoise/teal accents for freshness and serenity
 * - Cool, calming tones throughout
 * - High contrast for accessibility
 * - Support for light and dark themes
 */

export type ThemeMode = 'light' | 'dark';

// Light theme colors
export const lightColors = {
  // Primary - Deep Sapphire Blue
  primary: {
    main: '#1E3A5F',      // Deep sapphire
    light: '#2E5984',     // Medium sapphire
    dark: '#0F1F33',      // Darker sapphire
    container: '#485c0cff', // Light sapphire container
    onPrimary: '#FFFFFF', // Text on primary
    onContainer: '#061425ff', // Text on container
  },

  // Secondary - Turquoise
  secondary: {
    main: '#40E0D0',      // Turquoise
    light: '#7FECE1',     // Light turquoise
    dark: '#20B2AA',      // Dark turquoise (Light Sea Green)
    container: '#E0F7F6', // Light turquoise container
    onSecondary: '#0F1F33', // Text on secondary (dark for contrast)
    onContainer: '#0D6B66', // Text on container
  },

  // Tertiary - Soft Teal accent
  tertiary: {
    main: '#5F9EA0',      // Cadet blue/teal
    light: '#88BFC1',     // Light teal
    dark: '#3D7A7C',      // Medium teal
    container: '#E5F2F2', // Light teal container
    onTertiary: '#FFFFFF', // Text on tertiary
    onContainer: '#2A5658', // Text on container
  },

  // Error - Coral Red (complementary to turquoise)
  error: {
    main: '#E74C3C',
    light: '#EC7063',
    dark: '#C0392B',
    container: '#FDEDEB',
    onError: '#FFFFFF',
    onContainer: '#922B21',
  },

  // Warning - Golden Amber
  warning: {
    main: '#F39C12',
    light: '#F7C156',
    dark: '#D68910',
    container: '#FEF5E6',
    onWarning: '#000000',
    onContainer: '#9A6209',
  },

  // Success - Sea Green
  success: {
    main: '#27AE60',
    light: '#58D68D',
    dark: '#1E8449',
    container: '#E9F7EF',
    onSuccess: '#FFFFFF',
    onContainer: '#145A32',
  },

  // Info - Ocean Blue
  info: {
    main: '#3498DB',
    light: '#5DADE2',
    dark: '#2E86C1',
    container: '#EBF5FB',
    onInfo: '#FFFFFF',
    onContainer: '#1A5276',
  },

  // Background - Serene light with subtle cool tint
  background: {
    default: '#F5F9FA',   // Very light cyan-gray
    paper: '#FFFFFF',     // Pure white for cards
    elevated: '#FFFFFF',  // Elevated surfaces
  },

  // Surface - Clean surfaces with cool undertones
  surface: {
    default: '#FFFFFF',
    variant: '#F0F5F6',   // Very light teal tint
    tint: '#E1EBF5',      // Sapphire tinted surface
    elevated: '#FFFFFF',
  },

  // Text - High contrast with cool undertones
  text: {
    primary: '#1A2A3A',    // Deep blue-gray
    secondary: '#4A6572',  // Cool gray secondary
    tertiary: '#7A8D97',   // Light cool gray
    disabled: '#A8B8C2',   // Disabled text
    onPrimary: '#FFFFFF',  // Text on primary color
    onSecondary: '#0F1F33', // Text on secondary
    onBackground: '#1A2A3A', // Text on background
    onSurface: '#1A2A3A',   // Text on surface
  },

  // Divider and Borders
  divider: '#D5E1E8',      // Cool divider
  border: {
    light: '#D5E1E8',
    main: '#B8CCD6',
    dark: '#9AB5C3',
  },

  // Overlay and Shadows
  overlay: {
    light: 'rgba(0, 0, 0, 0.04)',
    medium: 'rgba(0, 0, 0, 0.08)',
    heavy: 'rgba(0, 0, 0, 0.12)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },

  // Neutral palette (cool grays)
  neutral: {
    50: '#FAFBFC',
    100: '#F0F3F5',
    200: '#E1E7EB',
    300: '#CED6DC',
    400: '#A8B8C2',
    500: '#7A8D97',
    600: '#5A6D78',
    700: '#445560',
    800: '#2E3D47',
    900: '#1A2A3A',
  },

  // Turquoise palette
  turquoise: {
    50: '#E0F7F6',
    100: '#B3EFEA',
    200: '#80E6DD',
    300: '#4DDDD0',
    400: '#40E0D0',
    500: '#20C4B5',
    600: '#1AA99C',
    700: '#148D82',
    800: '#0D7269',
    900: '#075750',
  },

  // Sapphire palette
  sapphire: {
    50: '#E8EEF5',
    100: '#C5D5E8',
    200: '#9FB9D9',
    300: '#799DCA',
    400: '#5C87BE',
    500: '#4071B2',
    600: '#3661A0',
    700: '#2C4F88',
    800: '#233E70',
    900: '#1E3A5F',
  },
} as const;

// Dark theme colors
export const darkColors = {
  // Primary - Brighter sapphire for dark backgrounds (better CTA visibility)
  primary: {
    main: '#5B8BBF',       // Bright sapphire for CTAs
    light: '#7FA8D4',      // Lighter sapphire
    dark: '#3A6A9E',       // Medium sapphire
    container: '#1E3A5F',  // Dark sapphire container
    onPrimary: '#FFFFFF',  // Text on primary
    onContainer: '#B8D4F0', // Text on container
  },

  // Secondary - Turquoise (vibrant for dark mode)
  secondary: {
    main: '#40E0D0',       // Turquoise
    light: '#7FECE1',      // Light turquoise
    dark: '#20B2AA',       // Dark turquoise
    container: '#0D4A47',  // Dark turquoise container
    onSecondary: '#0F1F33', // Text on secondary
    onContainer: '#7FECE1', // Text on container
  },

  // Tertiary - Soft teal (lighter for dark mode)
  tertiary: {
    main: '#88BFC1',       // Light teal
    light: '#A8D4D6',      // Lighter teal
    dark: '#5F9EA0',       // Cadet blue
    container: '#2A4A4C',  // Dark teal container
    onTertiary: '#0F1F33', // Text on tertiary
    onContainer: '#B8E0E2', // Text on container
  },

  // Error - Coral (lighter for dark mode)
  error: {
    main: '#EC7063',
    light: '#F1948A',
    dark: '#E74C3C',
    container: '#5C1A14',
    onError: '#FFFFFF',
    onContainer: '#FADBD8',
  },

  // Warning - Golden (adjusted for dark mode)
  warning: {
    main: '#F7C156',
    light: '#F9D789',
    dark: '#F39C12',
    container: '#5A3D08',
    onWarning: '#000000',
    onContainer: '#FCE7B5',
  },

  // Success - Sea Green (lighter for dark mode)
  success: {
    main: '#58D68D',
    light: '#82E0AA',
    dark: '#27AE60',
    container: '#145A32',
    onSuccess: '#0F1F33',
    onContainer: '#ABEBC6',
  },

  // Info - Ocean Blue (lighter for dark mode)
  info: {
    main: '#5DADE2',
    light: '#85C1E9',
    dark: '#3498DB',
    container: '#1A4A6E',
    onInfo: '#0F1F33',
    onContainer: '#AED6F1',
  },

  // Background - Deep ocean dark
  background: {
    default: '#0D1821',    // Very dark sapphire (slightly lighter for contrast)
    paper: '#1A2836',      // Slightly elevated dark
    elevated: '#243340',   // More elevated dark
  },

  // Surface - Elevated surfaces with better contrast for CTAs
  surface: {
    default: '#1A2836',    // Elevated from background for cards
    variant: '#243340',    // Variant surface
    tint: '#2A3E50',       // Sapphire tinted surface (more visible)
    elevated: '#2E4456',   // High elevation for bottom sheets, modals
  },

  // Text - Light text on dark backgrounds
  text: {
    primary: '#F0F5F8',     // Off-white with cool tint
    secondary: '#B8CDD8',   // Light cool gray
    tertiary: '#7A9AAB',    // Medium cool gray
    disabled: '#4A6572',    // Darker disabled
    onPrimary: '#FFFFFF',   // Text on primary color
    onSecondary: '#0F1F33', // Text on secondary
    onBackground: '#F0F5F8', // Text on background
    onSurface: '#F0F5F8',    // Text on surface
  },

  // Divider and Borders - More visible in dark mode
  divider: '#3A4D5F',       // Brighter divider for visibility
  border: {
    light: '#3A4D5F',
    main: '#48607A',
    dark: '#567890',
  },

  // Overlay and Shadows
  overlay: {
    light: 'rgba(255, 255, 255, 0.04)',
    medium: 'rgba(255, 255, 255, 0.08)',
    heavy: 'rgba(255, 255, 255, 0.12)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },

  // Neutral palette (dark cool grays)
  neutral: {
    50: '#1A2A3A',
    100: '#2E3D47',
    200: '#445560',
    300: '#5A6D78',
    400: '#7A8D97',
    500: '#A8B8C2',
    600: '#CED6DC',
    700: '#E1E7EB',
    800: '#F0F3F5',
    900: '#FAFBFC',
  },

  // Turquoise palette (adjusted for dark mode)
  turquoise: {
    50: '#0A2A28',
    100: '#0D3D3A',
    200: '#105250',
    300: '#146866',
    400: '#1A8580',
    500: '#20A39B',
    600: '#40E0D0',
    700: '#7FECE1',
    800: '#B3F4EE',
    900: '#E0FCFA',
  },

  // Sapphire palette (adjusted for dark mode)
  sapphire: {
    50: '#0A1520',
    100: '#12202E',
    200: '#1A2D3D',
    300: '#233A4C',
    400: '#2C475B',
    500: '#35546A',
    600: '#5B8BBF',
    700: '#7FA8D4',
    800: '#A3C5E9',
    900: '#C7E2FE',
  },
} as const;

// Default colors (light theme) - for backwards compatibility
export const colors = lightColors;

// Get colors based on theme
export const getThemeColors = (theme: ThemeMode) => {
  return theme === 'dark' ? darkColors : lightColors;
};

// Type for color keys
export type ColorKey = keyof typeof lightColors;

// Utility to get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  // Simple implementation for hex colors
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
