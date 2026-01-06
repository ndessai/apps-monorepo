# Theme System - Material Design 3

Complete design system for consistent, professional UI across all apps in the monorepo.

## Overview

The theme system is centralized in the `@monorepo/ui-components` package, following Material Design 3 guidelines with a professional bluish color palette. All design tokens (colors, typography, spacing, shadows) are available for use in any app.

## Installation

The theme is automatically available when you use `@monorepo/ui-components`:

```typescript
import {
  colors,
  typography,
  spacing,
  radius,
  elevation,
  paperTheme
} from '@monorepo/ui-components';
```

## Color System

### Warm, Professional Palette

Our color system uses professional, trustworthy colors while maintaining professional appeal:

**Primary** - Deep Blue
- `colors.primary.main` - #1976D2
- `colors.primary.light` - #42A5F5
- `colors.primary.dark` - #1565C0
- `colors.primary.container` - #BBDEFB
- `colors.primary.onPrimary` - #FFFFFF
- `colors.primary.onContainer` - #0D47A1

**Secondary** - Cyan
- `colors.secondary.main` - #0097A7
- `colors.secondary.light` - #4DD0E1
- `colors.secondary.dark` - #00838F
- `colors.secondary.container` - #B2EBF2
- `colors.secondary.onSecondary` - #FFFFFF
- `colors.secondary.onContainer` - #0D47A1

**Tertiary** - Indigo
- `colors.tertiary.main` - #5E35B1
- `colors.tertiary.light` - #9575CD
- `colors.tertiary.dark` - #4527A0
- `colors.tertiary.container` - #D1C4E9
- `colors.tertiary.onTertiary` - #FFFFFF
- `colors.tertiary.onContainer` - #00251A

### Semantic Colors

**Error** - Red
- `colors.error.main` - #D32F2F
- `colors.error.light` - #EF5350
- `colors.error.dark` - #C62828
- `colors.error.container` - #FFEBEE
- `colors.error.onError` - #FFFFFF
- `colors.error.onContainer` - #3E0000

**Success** - Green
- `colors.success.main` - #388E3C
- `colors.success.light` - #66BB6A
- `colors.success.dark` - #2E7D32

**Warning** - Orange
- `colors.warning.main` - #0097A7
- `colors.warning.light` - #4DD0E1
- `colors.warning.dark` - #00838F

**Info** - Blue
- `colors.info.main` - #1976D2
- `colors.info.light` - #42A5F5
- `colors.info.dark` - #1565C0

### Background & Surface

**Background**
- `colors.background.default` - #F5F7FA (Warm cream)
- `colors.background.paper` - #FFFFFF

**Surface**
- `colors.surface.default` - #FFFFFF
- `colors.surface.variant` - #F5F5F5
- `colors.surface.elevated` - #FFFFFF

### Text Colors

- `colors.text.primary` - #212121 (87% opacity)
- `colors.text.secondary` - #757575 (60% opacity)
- `colors.text.disabled` - #BDBDBD (38% opacity)
- `colors.text.hint` - #9E9E9E (38% opacity)

### UI Elements

- `colors.divider` - #E0E0E0 (12% opacity)
- `colors.border.default` - #BDBDBD
- `colors.border.light` - #E0E0E0
- `colors.border.dark` - #9E9E9E

### Usage Example

```tsx
import { StyleSheet } from 'react-native';
import { colors } from '@monorepo/ui-components';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.default,
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
  },
  text: {
    color: colors.text.primary,
  },
  errorText: {
    color: colors.error.main,
  },
});
```

## Typography System

Material Design 3 type scale with carefully chosen sizes and weights.

### Display Variants (Large, impactful text)

```tsx
import { typography } from '@monorepo/ui-components';

// Display Large - 57px
<Text style={typography.displayLarge}>Hero Title</Text>

// Display Medium - 45px
<Text style={typography.displayMedium}>Section Title</Text>

// Display Small - 36px
<Text style={typography.displaySmall}>Card Title</Text>
```

### Headline Variants (Section headers)

```tsx
// Headline Large - 32px, semi-bold
<Text style={typography.headlineLarge}>Page Header</Text>

// Headline Medium - 28px, semi-bold
<Text style={typography.headlineMedium}>Section Header</Text>

// Headline Small - 24px, semi-bold
<Text style={typography.headlineSmall}>Subsection Header</Text>
```

### Title Variants (Card headers, list items)

```tsx
// Title Large - 22px, medium
<Text style={typography.titleLarge}>Card Title</Text>

// Title Medium - 16px, medium
<Text style={typography.titleMedium}>List Item Title</Text>

// Title Small - 14px, medium
<Text style={typography.titleSmall}>Compact Title</Text>
```

### Body Variants (Primary content)

```tsx
// Body Large - 16px
<Text style={typography.bodyLarge}>Main content text</Text>

// Body Medium - 14px (most common)
<Text style={typography.bodyMedium}>Secondary content</Text>

// Body Small - 12px
<Text style={typography.bodySmall}>Caption text</Text>
```

### Label Variants (Buttons, tabs, chips)

```tsx
// Label Large - 14px, medium
<Text style={typography.labelLarge}>Button Text</Text>

// Label Medium - 12px, medium
<Text style={typography.labelMedium}>Tab Label</Text>

// Label Small - 11px, medium
<Text style={typography.labelSmall}>Chip Label</Text>
```

### Font Utilities

```tsx
import { fontFamily, fontWeight, fontSize, letterSpacing } from '@monorepo/ui-components';

const customStyle = {
  fontFamily: fontFamily.medium,
  fontWeight: fontWeight.semiBold,
  fontSize: fontSize.xl,
  letterSpacing: letterSpacing.wide,
};
```

## Spacing System

8px base unit system for consistent spacing throughout the UI.

```tsx
import { spacing } from '@monorepo/ui-components';

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,        // 24px
    marginTop: spacing.md,      // 16px
    gap: spacing.sm,           // 8px
  },
});
```

### Spacing Scale

- `spacing.xs` - 4px (0.5 × base)
- `spacing.sm` - 8px (1 × base)
- `spacing.md` - 16px (2 × base)
- `spacing.lg` - 24px (3 × base)
- `spacing.xl` - 32px (4 × base)
- `spacing['2xl']` - 40px (5 × base)
- `spacing['3xl']` - 48px (6 × base)
- `spacing['4xl']` - 64px (8 × base)
- `spacing['5xl']` - 80px (10 × base)

### Component-Specific Spacing

```tsx
import { componentSpacing } from '@monorepo/ui-components';

const styles = StyleSheet.create({
  button: {
    paddingVertical: componentSpacing.button.vertical,    // 12px
    paddingHorizontal: componentSpacing.button.horizontal, // 24px
  },
  card: {
    padding: componentSpacing.card.padding,               // 16px
    marginBottom: componentSpacing.card.margin,           // 16px
  },
  input: {
    paddingVertical: componentSpacing.input.vertical,     // 12px
    paddingHorizontal: componentSpacing.input.horizontal, // 16px
  },
});
```

## Border Radius

Consistent rounded corners following Material Design 3.

```tsx
import { radius } from '@monorepo/ui-components';

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,      // 12px
  },
  button: {
    borderRadius: radius.lg,      // 16px
  },
  chip: {
    borderRadius: radius.full,    // 9999px (fully rounded)
  },
});
```

### Radius Scale

- `radius.none` - 0px
- `radius.xs` - 4px
- `radius.sm` - 8px
- `radius.md` - 12px
- `radius.lg` - 16px
- `radius.xl` - 20px
- `radius['2xl']` - 24px
- `radius['3xl']` - 28px
- `radius.full` - 9999px

### Component-Specific Radius

```tsx
import { componentRadius } from '@monorepo/ui-components';

const styles = StyleSheet.create({
  button: {
    borderRadius: componentRadius.button,  // 16px
  },
  card: {
    borderRadius: componentRadius.card,    // 12px
  },
  input: {
    borderRadius: componentRadius.input,   // 8px
  },
});
```

## Shadows & Elevation

Material Design 3 elevation system with cool, subtle shadows.

```tsx
import { elevation } from '@monorepo/ui-components';

const styles = StyleSheet.create({
  card: {
    ...elevation.level1,  // Subtle shadow
  },
  dialog: {
    ...elevation.level3,  // Medium shadow
  },
  modal: {
    ...elevation.level5,  // Strong shadow
  },
});
```

### Elevation Levels

- `elevation.level0` - No shadow (flat surface)
- `elevation.level1` - Elevated cards, chips
- `elevation.level2` - Elevated buttons, FAB resting
- `elevation.level3` - Dialogs, menus, elevated cards
- `elevation.level4` - Navigation drawer, bottom sheets
- `elevation.level5` - Modal bottom sheets, modal dialogs

### Component-Specific Elevation

```tsx
import { componentElevation } from '@monorepo/ui-components';

const styles = StyleSheet.create({
  card: {
    ...componentElevation.card,      // level1
  },
  button: {
    ...componentElevation.button,    // level2
  },
  dialog: {
    ...componentElevation.dialog,    // level3
  },
});
```

### Custom Shadow

```tsx
import { shadow } from '@monorepo/ui-components';

const styles = StyleSheet.create({
  custom: {
    ...shadow('lg'),  // Large shadow with Android elevation
  },
});
```

## React Native Paper Integration

The theme system includes pre-configured React Native Paper themes.

### Setup

```tsx
// App.tsx
import { PaperProvider } from 'react-native-paper';
import { paperTheme } from '@monorepo/ui-components';

function App() {
  return (
    <PaperProvider theme={paperTheme}>
      {/* Your app */}
    </PaperProvider>
  );
}
```

### Light & Dark Themes

```tsx
import { paperLightTheme, paperDarkTheme } from '@monorepo/ui-components';

// Use light theme
<PaperProvider theme={paperLightTheme}>

// Use dark theme
<PaperProvider theme={paperDarkTheme}>
```

### Accessing Theme in Components

```tsx
import { useTheme } from 'react-native-paper';

function MyComponent() {
  const theme = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.primary }}>
        Themed Text
      </Text>
    </View>
  );
}
```

## Complete Theme Object

Access the entire theme at once:

```tsx
import { theme } from '@monorepo/ui-components';

// Access everything through the theme object
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    ...theme.elevation.level1,
  },
  title: {
    ...theme.typography.headlineMedium,
    color: theme.colors.text.primary,
  },
});
```

## Best Practices

### 1. Always Use Theme Tokens

❌ **Don't:**
```tsx
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 8,
  },
});
```

✅ **Do:**
```tsx
import { colors, spacing, radius } from '@monorepo/ui-components';

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary.main,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
});
```

### 2. Use Semantic Colors

❌ **Don't:**
```tsx
<Text style={{ color: colors.primary.main }}>Error message</Text>
```

✅ **Do:**
```tsx
<Text style={{ color: colors.error.main }}>Error message</Text>
```

### 3. Use Typography Variants

❌ **Don't:**
```tsx
<Text style={{ fontSize: 24, fontWeight: '600' }}>Title</Text>
```

✅ **Do:**
```tsx
import { typography } from '@monorepo/ui-components';

<Text style={typography.headlineSmall}>Title</Text>
```

### 4. Consistent Spacing

❌ **Don't:**
```tsx
const styles = StyleSheet.create({
  container: {
    padding: 15,
    marginTop: 18,
    gap: 10,
  },
});
```

✅ **Do:**
```tsx
import { spacing } from '@monorepo/ui-components';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,    // 16px
    marginTop: spacing.lg,  // 24px
    gap: spacing.sm,        // 8px
  },
});
```

### 5. Use Elevation for Depth

❌ **Don't:**
```tsx
const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
```

✅ **Do:**
```tsx
import { elevation } from '@monorepo/ui-components';

const styles = StyleSheet.create({
  card: {
    ...elevation.level2,
  },
});
```

## Creating New Apps

When creating new apps using `yarn create-app`, the theme system is automatically integrated:

```bash
# Create a new app
yarn create-app MyNewApp

# The app will already have theme imports configured
# in App.tsx, screens, and components
```

## Extending the Theme

To add new design tokens, update the theme files in `packages/ui-components/src/theme/`:

1. **Colors**: Edit `colors.ts`
2. **Typography**: Edit `typography.ts`
3. **Spacing**: Edit `spacing.ts`
4. **Radius**: Edit `radius.ts`
5. **Shadows**: Edit `shadows.ts`

All apps using `@monorepo/ui-components` will automatically get the updates.

## Migration Guide

### From Hardcoded Colors

**Before:**
```tsx
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
  },
  text: {
    color: '#666',
  },
  button: {
    backgroundColor: '#6200ee',
  },
});
```

**After:**
```tsx
import { colors } from '@monorepo/ui-components';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.default,
  },
  text: {
    color: colors.text.secondary,
  },
  button: {
    backgroundColor: colors.primary.main,
  },
});
```

### From Hardcoded Spacing

**Before:**
```tsx
const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 10,
    gap: 12,
  },
});
```

**After:**
```tsx
import { spacing } from '@monorepo/ui-components';

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
});
```

## TypeScript Support

All theme tokens are fully typed:

```tsx
import { colors, spacing, typography } from '@monorepo/ui-components';
import type { RadiusKey, TypographyVariant, ShadowLevel } from '@monorepo/ui-components';

// TypeScript will autocomplete and validate
const myColor: string = colors.primary.main;
const mySpacing: number = spacing.lg;
const myRadius: RadiusKey = 'md';
```

## Resources

- [Material Design 3](https://m3.material.io/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Color Accessibility](https://material.io/design/color/the-color-system.html#color-accessibility)

## Related Documentation

- [CREATE_APP_GUIDE.md](CREATE_APP_GUIDE.md) - Using the app generator
- [STRUCTURE_GUIDE.md](STRUCTURE_GUIDE.md) - Folder structure conventions
- [BOILERPLATE_IMPLEMENTATION.md](BOILERPLATE_IMPLEMENTATION.md) - App architecture

---

**Theme Version**: 1.0.0
**Material Design**: 3
**Last Updated**: 2026-01-06
