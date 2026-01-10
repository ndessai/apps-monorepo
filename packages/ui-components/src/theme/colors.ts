/**
 * Color Palette - Material Design 3
 *
 * Professional bluish color scheme with:
 * - Blue primary colors for trust and professionalism
 * - Cool neutrals for backgrounds
 * - High contrast for accessibility
 * - Support for light and dark themes
 */

export type ThemeMode = 'light' | 'dark';

// Light theme colors
export const lightColors = {
  // Primary - Deep Navy Blue
  primary: {
    main: '#0D47A1',      // Deep navy blue
    light: '#1976D2',     // Medium blue
    dark: '#002171',      // Darker navy
    container: '#E3F2FD', // Light blue container
    onPrimary: '#FFFFFF', // Text on primary
    onContainer: '#0D47A1', // Text on container
  },

  // Secondary - Teal accent
  secondary: {
    main: '#00796B',      // Teal
    light: '#26A69A',     // Light teal
    dark: '#004D40',      // Dark teal
    container: '#E0F2F1', // Light container
    onSecondary: '#FFFFFF', // Text on secondary
    onContainer: '#004D40', // Text on container
  },

  // Tertiary - Indigo accent
  tertiary: {
    main: '#303F9F',      // Indigo
    light: '#5C6BC0',     // Light indigo
    dark: '#1A237E',      // Dark indigo
    container: '#E8EAF6', // Light container
    onTertiary: '#FFFFFF', // Text on tertiary
    onContainer: '#1A237E', // Text on container
  },

  // Error - Vibrant Red
  error: {
    main: '#C62828',
    light: '#EF5350',
    dark: '#B71C1C',
    container: '#FFEBEE',
    onError: '#FFFFFF',
    onContainer: '#B71C1C',
  },

  // Warning - Amber
  warning: {
    main: '#F9A825',
    light: '#FFD54F',
    dark: '#F57F17',
    container: '#FFF8E1',
    onWarning: '#000000',
    onContainer: '#F57F17',
  },

  // Success - Green
  success: {
    main: '#2E7D32',
    light: '#66BB6A',
    dark: '#1B5E20',
    container: '#E8F5E9',
    onSuccess: '#FFFFFF',
    onContainer: '#1B5E20',
  },

  // Info - Blue
  info: {
    main: '#1565C0',
    light: '#42A5F5',
    dark: '#0D47A1',
    container: '#E3F2FD',
    onInfo: '#FFFFFF',
    onContainer: '#0D47A1',
  },

  // Background - Subtle blue-gray for contrast with white cards
  background: {
    default: '#ECEFF1',   // Blue-gray background
    paper: '#FFFFFF',     // Pure white for cards
    elevated: '#FFFFFF',  // Elevated surfaces
  },

  // Surface - White cards stand out on gray background
  surface: {
    default: '#FFFFFF',
    variant: '#F5F5F5',
    tint: '#E3F2FD',      // Blue tinted surface
    elevated: '#FFFFFF',
  },

  // Text - High contrast
  text: {
    primary: '#1A1A2E',    // Near black with blue tint
    secondary: '#546E7A',  // Blue-gray secondary
    tertiary: '#78909C',   // Light blue-gray
    disabled: '#B0BEC5',   // Disabled text
    onPrimary: '#FFFFFF',  // Text on primary color
    onSecondary: '#FFFFFF', // Text on secondary
    onBackground: '#1A1A2E', // Text on background
    onSurface: '#1A1A2E',   // Text on surface
  },

  // Divider and Borders
  divider: '#CFD8DC',      // Blue-gray divider
  border: {
    light: '#CFD8DC',
    main: '#B0BEC5',
    dark: '#90A4AE',
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
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Warm palette
  warm: {
    50: '#FFF8F5',
    100: '#FFEBEE',
    200: '#FFCCBC',
    300: '#FFAB91',
    400: '#FF8A65',
    500: '#FF7043',
    600: '#F4511E',
    700: '#E64A19',
    800: '#D84315',
    900: '#BF360C',
  },
} as const;

// Dark theme colors
export const darkColors = {
  // Primary - Lighter blue for dark backgrounds
  primary: {
    main: '#64B5F6',       // Light blue
    light: '#90CAF9',      // Lighter blue
    dark: '#42A5F5',       // Medium blue
    container: '#1A237E',  // Dark blue container
    onPrimary: '#000000',  // Text on primary
    onContainer: '#90CAF9', // Text on container
  },

  // Secondary - Teal accent (lighter for dark mode)
  secondary: {
    main: '#4DB6AC',       // Light teal
    light: '#80CBC4',      // Lighter teal
    dark: '#26A69A',       // Medium teal
    container: '#004D40',  // Dark container
    onSecondary: '#000000', // Text on secondary
    onContainer: '#80CBC4', // Text on container
  },

  // Tertiary - Indigo accent (lighter for dark mode)
  tertiary: {
    main: '#7986CB',       // Light indigo
    light: '#9FA8DA',      // Lighter indigo
    dark: '#5C6BC0',       // Medium indigo
    container: '#1A237E',  // Dark container
    onTertiary: '#000000', // Text on tertiary
    onContainer: '#9FA8DA', // Text on container
  },

  // Error - Lighter red for dark mode
  error: {
    main: '#EF5350',
    light: '#E57373',
    dark: '#F44336',
    container: '#4E0000',
    onError: '#000000',
    onContainer: '#FFCDD2',
  },

  // Warning - Amber (adjusted for dark mode)
  warning: {
    main: '#FFD54F',
    light: '#FFE082',
    dark: '#FFC107',
    container: '#4E3B00',
    onWarning: '#000000',
    onContainer: '#FFE082',
  },

  // Success - Lighter green for dark mode
  success: {
    main: '#66BB6A',
    light: '#81C784',
    dark: '#4CAF50',
    container: '#1B3D1B',
    onSuccess: '#000000',
    onContainer: '#A5D6A7',
  },

  // Info - Lighter blue for dark mode
  info: {
    main: '#42A5F5',
    light: '#64B5F6',
    dark: '#2196F3',
    container: '#0D3B66',
    onInfo: '#000000',
    onContainer: '#90CAF9',
  },

  // Background - Dark surfaces
  background: {
    default: '#121212',    // Material dark background
    paper: '#1E1E1E',      // Slightly elevated dark
    elevated: '#2C2C2C',   // More elevated dark
  },

  // Surface - Dark cards
  surface: {
    default: '#1E1E1E',
    variant: '#2C2C2C',
    tint: '#1A237E',       // Dark blue tinted surface
    elevated: '#383838',
  },

  // Text - Light text on dark backgrounds
  text: {
    primary: '#FFFFFF',     // Pure white
    secondary: '#B0BEC5',   // Light blue-gray
    tertiary: '#78909C',    // Medium blue-gray
    disabled: '#546E7A',    // Darker disabled
    onPrimary: '#000000',   // Text on primary color
    onSecondary: '#000000', // Text on secondary
    onBackground: '#FFFFFF', // Text on background
    onSurface: '#FFFFFF',    // Text on surface
  },

  // Divider and Borders
  divider: '#37474F',       // Dark blue-gray divider
  border: {
    light: '#455A64',
    main: '#546E7A',
    dark: '#607D8B',
  },

  // Overlay and Shadows
  overlay: {
    light: 'rgba(255, 255, 255, 0.04)',
    medium: 'rgba(255, 255, 255, 0.08)',
    heavy: 'rgba(255, 255, 255, 0.12)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },

  // Neutral palette (dark grays)
  neutral: {
    50: '#212121',
    100: '#303030',
    200: '#424242',
    300: '#616161',
    400: '#757575',
    500: '#9E9E9E',
    600: '#BDBDBD',
    700: '#E0E0E0',
    800: '#EEEEEE',
    900: '#FAFAFA',
  },

  // Warm palette (adjusted for dark mode)
  warm: {
    50: '#3E2723',
    100: '#4E342E',
    200: '#5D4037',
    300: '#6D4C41',
    400: '#795548',
    500: '#8D6E63',
    600: '#A1887F',
    700: '#BCAAA4',
    800: '#D7CCC8',
    900: '#EFEBE9',
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
