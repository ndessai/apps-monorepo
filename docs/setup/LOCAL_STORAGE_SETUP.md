# Local Storage Setup - WatermelonDB & React Native FS

**Setup Date**: 2026-01-06
**Status**: In Progress (Dependencies Installed) ⚙️

## Overview

Adding local persistent storage capabilities using:
- **WatermelonDB** - High-performance reactive database built on SQLite
- **React Native FS** - File system access for reading/writing files

## What's Been Done ✅

### 1. Dependencies Installed

```bash
# Installed packages
npm install --legacy-peer-deps @nozbe/watermelondb @nozbe/with-observables react-native-fs
npm install --save-dev --legacy-peer-deps @babel/plugin-proposal-decorators
```

**Versions Installed:**
- `@nozbe/watermelondb@^0.28.0`
- `@nozbe/with-observables@^1.6.0`
- `react-native-fs@^2.20.0`
- `@babel/plugin-proposal-decorators` (dev dependency)

### 2. Babel Configuration

Updated `babel.config.js` to support Water

melonDB decorators:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
  ],
};
```

### 3. iOS Pods Installed

Successfully installed iOS native modules:
- WatermelonDB (0.28.0)
- simdjson (3.9.4) - WatermelonDB dependency
- RNFS (react-native-fs)

```bash
cd ios && bundle exec pod install
```

**Total pods**: 88 dependencies, 87 pods installed

## What Needs to Be Done 📋

### 1. Create Database Models & Schema

Create models for your data entities:

```typescript
// src/database/models/User.ts
import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class User extends Model {
  static table = 'users';

  @text('name') name!: string;
  @text('email') email!: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}
```

### 2. Create Database Schema

```typescript
// src/database/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
```

### 3. Initialize Database

```typescript
// src/database/index.ts
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import User from './models/User';

const adapter = new SQLiteAdapter({
  schema,
  jsi: true, // Use JSI for better performance
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [User],
});
```

### 4. Create Database Provider

```typescript
// src/providers/DatabaseProvider.tsx
import React, { ReactNode } from 'react';
import { DatabaseProvider as WatermelonProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { database } from '../database';

interface Props {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<Props> = ({ children }) => {
  return (
    <WatermelonProvider database={database}>
      {children}
    </WatermelonProvider>
  );
};
```

### 5. Create Storage Utilities

```typescript
// src/utils/storage.ts
import RNFS from 'react-native-fs';

export const StoragePaths = {
  documents: RNFS.DocumentDirectoryPath,
  cache: RNFS.CachesDirectoryPath,
  temp: RNFS.TemporaryDirectoryPath,
};

export const FileStorage = {
  // Write file
  async writeFile(filename: string, content: string): Promise<void> {
    const path = `${StoragePaths.documents}/${filename}`;
    await RNFS.writeFile(path, content, 'utf8');
  },

  // Read file
  async readFile(filename: string): Promise<string> {
    const path = `${StoragePaths.documents}/${filename}`;
    return await RNFS.readFile(path, 'utf8');
  },

  // Delete file
  async deleteFile(filename: string): Promise<void> {
    const path = `${StoragePaths.documents}/${filename}`;
    await RNFS.unlink(path);
  },

  // Check if file exists
  async fileExists(filename: string): Promise<boolean> {
    const path = `${StoragePaths.documents}/${filename}`;
    return await RNFS.exists(path);
  },

  // List files
  async listFiles(): Promise<string[]> {
    return await RNFS.readDir(StoragePaths.documents);
  },
};
```

### 6. Update App.tsx

Wrap your app with DatabaseProvider:

```typescript
import { DatabaseProvider } from './src/providers/DatabaseProvider';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DatabaseProvider>
        <QueryProvider>
          <SafeAreaProvider>
            <PaperProvider theme={paperTheme}>
              <NavigationContainer>
                <StatusBar barStyle="dark-content" />
                <BottomTabNavigator />
              </NavigationContainer>
            </PaperProvider>
          </SafeAreaProvider>
        </QueryProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}
```

### 7. Usage Examples

**Using WatermelonDB:**

```typescript
import { useDatabase } from '@nozbe/watermelondb/hooks';
import User from '../database/models/User';

function MyComponent() {
  const database = useDatabase();

  const createUser = async () => {
    await database.write(async () => {
      await database.get<User>('users').create(user => {
        user.name = 'John Doe';
        user.email = 'john@example.com';
      });
    });
  };

  const getUsers = async () => {
    const users = await database.get<User>('users').query().fetch();
    return users;
  };

  return <View>...</View>;
}
```

**Using React Native FS:**

```typescript
import { FileStorage } from '../utils/storage';

async function saveData() {
  await FileStorage.writeFile('data.json', JSON.stringify({ foo: 'bar' }));
  const content = await FileStorage.readFile('data.json');
  console.log(JSON.parse(content));
}
```

## Android Configuration

For Android, WatermelonDB requires minSdkVersion 21 or higher. Check `android/build.gradle`:

```gradle
buildscript {
    ext {
        minSdkVersion = 21
        compileSdkVersion = 34
        targetSdkVersion = 34
    }
}
```

## Benefits

### WatermelonDB

✅ **High Performance** - Built for speed, handles 10,000+ records smoothly
✅ **Reactive** - Automatic UI updates when data changes
✅ **Offline-First** - Works without network connection
✅ **Type-Safe** - Full TypeScript support
✅ **Relational** - Supports complex relationships between models
✅ **Cross-Platform** - Works on iOS and Android

### React Native FS

✅ **File Access** - Read/write files to device storage
✅ **Directory Management** - Create, list, and delete directories
✅ **File Stats** - Get file size, modification time, etc.
✅ **Async Operations** - Non-blocking file operations
✅ **Cross-Platform** - Consistent API for iOS and Android

## Use Cases

### WatermelonDB
- User profiles and settings
- Offline data caching
- Notes, todos, or content apps
- Chat message history
- Complex relational data

### React Native FS
- Downloading and saving files
- Caching images or documents
- Exporting data to files
- Reading configuration files
- Temporary file management

## Troubleshooting

### Peer Dependency Warnings

The `--legacy-peer-deps` flag was used because:
- WatermelonDB's `@nozbe/with-observables` expects React 16-18
- BoilerplateApp uses React 19

This is safe and the packages work correctly.

### iOS Build Issues

If you encounter iOS build errors:
1. Clean build folder: `cd ios && rm -rf build`
2. Reinstall pods: `rm -rf Pods Podfile.lock && bundle exec pod install`
3. Clean Xcode DerivedData

### Android Build Issues

If you encounter Android build errors:
1. Clean Gradle: `cd android && ./gradlew clean`
2. Verify `minSdkVersion >= 21` in `android/build.gradle`

## Resources

- [WatermelonDB Documentation](https://watermelondb.dev/docs)
- [React Native FS Documentation](https://github.com/itinance/react-native-fs)
- [WatermelonDB Examples](https://github.com/Nozbe/WatermelonDB/tree/master/examples)

## Next Steps

1. ✅ Dependencies installed
2. ✅ Babel configured
3. ✅ iOS pods installed
4. ⏳ Create database models
5. ⏳ Create database schema
6. ⏳ Initialize database instance
7. ⏳ Create DatabaseProvider
8. ⏳ Create storage utilities
9. ⏳ Update App.tsx
10. ⏳ Add usage examples
11. ⏳ Test on iOS and Android

---

**Status**: Ready for implementation
**Complexity**: Medium
**Estimated Time**: 2-3 hours for full setup
