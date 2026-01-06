# BoilerplateApp Structure Guide

## Overview

The BoilerplateApp has been restructured with an industry-standard folder organization and enhanced with modern React Native features.

## Key Changes

### 1. Folder Structure ✅

```
apps/BoilerplateApp/
├── src/
│   ├── components/        # App-specific reusable components
│   │   ├── SwipeableCard.tsx
│   │   └── index.ts
│   ├── screens/           # Screen components
│   │   ├── HelloScreen.tsx
│   │   ├── SecondScreen.tsx
│   │   └── index.ts
│   ├── navigation/        # Navigation setup
│   │   └── BottomTabNavigator.tsx
│   ├── providers/         # Context providers
│   │   └── QueryProvider.tsx
│   ├── services/          # API & external services
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   ├── constants/         # App constants
│   ├── types/             # TypeScript types
│   │   └── navigation.ts
│   ├── assets/            # Static assets
│   └── README.md          # Folder structure guide
├── App.tsx                # Root component
├── index.js               # Entry point
└── package.json
```

### 2. State Management - React Query ✅

**Package**: `@tanstack/react-query` v5.90.16

**Setup**:
- Configured in: `src/providers/QueryProvider.tsx`
- Wraps the entire app in `App.tsx`
- Default settings:
  - Retry: 2 attempts
  - Stale time: 5 minutes
  - Cache time: 10 minutes

**Usage Example** (see `SecondScreen.tsx`):
```tsx
const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ['secondScreenData'],
  queryFn: fetchData,
});
```

### 3. Bottom Tab Navigation ✅

**Package**: `@react-navigation/bottom-tabs` v7.9.0

**Implementation**:
- Navigator: `src/navigation/BottomTabNavigator.tsx`
- Two tabs: Home (HelloScreen) and Data (SecondScreen)
- Material Community Icons for tab icons
- Type-safe with TypeScript

**Tabs**:
- **Home Tab**: Rocket icon, displays HelloScreen with swipeable cards
- **Data Tab**: Chart icon, displays SecondScreen with React Query demo

### 4. Gesture Handling ✅

**Package**: `react-native-gesture-handler` v2.30.0

**Implementation**:
- Swipeable cards in `src/components/SwipeableCard.tsx`
- Delete action revealed on left swipe
- Smooth animations with Animated API
- Must import at app entry (`index.js`)

**Features**:
- Swipe left to reveal delete button
- Confirmation alert before deletion
- Smooth scale animation
- Card removal from list

### 5. Screen Components

#### HelloScreen (`src/screens/HelloScreen.tsx`)
- **Features**:
  - Rocket icon with greeting
  - List of swipeable cards
  - Card deletion with confirmation
  - State management with `useState`

#### SecondScreen (`src/screens/SecondScreen.tsx`)
- **Features**:
  - React Query integration demo
  - Data fetching with loading states
  - Refresh functionality
  - Feature list with checkmarks
  - Scrollable content

## Dependencies Added

```json
{
  "@tanstack/react-query": "^5.90.16",
  "react-native-gesture-handler": "^2.30.0",
  "@react-navigation/bottom-tabs": "^7.9.0"
}
```

## Code Organization Guidelines

### When to Keep in App
- Components used only in this specific app
- App-specific business logic
- Custom screens and flows

### When to Move to Packages
- Components used across 2+ apps in the monorepo
- Generic, highly reusable utilities
- Shared TypeScript types
- Common UI patterns

**Decision Process**:
As you develop, explicitly request components to be moved to `packages/ui-components` when they become shared across apps.

## Running the App

### iOS
```bash
cd /Users/ndessai/projects/apps-monorepo/apps/BoilerplateApp
npx react-native run-ios
```

### Android
```bash
cd /Users/ndessai/projects/apps-monorepo/apps/BoilerplateApp
npx react-native run-android
```

## App Features Demonstration

### Home Screen
1. **Rocket Icon**: Material Community Icons integration
2. **Welcome Text**: React Native Paper Text components
3. **Swipeable Cards**:
   - Swipe left on any card
   - Delete button appears on the right
   - Tap delete to show confirmation
   - Card animates out when deleted

### Data Screen
1. **React Query Demo**:
   - Auto-fetches data on mount
   - Shows loading state
   - Displays fetched data with timestamp
   - "Refresh Data" button to refetch
2. **Feature List**: Shows all implemented features with checkmarks

## TypeScript Support

- Fully typed navigation with `ReactNavigation` namespace
- Type-safe route params via `BottomTabParamList`
- Component props properly typed
- IntelliSense support throughout

## Next Steps

1. **Add API Services**: Create files in `src/services/` for backend integration
2. **Custom Hooks**: Add reusable hooks in `src/hooks/`
3. **More Screens**: Create additional screens as needed
4. **Shared Components**: Move generic components to packages when they're used across multiple apps

## File Summary

**Created**:
- `src/screens/HelloScreen.tsx` - Home screen with swipeable cards
- `src/screens/SecondScreen.tsx` - Data screen with React Query
- `src/components/SwipeableCard.tsx` - Swipeable card component
- `src/navigation/BottomTabNavigator.tsx` - Bottom tab navigator
- `src/providers/QueryProvider.tsx` - React Query provider
- `src/types/navigation.ts` - Navigation type definitions
- `src/README.md` - Folder structure documentation

**Modified**:
- `App.tsx` - Updated to use new navigation and providers
- `index.js` - Added gesture handler import
- `package.json` - Added new dependencies

## Notes

- The original `HelloScreen` from `packages/ui-components` is no longer used
- All app-specific code now lives in `src/` directory
- Gesture handler must be imported first in `index.js`
- React Query provider wraps navigation for access in all screens
