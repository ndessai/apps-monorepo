# E2E Testing in Monorepo - Setup Guide

## Monorepo-Specific Configuration

This guide explains how E2E testing with Detox is configured in a Yarn Workspaces monorepo.

## Why Special Configuration is Needed

### Yarn Workspaces Hoisting

In a Yarn Workspaces monorepo:
- Dependencies are **hoisted** to the root `node_modules/`
- Individual app folders have minimal `node_modules/` (mostly just symlinks)
- Detox is installed at: `/Users/youruser/projects/apps-monorepo/node_modules/detox`

### detox-cli Issue

The `detox-cli` wrapper script looks for Detox in the current directory:
```bash
DETOX_PATH="${PWD}/node_modules/detox"
```

This fails in a monorepo because:
- Running from `apps/BoilerplateApp/`
- Detox is at `../../node_modules/detox`
- The script cannot find it

## Solution

### Use Direct Detox CLI

Instead of using the `detox-cli` wrapper, we use Detox's local CLI directly:

```json
{
  "scripts": {
    "e2e:build:ios": "node ../../node_modules/detox/local-cli/cli.js build --configuration ios.sim.debug",
    "e2e:test:ios": "node ../../node_modules/detox/local-cli/cli.js test --configuration ios.sim.debug"
  }
}
```

This approach:
- ✅ Works with hoisted dependencies
- ✅ Doesn't require detox-cli wrapper
- ✅ Uses the same Detox version for all apps
- ✅ Compatible with Yarn Workspaces

## Verification

From `apps/BoilerplateApp/` directory:

```bash
# Test Detox CLI
node ../../node_modules/detox/local-cli/cli.js --version
# Should output: 20.27.4

# Run E2E tests
npm run e2e:build:ios
npm run e2e:test:ios
```

## For New Apps

When you create a new app with `npm run create-app YourApp`:

1. **Detox dependencies** are already in root package.json
2. **Scripts** are configured in the generated app
3. **No additional installation** needed
4. **Just run the tests**:
   ```bash
   cd apps/YourApp
   npm run e2e:test:ios
   ```

## Alternative Approaches

### Option 1: Install Detox Locally (Not Recommended)

You could install Detox in each app's package.json:
```bash
cd apps/MyApp
npm install --save-dev detox
```

**Downsides**:
- Duplicates dependencies
- Larger repository size
- Version management complexity
- Against monorepo best practices

### Option 2: Use Relative Path to Binary

```json
{
  "scripts": {
    "e2e:test:ios": "../../node_modules/.bin/detox test --configuration ios.sim.debug"
  }
}
```

**Downsides**:
- Still uses detox-cli wrapper
- May fail with "detox is not installed" error
- Less reliable than direct CLI

### Option 3: Run from Root Directory

```bash
cd ../../  # Go to root
./node_modules/.bin/detox test --configuration ios.sim.debug --cwd apps/BoilerplateApp
```

**Downsides**:
- Less convenient
- Need to specify working directory
- Scripts become more complex

## Why We Chose Direct CLI

The **direct Detox CLI** approach is:
1. ✅ **Most reliable** - Always finds Detox
2. ✅ **Monorepo-friendly** - Works with hoisted deps
3. ✅ **Simple** - Clear, explicit path
4. ✅ **Maintainable** - Easy to understand
5. ✅ **Future-proof** - Doesn't depend on detox-cli behavior

## Troubleshooting

### Error: "detox is not installed in this directory"

**Cause**: Using `detox` command directly or `npx detox`

**Solution**: Use the npm scripts:
```bash
npm run e2e:test:ios
# NOT: detox test
# NOT: npx detox test
```

### Error: "Cannot find module 'detox'"

**Cause**: Dependencies not installed or hoisted incorrectly

**Solution**:
```bash
# From root
npm install

# Or from app
cd ../.. && npm install && cd -
```

### Error: "Configuration not found"

**Cause**: Running from wrong directory or missing .detoxrc.js

**Solution**: Always run from app directory:
```bash
cd apps/BoilerplateApp
npm run e2e:test:ios
```

### Tests pass but nothing happens

**Cause**: Simulator/emulator not configured

**Solution**:
```bash
# iOS: Verify simulator exists
xcrun simctl list devices | grep "iPhone 15 Pro"

# Android: Verify emulator exists
emulator -list-avds | grep Pixel_7_API_34
```

## Benefits of Monorepo E2E Setup

### Shared Dependencies
- ✅ Single Detox version for all apps
- ✅ Consistent testing environment
- ✅ Smaller total repository size

### Easy Updates
```bash
# Update Detox for ALL apps at once
cd /path/to/monorepo
npm update detox
```

### Consistent Configuration
- Same test patterns across apps
- Shared helper utilities
- Unified best practices

### Faster CI/CD
- Dependencies cached once
- Parallel test execution possible
- Shared test infrastructure

## CI/CD Considerations

### GitHub Actions

```yaml
name: E2E Tests

on: [push]

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      # Install dependencies at ROOT
      - name: Install dependencies
        run: npm install

      # Run tests from app directory
      - name: Build E2E (iOS)
        run: |
          cd apps/BoilerplateApp
          npm run e2e:build:ios

      - name: Run E2E tests (iOS)
        run: |
          cd apps/BoilerplateApp
          npm run e2e:test:ios
```

**Key points**:
- Install dependencies at root level
- Run tests from app directory
- Use npm scripts (not detox command directly)

## Summary

**Configuration**: Use direct Detox CLI with relative path
```json
"e2e:test:ios": "node ../../node_modules/detox/local-cli/cli.js test --configuration ios.sim.debug"
```

**Usage**: Always use npm scripts
```bash
npm run e2e:test:ios
```

**Don't Use**: detox command directly
```bash
detox test  # ❌ Will fail
npx detox test  # ❌ Will fail
```

---

**This setup is already configured in BoilerplateApp and all generated apps!** 🎉
