/**
 * React Hooks for Key-Value Storage
 *
 * Provides React hooks for reactive storage operations with automatic updates.
 *
 * Usage:
 * ```typescript
 * import { useStorageString, useStorageBoolean, useStorageObject } from './storage/useStorage';
 *
 * function MyComponent() {
 *   const [username, setUsername] = useStorageString('username');
 *   const [isLoggedIn, setLoggedIn] = useStorageBoolean('is_logged_in');
 *   const [user, setUser] = useStorageObject<User>('user');
 *
 *   return (
 *     <View>
 *       <Text>Username: {username}</Text>
 *       <Button onPress={() => setUsername('john_doe')} />
 *     </View>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from './KeyValueStorage';

/**
 * Hook for string values in storage
 * Provides reactive state that syncs with MMKV storage
 */
export function useStorageString(
  key: string,
  defaultValue?: string
): [string | undefined, (value: string | undefined) => void] {
  const [value, setValue] = useState<string | undefined>(() => {
    const storedValue = storage.getString(key);
    return storedValue ?? defaultValue;
  });

  const updateValue = useCallback(
    (newValue: string | undefined) => {
      if (newValue === undefined) {
        storage.delete(key);
        setValue(undefined);
      } else {
        storage.setString(key, newValue);
        setValue(newValue);
      }
    },
    [key]
  );

  useEffect(() => {
    // Listen for changes to this key
    const removeListener = storage.addOnValueChangedListener((changedKey) => {
      if (changedKey === key) {
        const newValue = storage.getString(key);
        setValue(newValue ?? defaultValue);
      }
    });

    return removeListener;
  }, [key, defaultValue]);

  return [value, updateValue];
}

/**
 * Hook for number values in storage
 * Provides reactive state that syncs with MMKV storage
 */
export function useStorageNumber(
  key: string,
  defaultValue?: number
): [number | undefined, (value: number | undefined) => void] {
  const [value, setValue] = useState<number | undefined>(() => {
    const storedValue = storage.getNumber(key);
    return storedValue ?? defaultValue;
  });

  const updateValue = useCallback(
    (newValue: number | undefined) => {
      if (newValue === undefined) {
        storage.delete(key);
        setValue(undefined);
      } else {
        storage.setNumber(key, newValue);
        setValue(newValue);
      }
    },
    [key]
  );

  useEffect(() => {
    const removeListener = storage.addOnValueChangedListener((changedKey) => {
      if (changedKey === key) {
        const newValue = storage.getNumber(key);
        setValue(newValue ?? defaultValue);
      }
    });

    return removeListener;
  }, [key, defaultValue]);

  return [value, updateValue];
}

/**
 * Hook for boolean values in storage
 * Provides reactive state that syncs with MMKV storage
 */
export function useStorageBoolean(
  key: string,
  defaultValue?: boolean
): [boolean | undefined, (value: boolean | undefined) => void] {
  const [value, setValue] = useState<boolean | undefined>(() => {
    const storedValue = storage.getBoolean(key);
    return storedValue ?? defaultValue;
  });

  const updateValue = useCallback(
    (newValue: boolean | undefined) => {
      if (newValue === undefined) {
        storage.delete(key);
        setValue(undefined);
      } else {
        storage.setBoolean(key, newValue);
        setValue(newValue);
      }
    },
    [key]
  );

  useEffect(() => {
    const removeListener = storage.addOnValueChangedListener((changedKey) => {
      if (changedKey === key) {
        const newValue = storage.getBoolean(key);
        setValue(newValue ?? defaultValue);
      }
    });

    return removeListener;
  }, [key, defaultValue]);

  return [value, updateValue];
}

/**
 * Hook for object values in storage
 * Provides reactive state that syncs with MMKV storage
 * Objects are automatically serialized/deserialized as JSON
 */
export function useStorageObject<T = unknown>(
  key: string,
  defaultValue?: T
): [T | undefined, (value: T | undefined) => void] {
  const [value, setValue] = useState<T | undefined>(() => {
    const storedValue = storage.getObject<T>(key);
    return storedValue ?? defaultValue;
  });

  const updateValue = useCallback(
    (newValue: T | undefined) => {
      if (newValue === undefined) {
        storage.delete(key);
        setValue(undefined);
      } else {
        storage.setObject(key, newValue);
        setValue(newValue);
      }
    },
    [key]
  );

  useEffect(() => {
    const removeListener = storage.addOnValueChangedListener((changedKey) => {
      if (changedKey === key) {
        const newValue = storage.getObject<T>(key);
        setValue(newValue ?? defaultValue);
      }
    });

    return removeListener;
  }, [key, defaultValue]);

  return [value, updateValue];
}

/**
 * Hook to check if a key exists in storage
 */
export function useStorageContains(key: string): boolean {
  const [contains, setContains] = useState<boolean>(() => {
    return storage.contains(key);
  });

  useEffect(() => {
    const removeListener = storage.addOnValueChangedListener((changedKey) => {
      if (changedKey === key) {
        setContains(storage.contains(key));
      }
    });

    return removeListener;
  }, [key]);

  return contains;
}

/**
 * Hook to get all storage keys
 */
export function useStorageKeys(): string[] {
  const [keys, setKeys] = useState<string[]>(() => {
    return storage.getAllKeys();
  });

  useEffect(() => {
    const removeListener = storage.addOnValueChangedListener(() => {
      setKeys(storage.getAllKeys());
    });

    return removeListener;
  }, []);

  return keys;
}
