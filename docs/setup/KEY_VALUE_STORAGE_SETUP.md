# Key-Value Storage Setup - React Native MMKV

**Setup Date**: 2026-01-06
**Status**: ✅ Complete

## Overview

Industry-standard key-value storage using **React Native MMKV** - the fastest local storage solution for React Native.

### What is MMKV?

MMKV is a high-performance, memory-mapped key-value storage framework developed by Tencent WeChat and adapted for React Native by Margelo. It's used by major apps like Shopify, Discord, and thousands of other production apps.

### Why MMKV?

✅ **10x Faster** - Synchronous API, up to 30x faster than AsyncStorage
✅ **Type-Safe** - Full TypeScript support with typed methods
✅ **Reliable** - Battle-tested by WeChat (1 billion+ users)
✅ **Small** - Minimal bundle size impact
✅ **Encrypted** - Optional encryption support
✅ **Reactive** - Change listeners for real-time updates
✅ **New Architecture** - Uses React Native's New Architecture (Nitro Modules)

## What's Been Done ✅

### 1. Dependencies Installed

```bash
npm install react-native-mmkv
```

**Version Installed**: `react-native-mmkv@4.1.0`

**Peer Dependencies**:
- `react-native-nitro-modules@0.32.0` (automatically installed)
- `MMKVCore@2.2.4` (iOS CocoaPod)

### 2. iOS Native Modules Linked

Successfully installed iOS pods:
- **NitroModules** (0.32.0) - React Native's new architecture framework
- **NitroMmkv** (4.1.0) - MMKV bindings for React Native
- **MMKVCore** (2.2.4) - Core MMKV C++ library

```bash
cd ios && bundle exec pod install
```

**Total pods**: 90 dependencies installed

### 3. Podfile Configuration

Added explicit NitroModules dependency to fix auto-linking:

```ruby
target 'BoilerplateApp' do
  config = use_native_modules!

  # NitroModules dependency for react-native-mmkv
  pod 'NitroModules', :path => '../../../node_modules/react-native-nitro-modules'

  use_react_native!(
    :path => config[:reactNativePath],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )
end
```

### 4. Abstraction Layer Created

Created a clean, type-safe abstraction layer at `src/storage/`:

**Files Created**:
- `KeyValueStorage.ts` - Core storage API with typed methods
- `useStorage.ts` - React hooks for reactive storage

## Usage

### Basic Usage

```typescript
import { storage } from './storage/KeyValueStorage';

// Store values
storage.setString('username', 'john_doe');
storage.setNumber('userId', 123);
storage.setBoolean('isLoggedIn', true);
storage.setObject('user', { name: 'John', age: 30 });

// Retrieve values
const username = storage.getString('username');
const userId = storage.getNumber('userId');
const isLoggedIn = storage.getBoolean('isLoggedIn');
const user = storage.getObject<User>('user');

// Delete values
storage.delete('username');

// Clear all storage
storage.clearAll();
```

### Using React Hooks

```typescript
import { useStorageString, useStorageBoolean, useStorageObject } from './storage/useStorage';

function MyComponent() {
  const [username, setUsername] = useStorageString('username');
  const [isLoggedIn, setLoggedIn] = useStorageBoolean('is_logged_in');
  const [user, setUser] = useStorageObject<User>('user');

  return (
    <View>
      <Text>Username: {username}</Text>
      <Button
        title="Update Username"
        onPress={() => setUsername('new_username')}
      />
    </View>
  );
}
```

### Using Pre-built Helpers

The abstraction layer includes domain-specific helpers:

**Authentication Storage**:
```typescript
import { authStorage } from './storage/KeyValueStorage';

// Save auth data
authStorage.setAuthToken('jwt-token-here');
authStorage.setRefreshToken('refresh-token-here');
authStorage.setUserId(123);
authStorage.setLoggedIn(true);

// Retrieve auth data
const token = authStorage.getAuthToken();
const isLoggedIn = authStorage.isLoggedIn();

// Clear auth data
authStorage.clearAuth();
```

**User Preferences**:
```typescript
import { preferencesStorage } from './storage/KeyValueStorage';

// Save preferences
preferencesStorage.setTheme('dark');
preferencesStorage.setLanguage('en');
preferencesStorage.setNotificationsEnabled(true);

// Retrieve preferences
const theme = preferencesStorage.getTheme(); // 'light' | 'dark'
const enabled = preferencesStorage.areNotificationsEnabled();
```

**App State**:
```typescript
import { appStateStorage } from './storage/KeyValueStorage';

// Track onboarding
appStateStorage.setOnboardingCompleted(true);
const completed = appStateStorage.isOnboardingCompleted();

// Track app version
appStateStorage.setLastAppVersion('1.0.0');
const lastVersion = appStateStorage.getLastAppVersion();
```

### Centralized Storage Keys

Use the `StorageKeys` constant to avoid typos:

```typescript
import { storage, StorageKeys } from './storage/KeyValueStorage';

storage.setString(StorageKeys.AUTH_TOKEN, 'my-token');
const token = storage.getString(StorageKeys.AUTH_TOKEN);
```

**Available Keys**:
```typescript
StorageKeys.AUTH_TOKEN
StorageKeys.REFRESH_TOKEN
StorageKeys.USER_ID
StorageKeys.IS_LOGGED_IN
StorageKeys.THEME
StorageKeys.LANGUAGE
StorageKeys.NOTIFICATIONS_ENABLED
StorageKeys.ONBOARDING_COMPLETED
StorageKeys.LAST_APP_VERSION
```

## Advanced Features

### Storage Listeners

Listen for changes to any key:

```typescript
import { storage } from './storage/KeyValueStorage';

const removeListener = storage.addOnValueChangedListener((key) => {
  console.log(`Value changed for key: ${key}`);
  const newValue = storage.getString(key);
  console.log(`New value: ${newValue}`);
});

// Remove listener when done
removeListener();
```

### Encryption (Optional)

Enable encryption by modifying `KeyValueStorage.ts`:

```typescript
export const mmkv = new MMKV({
  id: 'boilerplate-app-storage',
  encryptionKey: 'your-secure-encryption-key-here',
});
```

**Security Note**: Store the encryption key securely (e.g., using react-native-keychain).

### Check if Key Exists

```typescript
if (storage.contains('username')) {
  const username = storage.getString('username');
}
```

### Get All Keys

```typescript
const allKeys = storage.getAllKeys();
console.log('All storage keys:', allKeys);
```

### Storage Size

```typescript
const sizeInBytes = storage.getSize();
console.log(`Storage size: ${sizeInBytes} bytes`);
```

## API Reference

### Core Storage Methods

| Method | Description | Example |
|--------|-------------|---------|
| `setString(key, value)` | Store a string | `storage.setString('name', 'John')` |
| `getString(key)` | Get a string | `storage.getString('name')` |
| `setNumber(key, value)` | Store a number | `storage.setNumber('age', 25)` |
| `getNumber(key)` | Get a number | `storage.getNumber('age')` |
| `setBoolean(key, value)` | Store a boolean | `storage.setBoolean('active', true)` |
| `getBoolean(key)` | Get a boolean | `storage.getBoolean('active')` |
| `setObject(key, value)` | Store an object (JSON) | `storage.setObject('user', {...})` |
| `getObject<T>(key)` | Get an object (JSON) | `storage.getObject<User>('user')` |
| `delete(key)` | Delete a key | `storage.delete('name')` |
| `contains(key)` | Check if key exists | `storage.contains('name')` |
| `getAllKeys()` | Get all keys | `storage.getAllKeys()` |
| `clearAll()` | Clear all storage | `storage.clearAll()` |
| `getSize()` | Get storage size (bytes) | `storage.getSize()` |

### React Hooks

| Hook | Description | Example |
|------|-------------|---------|
| `useStorageString(key, default?)` | Reactive string storage | `const [name, setName] = useStorageString('name')` |
| `useStorageNumber(key, default?)` | Reactive number storage | `const [age, setAge] = useStorageNumber('age')` |
| `useStorageBoolean(key, default?)` | Reactive boolean storage | `const [active, setActive] = useStorageBoolean('active')` |
| `useStorageObject<T>(key, default?)` | Reactive object storage | `const [user, setUser] = useStorageObject<User>('user')` |
| `useStorageContains(key)` | Check if key exists | `const exists = useStorageContains('name')` |
| `useStorageKeys()` | Get all keys | `const keys = useStorageKeys()` |

## Migration from AsyncStorage

If you're migrating from AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from './storage/KeyValueStorage';

// Before (AsyncStorage)
await AsyncStorage.setItem('username', 'john');
const username = await AsyncStorage.getItem('username');

// After (MMKV)
storage.setString('username', 'john'); // Synchronous!
const username = storage.getString('username');
```

**Key Differences**:
- ✅ MMKV is synchronous (no `await` needed)
- ✅ MMKV is 10-30x faster
- ✅ MMKV supports numbers and booleans natively
- ✅ MMKV has change listeners

## Performance Comparison

| Operation | AsyncStorage | MMKV | Improvement |
|-----------|--------------|------|-------------|
| Write String | ~2.5ms | ~0.08ms | **30x faster** |
| Read String | ~2.0ms | ~0.06ms | **33x faster** |
| Write Object | ~3.0ms | ~0.15ms | **20x faster** |
| Read Object | ~2.5ms | ~0.12ms | **20x faster** |

*Benchmarks from react-native-mmkv repository*

## Android Support

MMKV works automatically on Android with no additional configuration required. The package includes native Android modules that are auto-linked.

### Android Gradle Configuration

No changes needed! Auto-linking handles everything.

## Benefits

### For Developers

✅ **Simple API** - Intuitive methods for common operations
✅ **Type Safety** - Full TypeScript support prevents runtime errors
✅ **Synchronous** - No async/await complexity
✅ **Fast Development** - Instant feedback with synchronous reads/writes

### For Users

✅ **Instant App Loading** - No waiting for data to load
✅ **Smooth UX** - No loading spinners for simple data
✅ **Offline First** - All data stored locally
✅ **Battery Efficient** - Memory-mapped I/O is power efficient

### For Production

✅ **Battle-Tested** - Used by WeChat (1 billion+ users)
✅ **Reliable** - Crash-safe with atomic operations
✅ **Scalable** - Handles MBs of data efficiently
✅ **Maintainable** - Active development by Margelo

## Use Cases

### Perfect For

- User authentication tokens
- User preferences (theme, language, etc.)
- App state (onboarding completed, etc.)
- Small-to-medium datasets (settings, configs)
- Caching API responses
- Feature flags
- Analytics events queue

### Not Ideal For

- Large files (use React Native FS instead)
- Relational data (use WatermelonDB instead)
- Data > 100MB (use SQLite/WatermelonDB)
- Sensitive data without encryption

## Troubleshooting

### iOS Build Errors

If you encounter iOS build errors after installation:

1. Clean build folder:
   ```bash
   cd ios && rm -rf build
   ```

2. Reinstall pods:
   ```bash
   cd ios && rm -rf Pods Podfile.lock && bundle exec pod install
   ```

3. Clean Xcode DerivedData:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```

### Android Build Errors

If you encounter Android build errors:

1. Clean Gradle:
   ```bash
   cd android && ./gradlew clean
   ```

2. Invalidate caches:
   ```bash
   cd android && ./gradlew cleanBuildCache
   ```

### NitroModules Not Found

If you see "Unable to find a specification for `NitroModules`":

**Solution**: The Podfile has been configured to explicitly reference NitroModules. This fix is already applied.

### Storage Not Persisting

If data doesn't persist between app restarts:

1. Check that you're using the same `id` in MMKV initialization
2. Verify you're not calling `clearAll()` on app start
3. Check iOS/Android app permissions

## File Structure

```
apps/BoilerplateApp/src/storage/
├── KeyValueStorage.ts    # Core storage API and helpers
└── useStorage.ts          # React hooks for reactive storage
```

## Best Practices

### 1. Use Centralized Keys

❌ **Don't**:
```typescript
storage.setString('user_name', 'John'); // Typo risk
const name = storage.getString('username'); // Different key!
```

✅ **Do**:
```typescript
import { StorageKeys } from './storage/KeyValueStorage';

storage.setString(StorageKeys.USERNAME, 'John');
const name = storage.getString(StorageKeys.USERNAME);
```

### 2. Use Type-Safe Helpers

❌ **Don't**:
```typescript
storage.setString('user', JSON.stringify(userObject));
const user = JSON.parse(storage.getString('user')!);
```

✅ **Do**:
```typescript
storage.setObject('user', userObject);
const user = storage.getObject<User>('user');
```

### 3. Use React Hooks for UI

❌ **Don't**:
```typescript
const [user, setUser] = useState(storage.getObject('user'));

// Changes in storage won't update UI
```

✅ **Do**:
```typescript
const [user, setUser] = useStorageObject<User>('user');

// Automatically updates when storage changes
```

### 4. Clear Sensitive Data

Always clear sensitive data on logout:

```typescript
import { authStorage } from './storage/KeyValueStorage';

function logout() {
  authStorage.clearAuth(); // Clear tokens, userId, etc.
  // Navigate to login screen
}
```

### 5. Handle Undefined Values

```typescript
const username = storage.getString('username') ?? 'Guest';
const userId = storage.getNumber('userId') ?? 0;
const user = storage.getObject<User>('user') ?? defaultUser;
```

## Resources

- [React Native MMKV GitHub](https://github.com/mrousavy/react-native-mmkv)
- [MMKV Core (Tencent)](https://github.com/Tencent/MMKV)
- [Margelo Blog - MMKV Announcement](https://margelo.io/blog/announcing-react-native-mmkv)
- [Performance Benchmarks](https://github.com/mrousavy/react-native-mmkv#benchmark)

## Related Documentation

- [LOCAL_STORAGE_SETUP.md](LOCAL_STORAGE_SETUP.md) - WatermelonDB and React Native FS setup
- [QUICK_START.md](QUICK_START.md) - Getting started guide
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions

---

**Status**: ✅ Production Ready
**Complexity**: Low
**Performance**: Excellent
**Recommendation**: Use this for all key-value storage needs

