# E2E Testing with Detox

Complete guide for end-to-end testing in QuizApp using Detox framework.

## 📋 Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

This project uses [Detox](https://wix.github.io/Detox/) for end-to-end testing. Detox is a gray box testing framework that allows you to test your React Native app on real devices and simulators.

### What's Included

- ✅ Detox 20.27.4 configured for iOS and Android
- ✅ Test IDs added to all major components
- ✅ Comprehensive test suites for all screens
- ✅ Navigation testing
- ✅ Helper utilities for common test operations
- ✅ Monorepo-friendly configuration (works with Yarn Workspaces)

### ⚠️ Important: Monorepo Setup

This app is part of a **Yarn Workspaces monorepo**. Dependencies are hoisted to the root `node_modules/`. The E2E scripts use Detox's direct CLI to work around this:

```json
"e2e:test:ios": "node ../../node_modules/detox/local-cli/cli.js test ..."
```

**Always use npm scripts** - Don't run `detox` or `npx detox` directly.

See [Monorepo Setup Guide](../../docs/setup/E2E_MONOREPO_SETUP.md) for details.

### Test Coverage

1. **Hello Screen** ([e2e/helloScreen.test.js](e2e/helloScreen.test.js))
   - Display verification
   - Swipeable cards functionality
   - Card deletion with confirmation
   - Cancel deletion

2. **Second Screen** ([e2e/secondScreen.test.js](e2e/secondScreen.test.js))
   - React Query loading states
   - Data fetching and display
   - Refresh functionality
   - Features list
   - Scrolling behavior

3. **Navigation** ([e2e/navigation.test.js](e2e/navigation.test.js))
   - Tab bar visibility
   - Tab switching
   - State preservation
   - Rapid navigation

---

## Setup

### Prerequisites

#### iOS
- macOS with Xcode installed
- iOS Simulator
- Xcode Command Line Tools: `xcode-select --install`

#### Android
- Android Studio
- Android Emulator (AVD)
- Android SDK Platform Tools

### Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
# From QuizApp directory
npx yarn install

# iOS pods (for iOS testing)
cd ios && bundle exec pod install && cd ..
```

### iOS Simulator Setup

1. Check available simulators:
   ```bash
   xcrun simctl list devices available | grep -i iphone
   ```

2. The `.detoxrc.js` is configured for **iPhone 17 Pro** (update if needed)

3. If you get "Failed to find a device" error, see [DETOX_SIMULATOR_SETUP.md](DETOX_SIMULATOR_SETUP.md) for configuration guide

### Android Emulator Setup

1. Create an AVD in Android Studio:
   - Name: `Pixel_7_API_34`
   - Device: Pixel 7
   - System Image: API Level 34 (Android 14)

2. Or create via command line:
   ```bash
   avdmanager create avd -n Pixel_7_API_34 -k "system-images;android-34;google_apis;x86_64" -d pixel_7
   ```

3. Verify emulator:
   ```bash
   emulator -list-avds
   ```

---

## Running Tests

### iOS Tests

#### Build the app for testing:
```bash
npm run e2e:build:ios
```

#### Run the tests:
```bash
npm run e2e:test:ios
```

#### Combined (build + test):
```bash
npm run e2e:build:ios && npm run e2e:test:ios
```

### Android Tests

#### Start the emulator first:
```bash
emulator -avd Pixel_7_API_34
```

#### Build the app for testing:
```bash
npm run e2e:build:android
```

#### Run the tests:
```bash
npm run e2e:test:android
```

### Run Specific Test Files

```bash
# Run only hello screen tests
detox test --configuration ios.sim.debug e2e/helloScreen.test.js

# Run only navigation tests
detox test --configuration android.emu.debug e2e/navigation.test.js
```

### Run with Options

```bash
# Run with debugging output
detox test --configuration ios.sim.debug --loglevel trace

# Run specific test by name
detox test --configuration ios.sim.debug --testNamePattern="should navigate"

# Run without building (if already built)
detox test --configuration ios.sim.debug --reuse

# Record video of test execution (iOS)
detox test --configuration ios.sim.debug --record-videos all
```

---

## Test Structure

### File Organization

```
e2e/
├── jest.config.js          # Jest configuration for E2E
├── helpers.js              # Common test utilities
├── helloScreen.test.js     # Hello screen tests
├── secondScreen.test.js    # Second screen tests
└── navigation.test.js      # Navigation tests
```

### Test File Template

```javascript
import { device, element, by, expect, waitFor } from 'detox';

describe('Screen Name', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should do something', async () => {
    // Test implementation
  });
});
```

### Configuration

Configuration is in [.detoxrc.js](.detoxrc.js):

- **Apps**: Build configurations for iOS and Android
- **Devices**: Simulator/emulator configurations
- **Configurations**: Test configurations combining app + device

---

## Writing Tests

### Finding Elements

```javascript
// By test ID (recommended)
element(by.id('hello-screen'))

// By text
element(by.text('Hello!'))

// By label (iOS accessibility label)
element(by.label('Submit Button'))

// By type (native component type)
element(by.type('RCTTextInput'))
```

### Common Actions

```javascript
// Tap
await element(by.id('button')).tap();

// Type text
await element(by.id('input')).typeText('Hello');

// Clear text
await element(by.id('input')).clearText();

// Swipe
await element(by.id('card')).swipe('left', 'fast', 0.75);

// Scroll
await element(by.id('scroll-view')).scrollTo('bottom');

// Long press
await element(by.id('item')).longPress();
```

### Assertions

```javascript
// Visibility
await expect(element(by.id('screen'))).toBeVisible();
await expect(element(by.id('screen'))).not.toBeVisible();

// Existence
await expect(element(by.id('element'))).toExist();
await expect(element(by.id('element'))).not.toExist();

// Text
await expect(element(by.id('label'))).toHaveText('Hello');

// Value
await expect(element(by.id('input'))).toHaveValue('Test');
```

### Waiting for Elements

```javascript
// Wait for element to be visible
await waitFor(element(by.id('screen')))
  .toBeVisible()
  .withTimeout(5000);

// Wait for element to not exist
await waitFor(element(by.id('loading')))
  .not.toExist()
  .withTimeout(10000);

// Wait while performing action
await waitFor(element(by.id('button')))
  .toBeVisible()
  .whileElement(by.id('scroll-view'))
  .scroll(50, 'down');
```

### Test IDs Best Practices

All major UI elements have test IDs:

```typescript
// In React Native components
<View testID="hello-screen">
  <Text testID="hello-title">Hello!</Text>
  <Button testID="submit-button">Submit</Button>
</View>
```

Test ID naming convention:
- Use kebab-case: `hello-screen`, `submit-button`
- Be descriptive: `swipeable-card-1`, not just `card1`
- Include IDs for: screens, buttons, inputs, cards, lists
- For dynamic content: use IDs with keys: `card-${id}`

---

## Best Practices

### 1. Always Use Test IDs
✅ **Good**: `element(by.id('submit-button'))`
❌ **Bad**: `element(by.text('Submit'))` (text can change with localization)

### 2. Wait for Elements
```javascript
// Good - wait for element
await waitFor(element(by.id('screen')))
  .toBeVisible()
  .withTimeout(5000);

// Bad - immediate check might fail
await expect(element(by.id('screen'))).toBeVisible();
```

### 3. Clean State Between Tests
```javascript
beforeEach(async () => {
  await device.reloadReactNative();
});
```

### 4. Handle Platform Differences
```javascript
if (device.getPlatform() === 'ios') {
  await element(by.label('Delete')).tap();
} else {
  await element(by.text('Delete')).tap();
}
```

### 5. Add Delays for Animations
```javascript
// Wait for swipe animation
await element(by.id('card')).swipe('left');
await new Promise(resolve => setTimeout(resolve, 500));
```

### 6. Use Descriptive Test Names
```javascript
// Good
it('should delete card when delete button is tapped after swiping left', async () => {

// Bad
it('test delete', async () => {
```

### 7. Test One Thing at a Time
Keep tests focused and independent. Each test should verify one specific behavior.

### 8. Don't Test Implementation Details
Test user-visible behavior, not internal state or implementation.

---

## Troubleshooting

### iOS Issues

#### Simulator Not Found / Failed to find device

**Error**: `DetoxRuntimeError: Failed to find a device by type = "iPhone 15 Pro"`

**Cause**: The simulator specified in `.detoxrc.js` is not available on your system.

**Solution**:
```bash
# 1. Check available simulators
xcrun simctl list devices available | grep -i iphone

# 2. Update .detoxrc.js with an available simulator
# Edit: devices.simulator.device.type = 'iPhone 17 Pro'

# 3. Rebuild
npm run e2e:build:ios
```

See [DETOX_SIMULATOR_SETUP.md](DETOX_SIMULATOR_SETUP.md) for detailed configuration guide.

#### Build Failed
```bash
# Clean iOS build
cd ios
rm -rf build Pods
bundle exec pod install
cd ..

# Rebuild
npm run e2e:build:ios
```

#### App Not Launching
```bash
# Reset simulator
xcrun simctl erase all

# Reinstall app
npm run e2e:build:ios
```

### Android Issues

#### Emulator Not Starting
```bash
# Kill existing emulator processes
adb kill-server
adb start-server

# Start emulator
emulator -avd Pixel_7_API_34
```

#### Build Failed
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild
npm run e2e:build:android
```

#### Connection Issues
```bash
# Reverse port for Metro
adb reverse tcp:8081 tcp:8081

# Check connected devices
adb devices
```

### General Issues

#### Tests Timing Out
- Increase timeout in test: `.withTimeout(10000)`
- Check if Metro bundler is running
- Verify simulator/emulator is responding

#### Element Not Found
- Verify test ID is correct in component
- Check if element is actually visible (not scrolled off-screen)
- Wait for element with `waitFor()`

#### Flaky Tests
- Add explicit waits after animations
- Reload app state in `beforeEach`
- Check for race conditions
- Use `.withTimeout()` appropriately

#### Metro Bundler Issues
```bash
# Reset Metro cache
npm start -- --reset-cache

# Or
npx react-native start --reset-cache
```

---

## Advanced Usage

### Recording Videos

iOS:
```bash
detox test --configuration ios.sim.debug --record-videos all
```

Videos saved to: `artifacts/`

### Taking Screenshots

```javascript
it('should display screen', async () => {
  await expect(element(by.id('screen'))).toBeVisible();
  await device.takeScreenshot('screen-loaded');
});
```

### Custom Matchers

Create custom matchers in `e2e/helpers.js`:

```javascript
export const expectTextVisible = async (text) => {
  await expect(element(by.text(text))).toBeVisible();
};
```

### Debugging Tests

```bash
# Run with verbose logging
detox test --configuration ios.sim.debug --loglevel trace

# Run single test with debugging
detox test --configuration ios.sim.debug --testNamePattern="should display" --loglevel trace
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: cd ios && pod install
      - run: npm run e2e:build:ios
      - run: npm run e2e:test:ios
```

---

## Additional Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [Detox API Reference](https://wix.github.io/Detox/docs/api/actions)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)

---

**Happy Testing! 🧪**
