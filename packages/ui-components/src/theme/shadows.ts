/**
 * Shadow & Elevation System - Material Design 3
 *
 * Consistent elevation with cool, subtle shadows
 */

import { ViewStyle } from 'react-native';

/**
 * iOS shadows with cool tones
 */
const iosShadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  } as ViewStyle,

  xs: {
    shadowColor: '#000000',  // Black shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  } as ViewStyle,

  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
  } as ViewStyle,

  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  } as ViewStyle,

  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  } as ViewStyle,

  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  } as ViewStyle,

  '2xl': {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.27,
    shadowRadius: 5.46,
  } as ViewStyle,
} as const;

/**
 * Android elevation values
 */
const androidElevation = {
  none: 0,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,
  '2xl': 12,
} as const;

/**
 * Platform-agnostic shadow function
 * Automatically applies correct shadow style based on platform
 */
export const shadow = (level: keyof typeof iosShadows): ViewStyle => {
  return {
    ...iosShadows[level],
    elevation: androidElevation[level],
  };
};

/**
 * Material Design 3 elevation levels mapped to shadow sizes
 */
export const elevation = {
  level0: shadow('none'),   // No elevation (flat surface)
  level1: shadow('xs'),     // Elevated cards, chips
  level2: shadow('sm'),     // Elevated buttons, FAB resting
  level3: shadow('md'),     // Dialogs, menus, elevated cards
  level4: shadow('lg'),     // Navigation drawer, bottom sheets
  level5: shadow('xl'),     // Modal bottom sheets, modal dialogs
} as const;

/**
 * Component-specific elevations
 */
export const componentElevation = {
  card: elevation.level1,
  button: elevation.level2,
  fab: elevation.level3,
  dialog: elevation.level3,
  bottomSheet: elevation.level4,
  modal: elevation.level5,
  appBar: elevation.level2,
  menu: elevation.level3,
} as const;

export type ShadowLevel = keyof typeof iosShadows;
export type ElevationLevel = keyof typeof elevation;
