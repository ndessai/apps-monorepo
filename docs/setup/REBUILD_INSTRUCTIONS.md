# Rebuild Instructions - Vector Icons Fix Applied

The vector icons issue has been fixed! Follow these instructions to rebuild the apps and see the rocket icon.

## What Was Fixed

### iOS
1. ✅ Added `UIAppFonts` array to Info.plist with all 19 font files
2. ✅ Copied all font files to `ios/BoilerplateApp/Fonts/`
3. ✅ Added fonts to Xcode project Resources build phase
4. ✅ All 19 icon fonts are now properly linked

### Android
1. ✅ Verified `fonts.gradle` is applied in build.gradle
2. ✅ Android autolinking handles fonts automatically

## Rebuild Steps

### iOS - Clean Rebuild Required

Since we modified the Xcode project and Info.plist, you need to do a clean rebuild:

```bash
# Terminal 1: Start Metro with cache reset
cd apps/BoilerplateApp
npx react-native start --reset-cache

# Terminal 2: Clean and rebuild iOS (in a new terminal)
cd apps/BoilerplateApp

# Clean iOS build artifacts
rm -rf ios/build ios/Pods/Build

# Reinstall pods (optional, but recommended)
cd ios
bundle exec pod install
cd ..

# Run iOS app
npx react-native run-ios
```

### Android - Clean Rebuild Required

Since you mentioned Android is already building and running, you just need to rebuild with the fonts:

```bash
# Terminal 1: Start Metro with cache reset (if not already running)
cd apps/BoilerplateApp
npx react-native start --reset-cache

# Terminal 2: Rebuild Android (in a new terminal)
cd apps/BoilerplateApp/android
./gradlew clean
cd ..
npx react-native run-android
```

## Expected Result

After rebuilding, you should see:

### On iOS and Android
- **Navigation bar** with "Boilerplate App" title
- **Purple rocket icon** 🚀 (MaterialCommunityIcons 'rocket-launch')
- **"Hello!" text** in large display font
- **"Welcome to your React Native Monorepo"** subtitle
- **Light gray background** (#f5f5f5)

## Verification

The icon is rendered in [HelloScreen.tsx](packages/ui-components/src/HelloScreen.tsx:9):

```tsx
<Icon name="rocket-launch" size={80} color="#6200ee" />
```

This uses the **MaterialCommunityIcons** font which is now properly configured.

## Available Icon Sets

All 19 icon font families are now available for use:

- AntDesign
- Entypo
- EvilIcons
- Feather
- FontAwesome
- FontAwesome5 (Brands, Regular, Solid)
- FontAwesome6 (Brands, Regular, Solid)
- Foundation
- Ionicons
- MaterialIcons
- **MaterialCommunityIcons** ← Used in HelloScreen
- SimpleLineIcons
- Octicons
- Zocial
- Fontisto

## Usage Example

To use icons in your components:

```tsx
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// or any other icon set:
// import Icon from 'react-native-vector-icons/FontAwesome';
// import Icon from 'react-native-vector-icons/Ionicons';

<Icon name="rocket-launch" size={30} color="#900" />
```

Browse available icons at: https://oblador.github.io/react-native-vector-icons/

## Troubleshooting

### If icons still don't show on iOS:
1. Open Xcode: `open ios/BoilerplateApp.xcodeproj`
2. Check that `Fonts` folder appears in the project navigator under `BoilerplateApp`
3. Select any font file and verify it's in the "Target Membership" for BoilerplateApp
4. Clean build folder: Product > Clean Build Folder (⇧⌘K)
5. Rebuild: Product > Build (⌘B)

### If icons still don't show on Android:
1. Verify fonts.gradle is applied: `grep fonts.gradle android/app/build.gradle`
2. Clean and rebuild: `cd android && ./gradlew clean && cd .. && npx react-native run-android`
3. Clear app data on the emulator/device and relaunch

## Files Modified

See [FIXES_APPLIED.md](FIXES_APPLIED.md#5-react-native-vector-icons-not-displaying-) for complete details.

---

**Ready to test!** Run the rebuild steps above and your rocket icon should appear! 🚀
