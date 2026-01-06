/**
 * Color Palette - Material Design 3
 *
 * Professional bluish color scheme with:
 * - Blue primary colors for trust and professionalism
 * - Cool neutrals for backgrounds
 * - High contrast for accessibility
 */

export const colors = {
  // Primary - Professional Blue
  primary: {
    main: '#1976D2',      // Material Blue
    light: '#42A5F5',     // Light blue
    dark: '#1565C0',      // Dark blue
    container: '#BBDEFB', // Light container
    onPrimary: '#FFFFFF', // Text on primary
    onContainer: '#0D47A1', // Text on container
  },

  // Secondary - Cyan/Teal
  secondary: {
    main: '#0097A7',      // Cyan
    light: '#4DD0E1',     // Light cyan
    dark: '#00838F',      // Dark cyan
    container: '#B2EBF2', // Light container
    onSecondary: '#FFFFFF', // Text on secondary
    onContainer: '#006064', // Text on container
  },

  // Tertiary - Indigo (accent)
  tertiary: {
    main: '#5E35B1',      // Deep purple/indigo
    light: '#9575CD',     // Light purple
    dark: '#4527A0',      // Dark purple
    container: '#D1C4E9', // Light container
    onTertiary: '#FFFFFF', // Text on tertiary
    onContainer: '#311B92', // Text on container
  },

  // Error - Material Red
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
    container: '#FFCDD2',
    onError: '#FFFFFF',
    onContainer: '#B71C1C',
  },

  // Warning - Warm Orange
  warning: {
    main: '#F57C00',
    light: '#FFB74D',
    dark: '#E65100',
    container: '#FFE0B2',
    onWarning: '#FFFFFF',
    onContainer: '#E65100',
  },

  // Success - Warm Green
  success: {
    main: '#689F38',
    light: '#9CCC65',
    dark: '#558B2F',
    container: '#DCEDC8',
    onSuccess: '#FFFFFF',
    onContainer: '#33691E',
  },

  // Info - Warm Blue
  info: {
    main: '#1976D2',
    light: '#64B5F6',
    dark: '#1565C0',
    container: '#BBDEFB',
    onInfo: '#FFFFFF',
    onContainer: '#0D47A1',
  },

  // Background - Cool neutrals
  background: {
    default: '#F5F7FA',   // Cool light blue-gray
    paper: '#FFFFFF',     // Pure white for cards
    elevated: '#FFFFFF',  // Elevated surfaces
  },

  // Surface - Cool grays
  surface: {
    default: '#FFFFFF',
    variant: '#F5F5F5',
    tint: '#E3F2FD',      // Cool blue tinted surface
    elevated: '#FFFFFF',
  },

  // Text - High contrast cool grays
  text: {
    primary: '#212121',    // Dark gray (87% opacity)
    secondary: '#757575',  // Medium gray (60% opacity)
    tertiary: '#9E9E9E',   // Light gray
    disabled: '#BDBDBD',   // Disabled text (38% opacity)
    onPrimary: '#FFFFFF',  // Text on primary color
    onSecondary: '#FFFFFF', // Text on secondary
    onBackground: '#212121', // Text on background
    onSurface: '#212121',   // Text on surface
  },

  // Divider and Borders
  divider: '#E0E0E0',      // Cool light gray
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

// Type for color keys
export type ColorKey = keyof typeof colors;

// Utility to get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  // Simple implementation for hex colors
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
