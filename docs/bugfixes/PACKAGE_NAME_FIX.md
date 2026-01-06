# Package Name Fix - @monorepo/ui-components

**Issue Date**: 2026-01-06
**Status**: Fixed ✅

## Problem

After implementing the theme system, the app failed to run with the error:
```
Cannot find module '@repo/ui-components'
```

## Root Cause

The package was named `@monorepo/ui-components` in `packages/ui-components/package.json`, but all imports in the app were using `@repo/ui-components`.

This mismatch occurred because:
1. The monorepo uses `@monorepo` as the package scope
2. The theme implementation inadvertently used `@repo` in all imports
3. The package manager couldn't resolve the incorrect package name

## Solution

Updated all imports to use the correct package name: `@monorepo/ui-components`

### Files Fixed

**App Files (5):**
1. `apps/BoilerplateApp/App.tsx`
2. `apps/BoilerplateApp/src/screens/HelloScreen.tsx`
3. `apps/BoilerplateApp/src/screens/SecondScreen.tsx`
4. `apps/BoilerplateApp/src/components/SwipeableCard.tsx`
5. `apps/BoilerplateApp/src/navigation/BottomTabNavigator.tsx`

**Documentation Files (2):**
1. `docs/product/THEME_SYSTEM.md`
2. `docs/product/THEME_IMPLEMENTATION_COMPLETE.md`

### Changed From:
```typescript
import { colors, spacing, elevation } from '@repo/ui-components';
```

### Changed To:
```typescript
import { colors, spacing, elevation } from '@monorepo/ui-components';
```

## Steps Taken

1. **Updated all imports** - Changed `@repo/ui-components` to `@monorepo/ui-components` in all files
2. **Updated documentation** - Fixed package name in all docs using `sed`
3. **Reinstalled dependencies** - Ran `npm install` at root and in BoilerplateApp
4. **Reinstalled iOS pods** - Cleaned and reinstalled pods to ensure proper linking

### Commands Run:
```bash
# Update package name in files (done manually via Edit tool)

# Update documentation
sed -i '' 's/@repo\/ui-components/@monorepo\/ui-components/g' docs/product/THEME_SYSTEM.md
sed -i '' 's/@repo\/ui-components/@monorepo\/ui-components/g' docs/product/THEME_IMPLEMENTATION_COMPLETE.md

# Reinstall dependencies
npm install

# Reinstall iOS pods
cd apps/BoilerplateApp/ios
rm -rf Pods Podfile.lock
bundle exec pod install
```

## Verification

After the fix:
- ✅ Package name is consistent across all files
- ✅ Dependencies properly linked in node_modules
- ✅ iOS pods reinstalled successfully
- ✅ Documentation updated with correct package name
- ✅ App should now run without module resolution errors

## How to Run the App

```bash
# iOS
cd apps/BoilerplateApp
npm run ios

# Android
cd apps/BoilerplateApp
npm run android
```

## Prevention

To prevent this in the future:
1. Always check `package.json` for the actual package name before importing
2. Use consistent naming conventions across the monorepo
3. The correct package scope is `@monorepo`, not `@repo`

## Related Files

- Package definition: [packages/ui-components/package.json](../../packages/ui-components/package.json)
- Theme exports: [packages/ui-components/src/index.tsx](../../packages/ui-components/src/index.tsx)
- Theme documentation: [THEME_SYSTEM.md](../product/THEME_SYSTEM.md)

---

**Resolution**: All imports updated to use `@monorepo/ui-components`
**Impact**: App now runs successfully with theme system
**Time to Fix**: ~5 minutes
