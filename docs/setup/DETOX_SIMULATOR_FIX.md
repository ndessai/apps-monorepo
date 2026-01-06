# Detox Simulator Configuration - Fixed ✅

## Issue

When running E2E tests, you encountered:
```
DetoxRuntimeError: Failed to find a device by type = "iPhone X"
```

or

```
DetoxRuntimeError: Failed to find a device by type = "iPhone 15 Pro"
```

## Root Cause

The `.detoxrc.js` file was configured with a simulator that doesn't exist on your system. Different Xcode versions come with different simulator versions.

## Solution Applied

### 1. Updated Simulator Configuration

Updated [.detoxrc.js](apps/BoilerplateApp/.detoxrc.js:45) to use an available simulator:

```javascript
devices: {
  simulator: {
    type: 'ios.simulator',
    device: {
      type: 'iPhone 17 Pro',  // ✅ Updated to available simulator
    },
  },
}
```

### 2. Verified Available Simulators

Your system has these simulators:
- iPhone 17 Pro ✅ (now configured)
- iPhone 17 Pro Max
- iPhone Air
- iPhone 17
- iPhone 16e

### 3. Created Configuration Guide

Created [DETOX_SIMULATOR_SETUP.md](apps/BoilerplateApp/DETOX_SIMULATOR_SETUP.md) with:
- How to check available simulators
- How to change the simulator configuration
- Troubleshooting steps
- Team configuration tips

### 4. Updated Documentation

Updated [E2E_TESTING.md](apps/BoilerplateApp/E2E_TESTING.md:93) to include:
- Simulator setup instructions
- Link to configuration guide
- Troubleshooting for simulator errors

## How to Use

Now you can run E2E tests:

```bash
cd apps/BoilerplateApp

# Build for testing
npm run e2e:build:ios

# Run tests
npm run e2e:test:ios
```

The tests will now use **iPhone 17 Pro** simulator.

## Changing Simulator (If Needed)

If you want to use a different simulator:

### Step 1: Check Available Simulators
```bash
xcrun simctl list devices available | grep -i iphone
```

### Step 2: Update Configuration

Edit `apps/BoilerplateApp/.detoxrc.js`:

```javascript
devices: {
  simulator: {
    type: 'ios.simulator',
    device: {
      type: 'iPhone 17 Pro Max',  // Change this to your preferred simulator
    },
  },
}
```

### Step 3: Rebuild
```bash
npm run e2e:build:ios
```

## Common Simulators by Xcode Version

**Xcode 16 (Latest)**:
- iPhone 17 Pro
- iPhone 17 Pro Max
- iPhone 17
- iPhone 16 Pro
- iPhone 16

**Xcode 15**:
- iPhone 15 Pro
- iPhone 15 Pro Max
- iPhone 15
- iPhone 14 Pro

**Xcode 14**:
- iPhone 14 Pro
- iPhone 14
- iPhone SE (3rd generation)

## Why This Happened

1. The boilerplate was created with a default simulator configuration
2. Different developers have different Xcode versions installed
3. Each Xcode version comes with different simulator versions
4. The configuration needs to match your system's available simulators

## Prevention for New Apps

When creating a new app with `npm run create-app`, you may need to:

1. Check your available simulators
2. Update `.detoxrc.js` in the new app
3. Rebuild before running tests

## Documentation Links

- [DETOX_SIMULATOR_SETUP.md](apps/BoilerplateApp/DETOX_SIMULATOR_SETUP.md) - Full configuration guide
- [E2E_TESTING.md](apps/BoilerplateApp/E2E_TESTING.md) - Complete E2E testing guide
- [.detoxrc.js](apps/BoilerplateApp/.detoxrc.js) - Configuration file

## Quick Reference

```bash
# Check simulators
xcrun simctl list devices available | grep -i iphone

# Boot a simulator
xcrun simctl boot "iPhone 17 Pro"

# Open Simulator app
open -a Simulator

# Run E2E tests
cd apps/BoilerplateApp
npm run e2e:build:ios
npm run e2e:test:ios
```

---

## Status: ✅ FIXED

The configuration is now set to **iPhone 17 Pro** and ready to run tests!

```bash
cd apps/BoilerplateApp
npm run e2e:test:ios
```
