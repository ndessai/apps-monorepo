# BoilerplateApp Source Structure

## Folder Organization

```
src/
├── components/          # Reusable UI components (app-specific)
│   ├── SwipeableCard.tsx
│   └── index.ts
├── screens/            # Screen components (full pages)
│   ├── HelloScreen.tsx
│   ├── SecondScreen.tsx
│   └── index.ts
├── navigation/         # Navigation configuration
│   └── BottomTabNavigator.tsx
├── providers/          # Context providers and wrappers
│   └── QueryProvider.tsx
├── services/           # API calls and external services
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── constants/          # App constants and configuration
├── types/              # TypeScript type definitions
│   └── navigation.ts
└── assets/             # Static assets (images, fonts, etc.)
```

## Directory Guidelines

### `/components`
- **Purpose**: Reusable UI components specific to this app
- **When to use**: Components used across multiple screens in this app
- **When to move to packages**: When a component is needed across multiple apps in the monorepo

### `/screens`
- **Purpose**: Full-screen components that represent app pages/views
- **Convention**: Each screen should handle its own layout and compose smaller components
- **Example**: `HelloScreen.tsx`, `SecondScreen.tsx`

### `/navigation`
- **Purpose**: Navigation configuration and navigators
- **Contents**: Bottom tabs, stack navigators, drawer navigators
- **Example**: `BottomTabNavigator.tsx`

### `/providers`
- **Purpose**: React Context providers and global state wrappers
- **Example**: `QueryProvider.tsx` (React Query configuration)

### `/services`
- **Purpose**: API clients, data fetching logic, external integrations
- **Convention**: Separate files for each API domain (e.g., `userService.ts`, `authService.ts`)

### `/hooks`
- **Purpose**: Custom React hooks for reusable logic
- **Convention**: Prefix with `use` (e.g., `useAuth.ts`, `useDebounce.ts`)

### `/utils`
- **Purpose**: Pure utility functions and helpers
- **Convention**: Small, focused files (e.g., `formatters.ts`, `validators.ts`)

### `/constants`
- **Purpose**: App-wide constants, configuration values, enums
- **Example**: `colors.ts`, `apiEndpoints.ts`, `config.ts`

### `/types`
- **Purpose**: TypeScript type definitions and interfaces
- **Convention**: Domain-specific type files (e.g., `navigation.ts`, `api.ts`, `models.ts`)

### `/assets`
- **Purpose**: Static files like images, fonts (not managed by metro)
- **Note**: Icon fonts are managed separately via react-native-vector-icons

## State Management

This app uses **React Query** (`@tanstack/react-query`) for server state management:
- Configured in `src/providers/QueryProvider.tsx`
- Use `useQuery` for data fetching
- Use `useMutation` for data mutations
- See `SecondScreen.tsx` for example usage

## Navigation

This app uses **React Navigation** with bottom tabs:
- Main navigator: `BottomTabNavigator.tsx`
- Type-safe navigation with TypeScript
- Navigation types defined in `src/types/navigation.ts`

## Component Patterns

### Gesture Handling
- Uses `react-native-gesture-handler` for swipe gestures
- Example: `SwipeableCard.tsx` component
- Must import at app entry point (`index.js`)

### UI Components
- Material Design via `react-native-paper`
- Vector icons via `react-native-vector-icons`
- All 19 icon font families available

## Moving to Shared Packages

When a component becomes useful across multiple apps:
1. Move to `packages/ui-components/src/`
2. Export from `packages/ui-components/src/index.tsx`
3. Import in apps using `@monorepo/ui-components`

**Decision criteria**:
- Used in 2+ apps → Move to packages
- App-specific customization → Keep in app
- Highly reusable, generic → Move to packages
