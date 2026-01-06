# MMKV Build Fix - Version Downgrade

**Date**: 2026-01-06
**Status**: ✅ Fixed

## Issue

Both iOS and Android builds were failing after installing `react-native-mmkv@4.1.0`.

### iOS Error
```
fatal error: 'NitroModulesSpec.h' file not found
```

**Root Cause**: MMKV v4.x uses the new Nitro Modules architecture which requires codegen setup that wasn't being properly recognized by React Native 0.83.1's auto-linking system.

### Android Error
```
error: use of undeclared identifier 'T'
CMake Error: add_subdirectory given source which is not an existing directory
```

**Root Cause**: C++ compilation errors and missing codegen artifacts for NitroModules.

## Solution

Downgraded to `react-native-mmkv@3.3.3` which uses the standard React Native architecture and is fully compatible with RN 0.83.1.

### Steps Taken

1. **Uninstall MMKV v4.1.0**:
   ```bash
   cd apps/BoilerplateApp
   npm uninstall react-native-mmkv
   ```

2. **Install MMKV v3.3.3**:
   ```bash
   npm install react-native-mmkv@3.3.3
   ```

3. **Remove manual iOS Podfile changes**:
   - Removed manual `pod 'NitroModules'` declaration
   - Let auto-linking handle everything

4. **Remove manual Android settings.gradle changes**:
   - Removed manual `react-native-nitro-modules` include
   - Let auto-linking handle everything

5. **Reinstall iOS Pods**:
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   bundle exec pod install
   ```

6. **Generate Android Codegen** (required for MMKV v3):
   ```bash
   cd android
   ./gradlew generateCodegenArtifactsFromSchema
   ./gradlew assembleDebug
   ```

7. **Test both platforms**:
   ```bash
   npx react-native run-ios
   npx react-native run-android
   ```

## Results

✅ **iOS**: Build successful, app launches
✅ **Android**: Build successful, app launches
✅ **Storage API**: Works identically to v4.x (no code changes needed)

## Version Comparison

| Feature | v3.3.3 (Stable) | v4.1.0 (Nitro) |
|---------|-----------------|----------------|
| Compatibility | ✅ RN 0.83.1 | ❌ Requires special setup |
| Auto-linking | ✅ Works | ❌ Partial |
| Build complexity | ✅ Simple | ❌ Complex |
| Performance | ✅ 10-30x faster than AsyncStorage | ✅ Same |
| API | ✅ Synchronous | ✅ Synchronous |
| Features | ✅ All core features | ✅ Same + Nitro benefits |

## API Compatibility

The abstraction layer in `src/storage/KeyValueStorage.ts` works with both versions without any changes:

```typescript
import { MMKV } from 'react-native-mmkv';

// Works with both v3 and v4
export const mmkv = new MMKV({
  id: 'boilerplate-app-storage',
});

// All methods work identically
storage.setString('key', 'value');
storage.getString('key');
```

## Recommendation

**For production apps on RN 0.83.1**: Use `react-native-mmkv@3.3.3`

**For future upgrades**: When React Native has better Nitro Modules support (likely RN 0.84+), consider upgrading to v4.x for potential additional benefits.

## Files Modified

- `apps/BoilerplateApp/package.json` - Downgraded MMKV version
- `apps/BoilerplateApp/ios/Podfile` - Reverted manual NitroModules addition
- `apps/BoilerplateApp/android/settings.gradle` - Reverted manual include

## Verification

Both platforms now build and run successfully:

**iOS**:
```bash
cd apps/BoilerplateApp
npx react-native run-ios
# ✅ success Successfully launched the app
```

**Android**:
```bash
cd apps/BoilerplateApp
npx react-native run-android
# ✅ BUILD SUCCESSFUL
# ✅ App installed and launched
```

---

**Status**: ✅ Resolved
**Impact**: Both platforms functional
**Action Required**: None - using stable version
