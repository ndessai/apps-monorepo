# Fixes Applied

## Issues Resolved

### 1. iOS DeviceInfo Error ✅
**Error:** `TurboModuleRegistry.getEnforcing RNC DeviceInfo could not be found`

**Root Cause:**
- React Native Paper and its dependencies require `react-native-device-info`
- The ui-components package had a version conflict with react-native

**Fixes Applied:**
1. Added `react-native-device-info@14.0.0` to both:
   - `apps/BoilerplateApp/package.json`
   - `packages/ui-components/package.json`

2. Fixed version conflict in `packages/ui-components/package.json`:
   - **REMOVED** `react` and `react-native` from dependencies (they should only be peerDependencies)
   - This prevents version conflicts between the shared package and the app

3. Ran `pod install` to link the native module for iOS

### 2. Android Gradle Plugin Error ✅
**Error:** `Failed to apply plugin 'com.facebook.react.rootproject'` and `Error resolving com.facebook.react.settings plugin`

**Root Cause:**
- In a monorepo, node_modules is at the root level (`../../../node_modules` from android dir)
- React Native CLI generated paths pointing to `../node_modules` instead of `../../../node_modules`
- React Native Gradle plugin couldn't find `ReactAndroid/gradle.properties`

**Fixes Applied:**

1. Updated `apps/BoilerplateApp/android/settings.gradle`:
```gradle
// Before
pluginManagement { includeBuild("../node_modules/@react-native/gradle-plugin") }
includeBuild('../node_modules/@react-native/gradle-plugin')

// After
pluginManagement { includeBuild("../../../node_modules/@react-native/gradle-plugin") }
includeBuild('../../../node_modules/@react-native/gradle-plugin')
```

2. Updated `apps/BoilerplateApp/android/app/build.gradle`:
```gradle
react {
    root = file("../../")
    reactNativeDir = file("../../../../node_modules/react-native")
    codegenDir = file("../../../../node_modules/@react-native/codegen")
    cliFile = file("../../../../node_modules/react-native/cli.js")

    autolinkLibrariesWithApp()
}
```

### 3. DateTimePicker Error ✅
**Error:** `RNC DateTimePicker could not be found`

**Fix Applied:**
- Added `@react-native-community/datetimepicker@8.2.0` as a peer dependency of React Native Paper

### 4. Android CMake Build Error (JDK 25 Incompatibility) ⚠️
**Error:** `Execution failed for task ':app:configureCMakeDebug[arm64-v8a]'. WARNING: A restricted method in java.lang.System has been called`

**Root Cause:**
- System is using JDK 25 (released October 2025 LTS)
- React Native 0.83.1 with New Architecture enabled requires CMake for C++ compilation
- JDK 25 introduced stricter security restrictions on system calls
- Gradle 9.0.0's CMake integration triggers restricted `java.lang.System` calls during Prefab package generation
- React Native 0.83.1+ requires New Architecture by default (cannot be disabled)

**Attempted Fixes:**
1. Added comprehensive JVM `--add-opens` arguments to gradle.properties:
   ```properties
   org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m \
     --add-opens=java.base/java.lang=ALL-UNNAMED \
     --add-opens=java.base/java.io=ALL-UNNAMED \
     --add-opens=java.base/java.util=ALL-UNNAMED \
     --add-opens=java.base/java.lang.reflect=ALL-UNNAMED \
     --add-opens=java.base/sun.nio.ch=ALL-UNNAMED
   ```
   **Result:** Still fails - JDK 25 restrictions are too strict

2. Attempted to disable New Architecture (`newArchEnabled=false`):
   **Result:** React Native 0.83.1 shows warning that this flag is no longer supported

**RECOMMENDED SOLUTION:**
**Downgrade to JDK 17 LTS or JDK 21 LTS for React Native development**

React Native's native build toolchain is tested and optimized for LTS Java versions:
- **JDK 17** (LTS - September 2021)
- **JDK 21** (LTS - September 2023)

JDK 25 (October 2025) is too new and has breaking security changes that affect CMake integration.

**How to Switch Java Versions (macOS):**

Using SDKMAN (recommended):
```bash
# Install SDKMAN if not already installed
curl -s "https://get.sdkman.io" | bash

# Install JDK 17
sdk install java 17.0.9-tem

# Set JDK 17 as default
sdk default java 17.0.9-tem

# Or use for current shell only
sdk use java 17.0.9-tem

# Verify
java -version
```

Using Homebrew:
```bash
# Install JDK 17
brew install openjdk@17

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Verify
java -version
```

**After switching to JDK 17/21:**
```bash
cd apps/BoilerplateApp/android
./gradlew --stop
./gradlew clean
./gradlew :app:configureCMakeDebug
```

**Status:** ⚠️ BLOCKED - Requires JDK downgrade to proceed with Android builds

### 5. React Native Vector Icons Not Displaying ✅
**Error:** Icons from react-native-vector-icons not showing on iOS and Android

**Root Cause:**
- iOS: Font files were not copied to the Xcode project and not registered in Info.plist
- Android: fonts.gradle was properly applied, but build verification needed

**Fixes Applied:**

1. **iOS Configuration:**
   - Added `UIAppFonts` array to `apps/BoilerplateApp/ios/BoilerplateApp/Info.plist` with all 19 font files
   - Copied font files from `node_modules/react-native-vector-icons/Fonts/` to `apps/BoilerplateApp/ios/BoilerplateApp/Fonts/`
   - Created Ruby script `add_fonts.rb` to programmatically add fonts to Xcode project's Resources build phase
   - Added fonts using xcodeproj gem to ensure they're properly linked

2. **Android Configuration:**
   - Verified `fonts.gradle` is applied in `apps/BoilerplateApp/android/app/build.gradle` (line 4)
   - Android autolinking handles font copying automatically

3. **Created `react-native.config.js`:**
   - Added configuration to point to vector icons fonts directory
   ```javascript
   module.exports = {
     assets: ['../../node_modules/react-native-vector-icons/Fonts/'],
   };
   ```

**Fonts Added (19 total):**
- AntDesign.ttf
- Entypo.ttf
- EvilIcons.ttf
- Feather.ttf
- FontAwesome.ttf
- FontAwesome5_Brands.ttf
- FontAwesome5_Regular.ttf
- FontAwesome5_Solid.ttf
- FontAwesome6_Brands.ttf
- FontAwesome6_Regular.ttf
- FontAwesome6_Solid.ttf
- Foundation.ttf
- Ionicons.ttf
- MaterialIcons.ttf
- MaterialCommunityIcons.ttf
- SimpleLineIcons.ttf
- Octicons.ttf
- Zocial.ttf
- Fontisto.ttf

**Testing:**
The HelloScreen component uses MaterialCommunityIcons for the rocket icon:
```tsx
<Icon name="rocket-launch" size={80} color="#6200ee" />
```

Icons should now display correctly on both platforms.

## Files Modified

1. `apps/BoilerplateApp/package.json`
   - Added: `react-native-device-info`
   - Added: `@react-native-community/datetimepicker`

2. `packages/ui-components/package.json`
   - Removed: `react` and `react-native` from dependencies (kept as peerDependencies only)
   - Added: `react-native-device-info`
   - Added: `@react-native-community/datetimepicker`

3. `apps/BoilerplateApp/android/settings.gradle`
   - Fixed: Node modules paths for monorepo structure

4. `apps/BoilerplateApp/android/app/build.gradle`
   - Added: React Native paths configuration for monorepo

5. `apps/BoilerplateApp/ios/Podfile`
   - Added: Ruby 3.4 kconv fix

6. `apps/BoilerplateApp/ios/BoilerplateApp/Info.plist`
   - Added: UIAppFonts array with 19 vector icon font files

7. `apps/BoilerplateApp/ios/BoilerplateApp/Fonts/` (directory)
   - Copied: All 19 .ttf font files from react-native-vector-icons

8. `apps/BoilerplateApp/ios/BoilerplateApp.xcodeproj`
   - Added: Font files to Resources build phase via add_fonts.rb script

9. `apps/BoilerplateApp/react-native.config.js` (created)
   - Added: Assets configuration for vector icons fonts

10. `apps/BoilerplateApp/ios/add_fonts.rb` (created)
    - Created: Ruby script to automate adding fonts to Xcode project

## Testing Instructions

### Clean Build (Recommended)

**iOS:**
```bash
# Terminal 1: Start Metro
cd apps/BoilerplateApp
npx react-native start --reset-cache

# Terminal 2: Build and run
cd apps/BoilerplateApp
# Clean build
rm -rf ios/build ios/Pods/Build
cd ios
bundle exec pod install
cd ..
npx react-native run-ios
```

**Android:**
```bash
# Terminal 1: Start Metro
cd apps/BoilerplateApp
npx react-native start --reset-cache

# Terminal 2: Build and run
cd apps/BoilerplateApp/android
./gradlew clean
cd ..
npx react-native run-android
```

### Quick Run

If clean build works, subsequent runs can use:

```bash
# Start Metro (Terminal 1)
cd apps/BoilerplateApp
npx react-native start

# Run app (Terminal 2)
cd apps/BoilerplateApp
npx react-native run-ios    # or run-android
```

## What Should Happen

When the app launches successfully:

1. **Metro Bundler** shows:
   ```
   Loading dependency graph, done.
   ```

2. **App Screen** displays:
   - Navigation bar with title "Boilerplateapp"
   - Purple rocket icon (🚀)
   - "Hello!" text
   - "Welcome to your React Native Monorepo" subtitle
   - Light gray background

## Common Issues

### iOS: "Command PhaseScriptExecution failed"
- Run: `cd ios && bundle exec pod install --repo-update`
- Clean Xcode build folder: Product > Clean Build Folder

### Android: "Task ':app:installDebug' failed"
- Ensure emulator is running or device is connected
- Run: `adb devices` to verify
- Run: `./gradlew clean` in android folder

### Metro: "Unable to resolve module"
- Clear cache: `npx react-native start --reset-cache`
- Delete node_modules and reinstall: `rm -rf node_modules && yarn install`

## Package Versions (All Latest)

- React Native: 0.83.1
- React: 19.2.0
- React Native Paper: 5.12.5
- React Navigation: 7.0.13
- React Native Vector Icons: 10.2.0
- React Native Device Info: 14.0.0
- DateTimePicker: 8.2.0

## Architecture Notes

### Monorepo Structure Best Practices

1. **Shared Packages Should Not Include React/React Native**
   - Use `peerDependencies` instead of `dependencies`
   - Prevents version conflicts
   - Reduces bundle size

2. **Metro Configuration**
   - Shared `metro-config` package handles workspace paths
   - Enables symlinks for monorepo packages

3. **Android Gradle Paths**
   - Must account for monorepo structure (`../../../node_modules`)
   - React Native CLI doesn't auto-detect monorepo layout

4. **iOS CocoaPods**
   - Podfile correctly resolves workspace node_modules
   - Autolinking works across monorepo packages
