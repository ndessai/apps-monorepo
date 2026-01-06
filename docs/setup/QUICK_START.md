# Quick Start Guide

## Current Status: ✅ Ready to Run

Your React Native Turbo Monorepo is fully configured and ready to launch on both iOS and Android!

## Prerequisites Completed ✅

- ✅ Yarn workspaces configured
- ✅ Turborepo setup
- ✅ React Native 0.83.1 with React 19.2.0
- ✅ iOS native modules linked (84 pods)
- ✅ Android Gradle configured for monorepo
- ✅ Vector icons fonts installed (19 fonts on both platforms)
- ✅ React Navigation integrated
- ✅ React Native Paper UI library

## Launch the Apps

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

## What You'll See 🚀

When the app launches:
- **Navigation bar**: "Boilerplate App"
- **Purple rocket icon**: 🚀 (size 80, MaterialCommunityIcons)
- **Large text**: "Hello!"
- **Subtitle**: "Welcome to your React Native Monorepo"
- **Background**: Light gray (#f5f5f5)

## Project Structure

```
apps-monorepo/
├── apps/
│   └── BoilerplateApp/        # Main React Native app
│       ├── App.tsx             # Root component with navigation
│       ├── assets/fonts/       # Vector icons fonts (19 files)
│       ├── ios/                # iOS native project
│       └── android/            # Android native project
├── packages/
│   ├── ui-components/          # HelloScreen component
│   ├── utils/                  # Shared utilities
│   ├── config/                 # TypeScript/ESLint configs
│   ├── types/                  # Shared TypeScript types
│   └── metro-config/           # Metro bundler config
└── node_modules/               # Root dependencies
```

## Key Features

### Shared UI Components
Located in `packages/ui-components/src/`:
- `HelloScreen.tsx` - Demo screen with icon
- `index.tsx` - Component exports

Usage in your app:
```tsx
import { HelloScreen } from '@monorepo/ui-components';
```

### Vector Icons
All 19 icon fonts available:
```tsx
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// or FontAwesome, Ionicons, etc.

<Icon name="rocket-launch" size={30} color="#900" />
```

Browse icons: https://oblador.github.io/react-native-vector-icons/

### React Native Paper
Material Design components:
```tsx
import { Button, Text, Card } from 'react-native-paper';
```

### React Navigation
Native stack navigator configured:
```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
```

## Development Commands

From the root directory:

```bash
# Install dependencies
yarn install

# Type checking
yarn type-check

# Linting
yarn lint

# Format code
yarn format

# Build all packages
yarn build
```

## Important Files

- [README.md](README.md) - Complete documentation
- [ICON_FIX_COMPLETE.md](ICON_FIX_COMPLETE.md) - Vector icons setup details
- [FIXES_APPLIED.md](FIXES_APPLIED.md) - All issues resolved during setup
- [CURRENT_STATUS.md](CURRENT_STATUS.md) - Detailed project status

## Known Requirements

### For Android Development
**You must use JDK 17 or JDK 21** (NOT JDK 25)

If you encounter Android build errors, check your Java version:
```bash
java -version
```

If using JDK 25, follow instructions in [README.md](README.md#-critical-javajdk-version-requirement) to downgrade.

### For iOS Development
- macOS with Xcode
- Ruby 3.3.x (not 3.4.x due to CocoaPods compatibility)
- CocoaPods

## Next Steps

1. **Run the apps** using commands above
2. **Verify icons display** - you should see the purple rocket 🚀
3. **Start building** - add your features in `packages/ui-components/`
4. **Create new apps** - add more apps in `apps/` folder using the boilerplate as template

## Troubleshooting

### Icons not showing?
See [ICON_FIX_COMPLETE.md](ICON_FIX_COMPLETE.md) for verification steps.

### Build errors?
See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

### Android CMake errors?
Check your Java version - must be JDK 17 or JDK 21.

---

**Ready to build! 🚀** Run the apps and start developing your React Native mobile applications in this monorepo setup.
