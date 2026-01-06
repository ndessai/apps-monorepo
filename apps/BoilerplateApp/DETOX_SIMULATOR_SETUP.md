# Detox Simulator Configuration

Quick guide for configuring the iOS simulator for Detox testing.

## Default Configuration

The `.detoxrc.js` is configured to use:
```javascript
device: {
  type: 'iPhone 17 Pro',
}
```

## Finding Available Simulators

List all available iPhone simulators on your system:

```bash
xcrun simctl list devices available | grep -i iphone
```

Example output:
```
iPhone 17 Pro (CDB626AB-679E-4BAC-86C3-D3CFB7400757) (Shutdown)
iPhone 17 Pro Max (140C6109-EDCA-4413-8ABE-47A1E49DDDAB) (Shutdown)
iPhone Air (686861BA-D25D-44EB-9F9E-DDB60E12C520) (Shutdown)
```

## Changing the Simulator

If you get an error like:
```
DetoxRuntimeError: Failed to find a device by type = "iPhone 15 Pro"
```

**Solution**: Update `.detoxrc.js` to use an available simulator:

1. Open `.detoxrc.js`
2. Find the `devices.simulator` section:
   ```javascript
   devices: {
     simulator: {
       type: 'ios.simulator',
       device: {
         type: 'iPhone 17 Pro',  // ← Change this
       },
     },
   ```
3. Change to a simulator from your available list

## Common Simulators

Choose one that's available on your system:

**Recent models**:
- `iPhone 17 Pro`
- `iPhone 17 Pro Max`
- `iPhone 17`
- `iPhone 16 Pro`
- `iPhone 16`

**Older models**:
- `iPhone 15 Pro`
- `iPhone 15`
- `iPhone 14 Pro`
- `iPhone SE (3rd generation)`

## Creating a Simulator

If you don't have the simulator you want:

```bash
# List available iOS versions
xcrun simctl list runtimes

# Create a new simulator
xcrun simctl create "iPhone 15 Pro" "iPhone 15 Pro" "iOS-17.0"
```

Replace `iOS-17.0` with your available runtime.

## Testing Your Configuration

After updating `.detoxrc.js`:

```bash
# Test if Detox can find the simulator
cd apps/BoilerplateApp
npm run e2e:build:ios
npm run e2e:test:ios
```

If it works, you'll see the simulator boot and the tests run.

## Booting the Simulator Manually

Sometimes it helps to boot the simulator before running tests:

```bash
# List available simulators with UUIDs
xcrun simctl list devices | grep "iPhone 17 Pro"

# Boot the simulator (use UUID from above)
xcrun simctl boot CDB626AB-679E-4BAC-86C3-D3CFB7400757

# Or just open Simulator app
open -a Simulator
```

## Alternative: Use Any Available iPhone

If you don't want to specify an exact model, you can use a pattern:

```javascript
devices: {
  simulator: {
    type: 'ios.simulator',
    device: {
      type: 'iPhone 17 Pro',  // Still need to specify one
    },
  },
}
```

**Note**: Detox requires specifying an exact device type. You cannot use wildcards.

## Troubleshooting

### Error: "Failed to find a device by type"

**Cause**: The specified device type doesn't match any available simulators.

**Solution**:
1. Run `xcrun simctl list devices available | grep -i iphone`
2. Pick a device from the output
3. Update `.detoxrc.js` with exact name
4. Rebuild: `npm run e2e:build:ios`

### Error: "No devices found"

**Cause**: No simulators available or Xcode not properly installed.

**Solution**:
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify Xcode
xcodebuild -version

# List runtimes
xcrun simctl list runtimes
```

### Simulator boots but tests don't run

**Cause**: Metro bundler might not be running or app not installed.

**Solution**:
```bash
# Start Metro in separate terminal
cd apps/BoilerplateApp
npm start

# In another terminal, run tests
npm run e2e:test:ios
```

## Best Practices

1. **Use Pro models**: They're typically more stable for testing
2. **Use recent iOS versions**: Better support and fewer bugs
3. **Keep simulator closed**: Let Detox manage the simulator lifecycle
4. **One simulator at a time**: Close other simulators before testing

## For Team Consistency

If your team uses different simulators, you can make the configuration flexible:

Create a `.detoxrc.local.js` (git-ignored) that team members can customize:

```javascript
// .detoxrc.local.js
const config = require('./.detoxrc.js');

// Override the simulator device
config.devices.simulator.device.type = 'iPhone 16 Pro'; // Your preferred model

module.exports = config;
```

Then update the test scripts to use it if it exists.

---

**Current Configuration**: iPhone 17 Pro ✅

This is already set up and working!
