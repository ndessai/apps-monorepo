# Quick Reference Card

## Creating a New App

```bash
# Create a new app from BoilerplateApp template
npm run create-app MyNewApp

# Navigate to your app
cd apps/MyNewApp

# Run on iOS
npx react-native run-ios

# Run on Android
npx react-native run-android
```

## App Name Rules

✅ **Valid**: `MyApp`, `ShoppingCart`, `Dashboard`
❌ **Invalid**: `myapp`, `my-app`, `my_app`, `my app`

**Format**: Must start with uppercase letter, only alphanumeric, CamelCase

## What You Get

Every new app includes:
- ✅ Industry-standard folder structure (`src/components`, `src/screens`, etc.)
- ✅ React Query for state management
- ✅ Bottom tab navigation (2 screens)
- ✅ Swipeable cards with gestures
- ✅ TypeScript + strict mode
- ✅ React Native Paper (Material Design)
- ✅ Vector icons (19 families)
- ✅ iOS & Android ready

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run create-app MyApp` | Create new app |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all code |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | TypeScript check |
| `npm run clean` | Clean all builds |

## File Structure

```
apps/YourApp/
├── src/
│   ├── components/     # Reusable components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation setup
│   ├── providers/      # Context providers
│   ├── services/       # API services
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilities
│   ├── constants/      # Constants
│   ├── types/          # TypeScript types
│   └── assets/         # Static files
├── ios/                # iOS native
├── android/            # Android native
└── package.json
```

## After Creating an App

### 1. Update App Identity
- **Display Name**: `app.json`, `strings.xml`
- **Bundle ID**: `app.json`, Xcode, `build.gradle`
- **Icon**: `ios/*/Images.xcassets/`, `android/res/mipmap-*/`

### 2. Add Your Features
- Screens → `src/screens/`
- Components → `src/components/`
- API calls → `src/services/`
- Hooks → `src/hooks/`

### 3. Update Navigation
Edit `src/navigation/BottomTabNavigator.tsx` to add/remove tabs

## Troubleshooting

### iOS Build Issues
```bash
cd apps/YourApp/ios
rm -rf Pods build
bundle exec pod install
```

### Android Build Issues
```bash
cd apps/YourApp/android
./gradlew clean
```

### Metro Cache Issues
```bash
npx react-native start --reset-cache
```

## Documentation

- [CREATE_APP_GUIDE.md](CREATE_APP_GUIDE.md) - Complete app creation guide
- [QUICK_START.md](../setup/QUICK_START.md) - Setup instructions
- [apps/BoilerplateApp/src/README.md](../../apps/BoilerplateApp/src/README.md) - Folder structure guide

## Tech Stack

- React Native 0.83.1
- React 19.2.0
- TypeScript 5.8.3
- React Navigation 7.x
- React Query 5.x
- React Native Paper 5.x
- Turborepo 2.3.3

## Support

- JDK 17 or 21 (NOT 25) for Android
- Ruby 3.3.x (NOT 3.4) for iOS
- Node.js >= 20

---

**Quick Start**: `npm run create-app MyApp` → `cd apps/MyApp` → `npx react-native run-ios` 🚀
