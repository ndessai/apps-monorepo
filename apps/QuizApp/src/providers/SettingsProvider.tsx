/**
 * SettingsProvider
 *
 * Manages quiz settings in memory with database persistence.
 * Single source of truth for settings throughout the app.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useDatabase } from './DatabaseProvider';
import { getCurrentUser } from '../services/userService';
import { getQuizSettings, updateQuizSettings } from '../services/quizSettingsService';
import { QuizSettingsData, DEFAULT_QUIZ_SETTINGS } from '../types/settings';

interface SettingsContextType {
  settings: QuizSettingsData;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<QuizSettingsData>) => Promise<void>;
  resetSettings: () => Promise<void>;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const database = useDatabase();
  const [settings, setSettings] = useState<QuizSettingsData>(DEFAULT_QUIZ_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load settings from database on mount
  useEffect(() => {
    loadSettings();
  }, [database]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser(database);

      if (user) {
        setUserId(user.userId);
        const userSettings = await getQuizSettings(database, user.userId);
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('[SettingsProvider] Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettingsHandler = useCallback(async (newSettings: Partial<QuizSettingsData>) => {
    if (!userId) {
      console.error('[SettingsProvider] Cannot update settings: no user ID');
      return;
    }

    // Update in-memory state immediately
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // Persist to database
    try {
      await updateQuizSettings(database, userId, newSettings);
    } catch (error) {
      console.error('[SettingsProvider] Error persisting settings:', error);
      // Revert in-memory state on error
      setSettings(settings);
      throw error;
    }
  }, [database, userId, settings]);

  const resetSettingsHandler = useCallback(async () => {
    if (!userId) {
      console.error('[SettingsProvider] Cannot reset settings: no user ID');
      return;
    }

    // Reset to defaults in memory
    setSettings(DEFAULT_QUIZ_SETTINGS);

    // Persist to database
    try {
      await updateQuizSettings(database, userId, DEFAULT_QUIZ_SETTINGS);
    } catch (error) {
      console.error('[SettingsProvider] Error resetting settings:', error);
      throw error;
    }
  }, [database, userId]);

  const reloadSettings = useCallback(async () => {
    await loadSettings();
  }, [database]);

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      updateSettings: updateSettingsHandler,
      resetSettings: resetSettingsHandler,
      reloadSettings,
    }),
    [settings, isLoading, updateSettingsHandler, resetSettingsHandler, reloadSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
