# Create App Guide

## Overview

The `create-app` command allows you to quickly generate new React Native applications from the BoilerplateApp template. It automates the entire process of creating a new app with all the configured features, proper naming, and ready-to-run setup.

## Usage

### Basic Command

```bash
npm run create-app <AppName>
```

### Examples

```bash
# Create an app called "MyNewApp"
npm run create-app MyNewApp

# Create an app called "ShoppingApp"
npm run create-app ShoppingApp

# Create an app called "Dashboard"
npm run create-app Dashboard
```

## App Name Rules

The app name must follow these rules:
- **Start with an uppercase letter** (e.g., `MyApp`, not `myApp`)
- **Only alphanumeric characters** (no spaces, hyphens, or special characters)
- **CamelCase format** (e.g., `MyNewApp`, `ShoppingCart`)

✅ **Valid names**: `MyApp`, `TestApp`, `ShoppingCart`, `Dashboard123`
❌ **Invalid names**: `myapp`, `my-app`, `my_app`, `my app`

## What Gets Created

When you run `create-app MyNewApp`, the script will:

### 1. Copy BoilerplateApp Structure ✅
```
apps/MyNewApp/
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── providers/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   ├── types/
│   └── assets/
├── ios/
├── android/
├── App.tsx
├── index.js
└── package.json
```

### 2. Rename Everything ✅

**App name replacements**:
- `BoilerplateApp` → `MyNewApp`
- `boilerplateapp` → `mynewapp`
- `Boilerplate App` → `MyNewApp`

**Files updated**:
- `package.json` - App name and display name
- `app.json` - App configuration
- `App.tsx` - Main component
- `android/settings.gradle` - Android project name
- `android/app/build.gradle` - Package name
- `android/app/src/main/AndroidManifest.xml` - Package
- `android/app/src/main/res/values/strings.xml` - App name
- `ios/Podfile` - iOS project name
- All TypeScript/JavaScript source files

**Directories renamed**:
- `android/app/src/main/java/com/boilerplateapp/` → `com/mynewapp/`
- `ios/BoilerplateApp.xcodeproj` → `ios/MyNewApp.xcodeproj`
- `ios/BoilerplateApp.xcworkspace` → `ios/MyNewApp.xcworkspace`
- `ios/BoilerplateApp/` → `ios/MyNewApp/`

### 3. Exclude Build Artifacts ✅

The following are **NOT** copied (to keep the new app clean):
- `node_modules/`
- `ios/Pods/`, `ios/build/`, `ios/Podfile.lock`
- `android/build/`, `android/.gradle/`, `android/app/build/`
- `__tests__/`
- `.DS_Store`, `*.log`
- Documentation files (IMPLEMENTATION_COMPLETE.md, etc.)

### 4. Install Dependencies ✅

Automatically runs:
- `npx yarn install` - Installs JavaScript dependencies
- `bundle install` - Installs Ruby dependencies (iOS)
- `bundle exec pod install` - Installs CocoaPods (iOS)

### 5. Generate README ✅

Creates a custom README.md with:
- App name and description
- Setup instructions
- Run commands
- Project structure overview
- Tech stack details

## What You Get

Each generated app includes:

### ✅ Features
- **Industry-standard folder structure** - Professional organization
- **React Query** - State management configured
- **Bottom tab navigation** - Two screens with navigation
- **Swipeable cards** - Gesture handling examples
- **TypeScript** - Full type safety
- **React Native Paper** - Material Design components
- **Vector icons** - 19 icon font families
- **iOS & Android** - Both platforms ready

### ✅ Screens
1. **Home Screen** - With swipeable cards and gesture demo
2. **Data Screen** - With React Query integration demo

### ✅ Components
- SwipeableCard component
- Extensible component structure

### ✅ Configuration
- React Query provider setup
- Navigation configuration
- TypeScript types
- Proper iOS/Android setup

## After Creation

Once the app is created, you'll see:

```
🎉 Successfully created MyNewApp!

Next steps:

  1. Navigate to your new app:
     cd apps/MyNewApp

  2. Run on iOS:
     npx react-native run-ios

  3. Run on Android:
     npx react-native run-android

  4. Start customizing your app in src/
```

### Running Your New App

**iOS**:
```bash
cd apps/MyNewApp
npx react-native run-ios
```

**Android**:
```bash
cd apps/MyNewApp
npx react-native run-android
```

## Manual Steps (If Auto-Install Fails)

If dependency installation fails during creation, run manually:

### Install JavaScript Dependencies
```bash
# From monorepo root
npx yarn install
```

### Install iOS Dependencies
```bash
cd apps/MyNewApp/ios
bundle install
bundle exec pod install
cd ../../..
```

### Clean Android Build (if needed)
```bash
cd apps/MyNewApp/android
./gradlew clean
cd ../../..
```

## Customizing Your New App

After creation, customize these areas:

### 1. Update App Icon & Splash Screen
- **iOS**: Replace icons in `ios/MyNewApp/Images.xcassets/`
- **Android**: Replace icons in `android/app/src/main/res/mipmap-*/`

### 2. Configure App Details
- **Display name**: Update in `app.json` and `strings.xml`
- **Bundle ID**: Change in `app.json`, Xcode, and `build.gradle`
- **Version**: Update in `package.json` and platform-specific files

### 3. Add Your Screens
- Create in `src/screens/`
- Add to navigation in `src/navigation/BottomTabNavigator.tsx`

### 4. Add Your Features
- **API Services**: Add in `src/services/`
- **Custom Hooks**: Add in `src/hooks/`
- **Utilities**: Add in `src/utils/`
- **Constants**: Add in `src/constants/`

## Troubleshooting

### "App name must start with an uppercase letter"
**Solution**: Use CamelCase format: `MyApp` instead of `myApp`

### "App already exists"
**Solution**: Choose a different name or delete the existing app folder

### "BoilerplateApp not found"
**Solution**: Ensure you're running from the monorepo root and BoilerplateApp exists

### Build errors after creation
**Solution**:
```bash
# Clean and reinstall
cd apps/MyNewApp
rm -rf node_modules ios/Pods android/build

# From root
npx yarn install

# iOS
cd apps/MyNewApp/ios
bundle exec pod install
```

## Script Details

**Location**: `scripts/create-app.js`

**What it does**:
1. Validates app name format
2. Copies BoilerplateApp directory
3. Excludes build artifacts and docs
4. Replaces all instances of app name
5. Renames Android package directories
6. Renames iOS project and workspace
7. Updates all configuration files
8. Installs dependencies
9. Generates custom README
10. Provides next steps

## Examples

### Creating a Shopping App
```bash
npm run create-app ShoppingApp
cd apps/ShoppingApp
npx react-native run-ios
```

### Creating a Dashboard
```bash
npm run create-app Dashboard
cd apps/Dashboard
npx react-native run-android
```

### Creating Multiple Apps
```bash
npm run create-app AppOne
npm run create-app AppTwo
npm run create-app AppThree
```

## File Structure After Creation

```
apps-monorepo/
├── apps/
│   ├── BoilerplateApp/       # Template (keep as reference)
│   ├── MyNewApp/              # Your new app!
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── navigation/
│   │   │   └── ...
│   │   ├── ios/
│   │   │   └── MyNewApp.xcworkspace
│   │   ├── android/
│   │   └── package.json
│   └── AnotherApp/            # Another app
├── packages/                  # Shared packages
├── scripts/
│   └── create-app.js         # The generator script
└── package.json              # Root with create-app command
```

## Best Practices

### 1. Keep BoilerplateApp Updated
- Don't modify BoilerplateApp for specific features
- Only add improvements that benefit all new apps
- Document changes in BoilerplateApp/README.md

### 2. Name Apps Descriptively
- Use clear, purpose-driven names
- Examples: `ShoppingCart`, `UserDashboard`, `InventoryManager`
- Avoid generic names like `App1`, `Test`, `New`

### 3. Customize After Creation
- Remove unused screens/components
- Add app-specific features
- Update branding and styling

### 4. Share Common Code
- Move reusable components to `packages/ui-components/`
- Move shared utilities to `packages/utils/`
- Keep app-specific code in the app

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run create-app MyApp` | Create new app |
| `cd apps/MyApp` | Navigate to app |
| `npx react-native run-ios` | Run on iOS |
| `npx react-native run-android` | Run on Android |
| `cd ios && pod install` | Reinstall iOS pods |
| `cd android && ./gradlew clean` | Clean Android build |

---

**Happy app generation! 🚀**
