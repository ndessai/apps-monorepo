/**
 * Color Palette - Material Design 3
 *
 * Forest Green & Mint color scheme for school students:
 * - Forest green primary for natural, calming feel
 * - Mint accents for fresh, inviting tones
 * - Calming, nature-inspired colors
 * - High contrast for accessibility
 * - Support for light and dark themes
 */

export type ThemeMode = 'light' | 'dark';

// Light theme colors
export const lightColors = {
  // Primary - Forest Green
  primary: {
    main: '#2E7D32',      // Forest green
    light: '#4CAF50',     // Light green
    dark: '#1B5E20',      // Deep forest
    container: '#E8F5E9', // Light green container
    onPrimary: '#FFFFFF', // Text on primary
    onContainer: '#1B5E20', // Text on container
  },

  // Secondary - Mint
  secondary: {
    main: '#26A69A',      // Mint/Teal
    light: '#4DB6AC',     // Light mint
    dark: '#00897B',      // Deep teal
    container: '#E0F2F1', // Light mint container
    onSecondary: '#FFFFFF', // Text on secondary
    onContainer: '#004D40', // Text on container
  },

  // Tertiary - Lime accent
  tertiary: {
    main: '#7CB342',      // Lime green
    light: '#9CCC65',     // Light lime
    dark: '#558B2F',      // Deep lime
    container: '#F1F8E9', // Light lime container
    onTertiary: '#FFFFFF', // Text on tertiary
    onContainer: '#33691E', // Text on container
  },

  // Error - Red
  error: {
    main: '#E53935',
    light: '#EF5350',
    dark: '#C62828',
    container: '#FFEBEE',
    onError: '#FFFFFF',
    onContainer: '#5D1A1A',
  },

  // Warning - Amber
  warning: {
    main: '#FFA000',
    light: '#FFB74D',
    dark: '#FF8F00',
    container: '#FFF8E1',
    onWarning: '#000000',
    onContainer: '#5D4A00',
  },

  // Success - Green
  success: {
    main: '#43A047',
    light: '#66BB6A',
    dark: '#2E7D32',
    container: '#E8F5E9',
    onSuccess: '#FFFFFF',
    onContainer: '#1B5E20',
  },

  // Info - Blue
  info: {
    main: '#1976D2',
    light: '#42A5F5',
    dark: '#1565C0',
    container: '#E3F2FD',
    onInfo: '#FFFFFF',
    onContainer: '#0D47A1',
  },

  // Background - Clean neutral
  background: {
    default: '#FAFAFA',   // Very light gray
    paper: '#FFFFFF',     // Pure white for cards
    elevated: '#FFFFFF',  // Elevated surfaces
  },

  // Surface - Neutral surfaces
  surface: {
    default: '#FFFFFF',
    variant: '#F5F5F5',   // Very light gray tint
    tint: '#E8F5E9',      // Green tinted surface
    elevated: '#FFFFFF',
  },

  // Text - Pure neutral gray tones
  text: {
    primary: '#212121',    // Near black
    secondary: '#424242',  // Dark gray
    tertiary: '#757575',   // Medium gray
    disabled: '#BDBDBD',   // Disabled text
    onPrimary: '#FFFFFF',  // Text on primary color
    onSecondary: '#FFFFFF', // Text on secondary
    onBackground: '#212121', // Text on background
    onSurface: '#212121',   // Text on surface
  },

  // Divider and Borders
  divider: '#E0E0E0',      // Neutral divider
  border: {
    light: '#E0E0E0',
    main: '#BDBDBD',
    dark: '#9E9E9E',
  },

  // Overlay and Shadows
  overlay: {
    light: 'rgba(0, 0, 0, 0.04)',
    medium: 'rgba(0, 0, 0, 0.08)',
    heavy: 'rgba(0, 0, 0, 0.12)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },

  // Neutral palette (pure grays)
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

  // Green palette
  green: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Mint/Teal palette
  mint: {
    50: '#E0F2F1',
    100: '#B2DFDB',
    200: '#80CBC4',
    300: '#4DB6AC',
    400: '#26A69A',
    500: '#009688',
    600: '#00897B',
    700: '#00796B',
    800: '#00695C',
    900: '#004D40',
  },
} as const;

// Dark theme colors
export const darkColors = {
  // Primary - Brighter green for dark backgrounds
  primary: {
    main: '#66BB6A',       // Light green for CTAs
    light: '#81C784',      // Lighter green
    dark: '#4CAF50',       // Medium green
    container: '#1B5E20',  // Dark green container
    onPrimary: '#1B5E20',  // Text on primary (dark for contrast)
    onContainer: '#A5D6A7', // Text on container
  },

  // Secondary - Bright mint for dark mode
  secondary: {
    main: '#4DB6AC',       // Bright mint
    light: '#80CBC4',      // Light mint
    dark: '#26A69A',       // Medium mint
    container: '#004D40',  // Dark mint container
    onSecondary: '#004D40', // Text on secondary
    onContainer: '#B2DFDB', // Text on container
  },

  // Tertiary - Lime (lighter for dark mode)
  tertiary: {
    main: '#9CCC65',       // Light lime
    light: '#C5E1A5',      // Lighter lime
    dark: '#7CB342',       // Medium lime
    container: '#33691E',  // Dark lime container
    onTertiary: '#33691E', // Text on tertiary
    onContainer: '#DCEDC8', // Text on container
  },

  // Error - Red (lighter for dark mode)
  error: {
    main: '#EF5350',
    light: '#E57373',
    dark: '#E53935',
    container: '#5D1A1A',
    onError: '#FFFFFF',
    onContainer: '#FFCDD2',
  },

  // Warning - Amber (adjusted for dark mode)
  warning: {
    main: '#FFB74D',
    light: '#FFD54F',
    dark: '#FFA000',
    container: '#5D4A00',
    onWarning: '#000000',
    onContainer: '#FFE082',
  },

  // Success - Green (lighter for dark mode)
  success: {
    main: '#66BB6A',
    light: '#81C784',
    dark: '#43A047',
    container: '#1B5E20',
    onSuccess: '#1B5E20',
    onContainer: '#A5D6A7',
  },

  // Info - Blue (lighter for dark mode)
  info: {
    main: '#42A5F5',
    light: '#64B5F6',
    dark: '#1976D2',
    container: '#0D47A1',
    onInfo: '#0D47A1',
    onContainer: '#BBDEFB',
  },

  // Background - Deep neutral
  background: {
    default: '#121212',    // Material dark
    paper: '#1E1E1E',      // Slightly elevated dark
    elevated: '#2C2C2C',   // More elevated dark
  },

  // Surface - Elevated surfaces with neutral tones
  surface: {
    default: '#1E1E1E',    // Elevated from background for cards
    variant: '#2C2C2C',    // Variant surface
    tint: '#1B3D1E',       // Green tinted surface
    elevated: '#484848',   // High elevation for bottom sheets, modals
  },

  // Text - Light text on dark backgrounds
  text: {
    primary: '#FAFAFA',     // Near white
    secondary: '#B0BEC5',   // Light gray
    tertiary: '#78909C',    // Medium gray
    disabled: '#616161',    // Darker disabled
    onPrimary: '#212121',   // Text on primary color
    onSecondary: '#212121', // Text on secondary
    onBackground: '#FAFAFA', // Text on background
    onSurface: '#FAFAFA',    // Text on surface
  },

  // Divider and Borders - More visible in dark mode
  divider: '#383838',       // Brighter divider for visibility
  border: {
    light: '#383838',
    main: '#484848',
    dark: '#616161',
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
    100: '#383838',
    200: '#484848',
    300: '#616161',
    400: '#757575',
    500: '#9E9E9E',
    600: '#BDBDBD',
    700: '#E0E0E0',
    800: '#EEEEEE',
    900: '#FAFAFA',
  },

  // Green palette (adjusted for dark mode)
  green: {
    50: '#0D2810',
    100: '#1B5E20',
    200: '#2E7D32',
    300: '#388E3C',
    400: '#43A047',
    500: '#4CAF50',
    600: '#66BB6A',
    700: '#81C784',
    800: '#A5D6A7',
    900: '#C8E6C9',
  },

  // Mint/Teal palette (adjusted for dark mode)
  mint: {
    50: '#002822',
    100: '#004D40',
    200: '#00695C',
    300: '#00796B',
    400: '#00897B',
    500: '#009688',
    600: '#26A69A',
    700: '#4DB6AC',
    800: '#80CBC4',
    900: '#B2DFDB',
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
