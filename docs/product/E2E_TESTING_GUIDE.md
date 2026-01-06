# E2E Testing Guide - Detox Framework

Complete guide for implementing and running end-to-end tests using Detox in BoilerplateApp.

## 🎯 Overview

End-to-end testing with Detox has been fully integrated into the BoilerplateApp. All generated apps from the template will include complete E2E testing capabilities out of the box.

### What Was Added

1. **Detox Framework** (v20.27.4)
   - Configured for iOS and Android
   - Jest test runner integration
   - Test environment setup

2. **Test IDs**
   - Added to all major UI components
   - Consistent naming convention
   - Dynamic IDs for lists and cards

3. **Test Suites**
   - Hello Screen tests (swipeable cards, deletion)
   - Second Screen tests (React Query, data fetching)
   - Navigation tests (tab switching, state preservation)

4. **Helper Utilities**
   - Common test actions
   - Wait helpers
   - Platform-specific handling

5. **Documentation**
   - Complete testing guide
   - Troubleshooting section
   - Best practices

---

## 📦 Installation

Already included in BoilerplateApp! When you create a new app with `npm run create-app`, Detox will be included.

### Manual Installation (if needed)

```bash
cd apps/YourApp
npx yarn add -D detox@20.27.4 detox-cli@1.0.1 jest-circus@29.7.0
```

---

## 🚀 Quick Start

### iOS Testing

```bash
cd apps/BoilerplateApp

# 1. Build the test app
npm run e2e:build:ios

# 2. Run tests
npm run e2e:test:ios
```

### Android Testing

```bash
cd apps/BoilerplateApp

# 1. Start emulator
emulator -avd Pixel_7_API_34

# 2. Build the test app
npm run e2e:build:android

# 3. Run tests
npm run e2e:test:android
```

---

## 📁 Project Structure

```
apps/BoilerplateApp/
├── .detoxrc.js              # Detox configuration
├── e2e/
│   ├── jest.config.js       # Jest E2E configuration
│   ├── helpers.js           # Test utilities
│   ├── helloScreen.test.js  # Hello screen tests
│   ├── secondScreen.test.js # Second screen tests
│   └── navigation.test.js   # Navigation tests
├── src/
│   ├── screens/
│   │   ├── HelloScreen.tsx  # With test IDs
│   │   └── SecondScreen.tsx # With test IDs
│   └── components/
│       └── SwipeableCard.tsx # With test IDs
└── E2E_TESTING.md           # Detailed testing docs
```

---

## 🧪 Test Coverage

### 1. Hello Screen Tests

**File**: `e2e/helloScreen.test.js`

**Coverage**:
- ✅ Display title and subtitle
- ✅ Display swipeable cards
- ✅ Swipe card left to reveal delete
- ✅ Delete card with confirmation
- ✅ Cancel card deletion

**Key Test IDs**:
- `hello-screen`
- `hello-title`
- `hello-subtitle`
- `swipeable-card-{id}`
- `card-title-{id}`
- `card-description-{id}`

### 2. Second Screen Tests

**File**: `e2e/secondScreen.test.js`

**Coverage**:
- ✅ Navigate to screen via tab bar
- ✅ React Query loading state
- ✅ Data fetching and display
- ✅ Refresh data functionality
- ✅ Features list display
- ✅ Scroll behavior

**Key Test IDs**:
- `second-screen`
- `second-title`
- `react-query-card`
- `loading-text`
- `data-container`
- `data-message`
- `refresh-button`
- `features-card`

### 3. Navigation Tests

**File**: `e2e/navigation.test.js`

**Coverage**:
- ✅ Bottom tab bar visibility
- ✅ Default screen (Home)
- ✅ Tab switching
- ✅ State preservation across tabs
- ✅ Rapid tab switching
- ✅ Tab icons

---

## 📝 Writing Tests

### Basic Test Structure

```javascript
import { device, element, by, expect, waitFor } from 'detox';

describe('My Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display screen', async () => {
    await expect(element(by.id('my-screen'))).toBeVisible();
  });
});
```

### Adding Test IDs to Components

```typescript
// In your React Native component
<View testID="my-screen">
  <Text testID="title">Hello World</Text>
  <Button testID="submit-button" onPress={handleSubmit}>
    Submit
  </Button>
</View>
```

### Common Test Patterns

**Navigation**:
```javascript
// Navigate to a tab
await element(by.text('Second')).tap();

// Wait for screen
await waitFor(element(by.id('second-screen')))
  .toBeVisible()
  .withTimeout(5000);
```

**Swiping**:
```javascript
// Swipe left
await element(by.id('card')).swipe('left', 'fast', 0.75);

// Wait for animation
await new Promise(resolve => setTimeout(resolve, 500));
```

**Scrolling**:
```javascript
// Scroll to bottom
await element(by.id('scroll-view')).scrollTo('bottom');

// Scroll to top
await element(by.id('scroll-view')).scrollTo('top');
```

**Waiting for Data**:
```javascript
// Wait for element to appear
await waitFor(element(by.id('data-container')))
  .toBeVisible()
  .withTimeout(5000);
```

---

## 🔧 Configuration

### .detoxrc.js

```javascript
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/BoilerplateApp.app',
      build: 'xcodebuild ...',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 15 Pro' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_7_API_34' },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
```

---

## 💡 Best Practices

### 1. Use Test IDs, Not Text
✅ **Good**: `element(by.id('submit-button'))`
❌ **Bad**: `element(by.text('Submit'))`

Reason: Text can change with localization

### 2. Always Wait for Elements
```javascript
await waitFor(element(by.id('screen')))
  .toBeVisible()
  .withTimeout(5000);
```

### 3. Handle Platform Differences
```javascript
if (device.getPlatform() === 'ios') {
  await element(by.label('Delete')).tap();
} else {
  await element(by.text('Delete')).tap();
}
```

### 4. Clean State Between Tests
```javascript
beforeEach(async () => {
  await device.reloadReactNative();
});
```

### 5. Add Delays for Animations
```javascript
await element(by.id('card')).swipe('left');
await new Promise(resolve => setTimeout(resolve, 500));
```

### 6. Test ID Naming Convention
- Use kebab-case: `hello-screen`, `submit-button`
- Be descriptive: `swipeable-card-1` not `card1`
- Include dynamic IDs: `card-${id}`, `item-${index}`

---

## 🐛 Troubleshooting

### iOS Build Fails

```bash
cd ios
rm -rf build Pods
bundle exec pod install
cd ..
npm run e2e:build:ios
```

### Android Build Fails

```bash
cd android
./gradlew clean
cd ..
npm run e2e:build:android
```

### Tests Timeout

- Increase timeout: `.withTimeout(10000)`
- Check Metro bundler is running
- Verify simulator/emulator is responsive

### Element Not Found

- Verify test ID in component
- Check if element is scrolled off-screen
- Use `waitFor()` before assertions

### Emulator Not Found (Android)

```bash
# List available emulators
emulator -list-avds

# Create new emulator
avdmanager create avd -n Pixel_7_API_34 -k "system-images;android-34;google_apis;x86_64"
```

---

## 🚀 Running Tests in CI/CD

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  ios-e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          npm install
          cd apps/BoilerplateApp/ios
          bundle install
          bundle exec pod install
      - name: Build for E2E
        run: cd apps/BoilerplateApp && npm run e2e:build:ios
      - name: Run E2E tests
        run: cd apps/BoilerplateApp && npm run e2e:test:ios
      - name: Upload artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: detox-artifacts
          path: apps/BoilerplateApp/artifacts/

  android-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
      - name: Install dependencies
        run: npm install
      - name: Start emulator
        run: |
          avdmanager create avd -n test -k "system-images;android-34;google_apis;x86_64"
          emulator -avd test -no-window -no-audio &
      - name: Build for E2E
        run: cd apps/BoilerplateApp && npm run e2e:build:android
      - name: Run E2E tests
        run: cd apps/BoilerplateApp && npm run e2e:test:android
```

---

## 📚 Additional Resources

- [BoilerplateApp E2E Documentation](../../apps/BoilerplateApp/E2E_TESTING.md)
- [Detox Official Docs](https://wix.github.io/Detox/)
- [Detox API Reference](https://wix.github.io/Detox/docs/api/actions)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

## 🎯 Next Steps

1. **Run the example tests** to verify setup
2. **Add test IDs** to your custom components
3. **Write tests** for your app-specific features
4. **Integrate into CI/CD** pipeline
5. **Review and refactor** tests regularly

---

## ✅ What's Included in Generated Apps

When you create a new app with `npm run create-app YourAppName`:

✅ Detox dependencies installed
✅ Configuration files (.detoxrc.js, e2e/jest.config.js)
✅ Example test suites (hello, second, navigation)
✅ Test IDs in all screens and components
✅ Helper utilities (e2e/helpers.js)
✅ Documentation (E2E_TESTING.md)
✅ NPM scripts for running tests

Everything you need to start testing immediately!

---

**Happy Testing! 🧪**
