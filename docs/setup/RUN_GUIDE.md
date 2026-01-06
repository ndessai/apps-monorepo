# BoilerplateApp - Run Guide 🚀

## Status: ✅ READY TO RUN

Both iOS and Android are working perfectly!

## Quick Start

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

## What You'll See

### Home Screen (Tab 1)
- 🚀 **Purple rocket icon** at the top
- **"Hello!" title** with welcome message
- **Two swipeable cards**:
  1. "Swipeable Card" - Try swiping this!
  2. "Another Card" - Swipe this one too!

**Interactions**:
- Swipe left on any card → Red delete button appears
- Tap delete → Confirmation dialog
- Confirm → Card animates away

### Data Screen (Tab 2)
- 📈 **Blue chart icon** at the top
- **"Second Screen" title**
- **React Query Demo Card**:
  - Shows loading state
  - Displays fetched data with timestamp
  - "Refresh Data" button to refetch
- **Features Card**:
  - ✅ Bottom Tab Navigation
  - ✅ React Query for State Management
  - ✅ Swipeable Cards with Gestures
  - ✅ Industry Standard Folder Structure

### Bottom Navigation
- 🏠 **Home** tab - Purple when active
- 📈 **Data** tab - Purple when active
- Tap between tabs to switch screens

## Features Implemented

### 1. Industry-Standard Folder Structure
```
src/
├── components/     # Reusable components
├── screens/        # Screen components
├── navigation/     # Navigation config
├── providers/      # React Query setup
├── services/       # API calls (ready)
├── hooks/          # Custom hooks (ready)
├── utils/          # Utilities (ready)
├── constants/      # Constants (ready)
├── types/          # TypeScript types
└── assets/         # Static files (ready)
```

### 2. React Query State Management
- Package: `@tanstack/react-query` v5.90.16
- Configured with optimal defaults
- Demo in SecondScreen with data fetching
- Caching, refetching, loading states

### 3. Bottom Tab Navigation
- Package: `@react-navigation/bottom-tabs` v7.9.0
- Material Community Icons
- Type-safe navigation
- Custom styling

### 4. Gesture Handling
- Package: `react-native-gesture-handler` v2.30.0
- Swipeable cards with delete action
- Smooth animations
- Confirmation dialogs

### 5. UI Components
- React Native Paper v5.12.5
- Material Design
- Cards, Buttons, Text components
- All 19 icon font families available

## Troubleshooting

### iOS Build Issues
If you encounter build errors:
```bash
cd ios
rm -rf Pods build
bundle exec pod install
cd ..
npx react-native run-ios
```

### Android Build Issues
If you encounter build errors:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Metro Bundler Issues
If you see module resolution errors:
```bash
# Reset Metro cache
npx react-native start --reset-cache
```

## Development Workflow

### Adding New Screens
1. Create in `src/screens/YourScreen.tsx`
2. Add to navigator in `src/navigation/BottomTabNavigator.tsx`
3. Export from `src/screens/index.ts`

### Adding New Components
1. Create in `src/components/YourComponent.tsx`
2. Export from `src/components/index.ts`
3. Use in screens

### Using React Query
```tsx
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['myData'],
  queryFn: () => fetchMyData(),
});
```

### Adding API Services
1. Create service file in `src/services/myService.ts`
2. Export functions for API calls
3. Use with React Query in screens

## Documentation

- [src/README.md](src/README.md) - Folder structure guide
- [STRUCTURE_GUIDE.md](STRUCTURE_GUIDE.md) - Implementation details
- [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) - Complete feature list
- [IOS_FIX_GESTURE_HANDLER.md](IOS_FIX_GESTURE_HANDLER.md) - Recent iOS fix

## Technical Stack

**Core**:
- React Native 0.83.1
- React 19.2.0
- TypeScript 5.8.3

**Navigation**:
- @react-navigation/native 7.0.13
- @react-navigation/bottom-tabs 7.9.0

**State Management**:
- @tanstack/react-query 5.90.16

**UI**:
- react-native-paper 5.12.5
- react-native-vector-icons 10.2.0

**Gestures**:
- react-native-gesture-handler 2.30.0

**Other**:
- react-native-safe-area-context 5.5.2
- react-native-screens 4.4.0

## Moving Forward

### Shared Components
When a component is needed in multiple apps:
1. Request to move it to `packages/ui-components/`
2. Provide context about which apps need it
3. It will be refactored for reusability

### Adding Features
- Add API services in `src/services/`
- Create custom hooks in `src/hooks/`
- Define constants in `src/constants/`
- Add utilities in `src/utils/`
- Define types in `src/types/`

---

**Everything is ready! Start building your features! 🎉**
