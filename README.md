# React Native Turbo Monorepo

A production-ready Turborepo monorepo for building React Native mobile applications with shared packages.

## 🚀 Quick Start

**Create a new app**: `npm run create-app YourAppName` - See [docs/product/CREATE_APP_GUIDE.md](docs/product/CREATE_APP_GUIDE.md) for details.

**Ready to launch?** See [docs/setup/QUICK_START.md](docs/setup/QUICK_START.md) for immediate setup and run instructions.

**✅ All Issues Resolved!** See [docs/bugfixes/FINAL_FIX.md](docs/bugfixes/FINAL_FIX.md) for the complete vector icons fix.

## 📦 Project Structure

```
apps-monorepo/
├── apps/
│   └── BoilerplateApp/           # React Native app (iOS & Android)
├── packages/
│   ├── ui-components/             # Shared React Native UI components
│   ├── utils/                     # Shared utility functions
│   ├── config/                    # Shared configurations (TS, ESLint)
│   ├── types/                     # Shared TypeScript types
│   └── metro-config/              # Shared Metro bundler configuration
├── package.json                   # Root workspace configuration
├── turbo.json                     # Turborepo pipeline configuration
└── yarn.lock
```

## 🚀 Tech Stack

- **React Native**: 0.83.1 (latest)
- **React**: 19.2.0 (latest)
- **TypeScript**: 5.8.3 (strict mode)
- **React Native Paper**: 5.12.5 (Material Design components)
- **React Native Vector Icons**: 10.2.0
- **React Navigation**: 7.x (navigation library)
- **Turborepo**: 2.3.3 (monorepo build system)
- **Yarn**: Workspaces for package management

## 📋 Prerequisites

- Node.js >= 20
- Yarn (or use `npx yarn`)
- For iOS: Xcode, CocoaPods, Ruby >= 2.6.10 (< 3.4)
- For Android: Android Studio, **JDK 17 LTS or JDK 21 LTS** (⚠️ **NOT JDK 25** - see below)

## 🛠️ Installation

### 1. Install Dependencies

```bash
# Install all workspace dependencies
npx yarn install
```

### 2. iOS Setup

#### Known Issue: Ruby 3.4 Compatibility

If you're using Ruby 3.4.x, you may encounter a `kconv` error during CocoaPods installation. A workaround has been included in [`apps/BoilerplateApp/ios/fix_kconv.rb`](apps/BoilerplateApp/ios/fix_kconv.rb).

**Recommended Solution**: Use Ruby 3.3.x or earlier:

```bash
# Using rbenv
rbenv install 3.3.0
rbenv local 3.3.0

# Or using rvm
rvm install 3.3.0
rvm use 3.3.0
```

Then install iOS dependencies:

```bash
cd apps/BoilerplateApp/ios
bundle install
bundle exec pod install
cd ../../..
```

### 3. Android Setup

#### ⚠️ CRITICAL: Java/JDK Version Requirement

**You MUST use JDK 17 LTS or JDK 21 LTS for Android development.**

React Native 0.83.1 with New Architecture requires CMake for C++ compilation. JDK 25 has stricter security restrictions that block the system calls needed by Gradle's CMake integration, causing this error:

```
Execution failed for task ':app:configureCMakeDebug[arm64-v8a]'.
WARNING: A restricted method in java.lang.System has been called
```

**Solution: Install JDK 17 or JDK 21**

Using SDKMAN (recommended):
```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install and use JDK 17
sdk install java 17.0.9-tem
sdk default java 17.0.9-tem

# Verify
java -version  # Should show version 17.x.x
```

Using Homebrew (macOS):
```bash
# Install JDK 17
brew install openjdk@17

# Add to PATH (add this line to ~/.zshrc or ~/.bash_profile)
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Reload shell
source ~/.zshrc  # or source ~/.bash_profile

# Verify
java -version  # Should show version 17.x.x
```

After switching Java versions:
```bash
cd apps/BoilerplateApp/android
./gradlew --stop
./gradlew clean
cd ..
```

Android configuration is now ready.

## 🏃 Running the App

### iOS

```bash
cd apps/BoilerplateApp
npx react-native run-ios
```

Or open in Xcode:
```bash
open apps/BoilerplateApp/ios/BoilerplateApp.xcworkspace
```

### Android

```bash
cd apps/BoilerplateApp
npx react-native run-android
```

### Start Metro Bundler

```bash
cd apps/BoilerplateApp
npx react-native start
```

## 📱 Boilerplate App Features

The `BoilerplateApp` demonstrates:

- ✅ React Native Paper integration
- ✅ React Native Vector Icons (Material Community Icons)
- ✅ React Navigation with bottom tabs
- ✅ React Query for state management
- ✅ Swipeable cards with gesture handling
- ✅ TypeScript with strict mode
- ✅ Monorepo workspace packages
- ✅ Industry-standard folder structure
- ✅ **E2E testing with Detox** - Complete test suites for iOS and Android
- ✅ Test IDs on all major UI components
- ✅ Helper utilities for testing

## 📦 Shared Packages

### `@monorepo/ui-components`

Reusable React Native UI components built on React Native Paper.

```typescript
import { HelloScreen } from '@monorepo/ui-components';
```

### `@monorepo/utils`

Shared utility functions.

```typescript
import { formatDate, capitalize } from '@monorepo/utils';
```

### `@monorepo/types`

Shared TypeScript type definitions.

```typescript
import { AppConfig } from '@monorepo/types';
```

### `@monorepo/config`

Shared configurations for TypeScript and ESLint.

### `@monorepo/metro-config`

Shared Metro bundler configuration for monorepo support.

## 🔧 Development Scripts

### Root Level

```bash
# Build all packages
npx yarn build

# Run linting across all packages
npx yarn lint

# Format code with Prettier
npx yarn format

# Type check all packages
npx yarn type-check

# Clean all node_modules
npx yarn clean
```

### App Level

```bash
cd apps/BoilerplateApp

# Run on iOS
npx react-native run-ios

# Run on Android
npx react-native run-android

# Start Metro bundler
npx react-native start

# Run tests
npx yarn test

# Lint the app
npx yarn lint

# E2E tests (iOS)
npm run e2e:build:ios
npm run e2e:test:ios

# E2E tests (Android)
npm run e2e:build:android
npm run e2e:test:android
```

## 🧪 E2E Testing

Complete end-to-end testing with [Detox](https://wix.github.io/Detox/) is included in BoilerplateApp.

### Quick Start

**iOS**:
```bash
cd apps/BoilerplateApp
npm run e2e:build:ios
npm run e2e:test:ios
```

**Android**:
```bash
cd apps/BoilerplateApp
# Start emulator first
emulator -avd Pixel_7_API_34
# Then run tests
npm run e2e:build:android
npm run e2e:test:android
```

### Test Coverage

- ✅ Hello Screen (swipeable cards, deletion)
- ✅ Second Screen (React Query, data fetching)
- ✅ Navigation (tab switching, state preservation)

### Documentation

- Complete guide: [E2E_TESTING.md](apps/BoilerplateApp/E2E_TESTING.md)
- Docs folder: [docs/product/E2E_TESTING_GUIDE.md](docs/product/E2E_TESTING_GUIDE.md)

## 🏗️ Adding New Apps

1. Create a new React Native app in the `apps/` folder
2. Add monorepo dependencies to `package.json`:
   ```json
   {
     "dependencies": {
       "@monorepo/ui-components": "*",
       "@monorepo/utils": "*",
       "@monorepo/types": "*"
     },
     "devDependencies": {
       "@monorepo/config": "*",
       "@monorepo/metro-config": "*"
     }
   }
   ```
3. Configure Metro to use the shared config
4. Run `npx yarn install`

## 📝 Creating Shared Packages

1. Create a new folder in `packages/`
2. Add a `package.json` with name `@monorepo/package-name`
3. Set `"private": true` in the package.json
4. Add to root `package.json` workspaces (automatically included with `packages/*`)
5. Run `npx yarn install` to link the package

## 🔍 TypeScript Configuration

All packages use strict TypeScript mode for maximum type safety:

- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

## 🎨 Code Quality

- **ESLint**: Configured with React Native and TypeScript rules
- **Prettier**: Consistent code formatting across the monorepo
- **TypeScript**: Strict mode enabled for all packages
- **Detox E2E Testing**: Comprehensive end-to-end test suites for iOS and Android

## 🚧 Troubleshooting

For detailed troubleshooting steps, see [docs/setup/TROUBLESHOOTING.md](docs/setup/TROUBLESHOOTING.md).

### Quick Fixes

**iOS Pod Install Fails (Ruby 3.4)**
- See [iOS Setup](#2-ios-setup) section above. Use Ruby 3.3.x or apply the kconv workaround.

**Metro Bundler Can't Find Packages**
```bash
cd apps/BoilerplateApp
npx react-native start --reset-cache
```

**Android App Fails to Launch**
```bash
cd apps/BoilerplateApp/android
./gradlew clean
cd ..
# Start Metro in one terminal
npx react-native start --reset-cache
# In another terminal
npx react-native run-android
```

**Module Not Found Errors**
```bash
# At root
npx yarn install
# iOS
cd apps/BoilerplateApp/ios && bundle exec pod install && cd ..
# Android - clean and rebuild
cd android && ./gradlew clean && cd ..
```

## 📚 Documentation

All documentation is organized in the [docs/](docs/) folder:

### Product & Features
- [CREATE_APP_GUIDE.md](docs/product/CREATE_APP_GUIDE.md) - Complete guide for creating new apps
- [APP_GENERATOR_COMPLETE.md](docs/product/APP_GENERATOR_COMPLETE.md) - App generator implementation details
- [E2E_TESTING_GUIDE.md](docs/product/E2E_TESTING_GUIDE.md) - End-to-end testing with Detox
- [QUICK_REFERENCE.md](docs/product/QUICK_REFERENCE.md) - Quick command reference
- [CURRENT_STATUS.md](docs/product/CURRENT_STATUS.md) - Project status overview

### Setup & Environment
- [QUICK_START.md](docs/setup/QUICK_START.md) - Quick setup guide
- [TROUBLESHOOTING.md](docs/setup/TROUBLESHOOTING.md) - Troubleshooting guide
- [REBUILD_INSTRUCTIONS.md](docs/setup/REBUILD_INSTRUCTIONS.md) - Rebuild instructions

### Bug Fixes
- [FINAL_FIX.md](docs/bugfixes/FINAL_FIX.md) - Vector icons fix
- [ICON_FIX_COMPLETE.md](docs/bugfixes/ICON_FIX_COMPLETE.md) - Icon fix details
- [FIXES_APPLIED.md](docs/bugfixes/FIXES_APPLIED.md) - All fixes applied

## 📄 License

MIT

## 🤝 Contributing

This is a boilerplate monorepo. Feel free to customize it for your needs!

---

**Built with** ❤️ **using React Native, Turborepo, and TypeScript**
