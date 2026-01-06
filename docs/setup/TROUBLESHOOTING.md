# Troubleshooting Guide

## Fixed Issues

### ✅ DeviceInfo Module Not Found (iOS)
**Status:** Fixed

**Solution:** Added `react-native-device-info` package which was a missing peer dependency.

```bash
# Already added to package.json and pods installed
```

### ✅ RNC DateTimePicker Not Found
**Status:** Fixed

**Solution:** Added `@react-native-community/datetimepicker` as a peer dependency for React Native Paper.

## Testing the App

### iOS

1. **Start Metro Bundler** (in one terminal):
   ```bash
   cd apps/BoilerplateApp
   npx react-native start --reset-cache
   ```

2. **Run iOS App** (in another terminal):
   ```bash
   cd apps/BoilerplateApp
   npx react-native run-ios
   ```

   Or use Xcode:
   ```bash
   open apps/BoilerplateApp/ios/BoilerplateApp.xcworkspace
   ```
   Then press the Run button in Xcode.

### Android

1. **Start Metro Bundler** (in one terminal):
   ```bash
   cd apps/BoilerplateApp
   npx react-native start --reset-cache
   ```

2. **Start Android Emulator or Connect Device**
   - Open Android Studio > Virtual Device Manager
   - Start an emulator (API 31+)
   - Or connect a physical device with USB debugging enabled

3. **Run Android App** (in another terminal):
   ```bash
   cd apps/BoilerplateApp
   npx react-native run-android
   ```

### Common Android Issues

#### App Fails to Launch

**Possible Causes:**
1. Metro bundler not running
2. Wrong app name in bundler connection
3. Network connectivity issues
4. Build cache issues

**Solutions:**

1. **Clean and Rebuild:**
   ```bash
   cd apps/BoilerplateApp/android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

2. **Reset Metro Cache:**
   ```bash
   cd apps/BoilerplateApp
   npx react-native start --reset-cache
   ```

3. **Check Metro Connection:**
   - Ensure Metro is running before launching the app
   - Check that the device/emulator can reach localhost:8081
   - For physical devices, use adb reverse:
     ```bash
     adb reverse tcp:8081 tcp:8081
     ```

4. **Verify Gradle Build:**
   ```bash
   cd apps/BoilerplateApp/android
   ./gradlew assembleDebug --info
   ```

5. **Check Emulator API Level:**
   - Minimum API 24 (Android 7.0)
   - Recommended API 31+ (Android 12+)

#### Red Screen Errors

If you see red screen errors in the app:

1. **Module Resolution Errors:**
   ```bash
   # Clear watchman
   watchman watch-del-all

   # Clear Metro cache
   cd apps/BoilerplateApp
   npx react-native start --reset-cache
   ```

2. **Native Module Linking Issues:**
   ```bash
   # Reinstall dependencies
   cd /Users/ndessai/projects/apps-monorepo
   rm -rf node_modules
   npx yarn install

   # Android: Clean and rebuild
   cd apps/BoilerplateApp/android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

3. **iOS Native Module Issues:**
   ```bash
   cd apps/BoilerplateApp/ios
   bundle exec pod install --repo-update
   cd ..
   npx react-native run-ios
   ```

### Debugging Tips

1. **Enable Debug Mode:**
   - iOS: Cmd+D in simulator
   - Android: Cmd+M (Mac) or Ctrl+M (Windows/Linux)
   - Select "Debug" to attach Chrome DevTools

2. **View Logs:**
   ```bash
   # iOS
   npx react-native log-ios

   # Android
   npx react-native log-android
   ```

3. **Check Metro Bundler Output:**
   The Metro terminal should show:
   ```
   Loading dependency graph, done.
   ```
   If you see errors here, resolve them first.

## Expected Behavior

When the app launches successfully, you should see:

1. **Splash Screen** (brief)
2. **Navigation Bar** with title "Boilerplate App"
3. **Hello Screen** displaying:
   - A purple rocket icon (🚀)
   - Large "Hello!" text
   - Subtitle: "Welcome to your React Native Monorepo"
   - Light gray background

## Package Versions

All packages are using the latest stable versions:
- React Native: 0.83.1
- React: 19.2.0
- React Native Paper: 5.12.5
- React Navigation: 7.0.13
- All peer dependencies installed

## Still Having Issues?

1. Check the main [README.md](README.md) for setup instructions
2. Verify all prerequisites are installed
3. Check Node version: `node --version` (should be >= 20)
4. Check Ruby version for iOS: `ruby --version` (should be < 3.4)
5. Check Java version for Android: `java --version` (should be 17+)
