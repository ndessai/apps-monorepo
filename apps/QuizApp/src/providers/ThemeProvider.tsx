import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
  lightColors,
  darkColors,
  getThemeColors,
  type ThemeMode,
} from '@monorepo/ui-components';
import { useDatabase } from './DatabaseProvider';
import { getCurrentUser } from '../services/userService';
import { getQuizSettings, updateQuizSettings } from '../services/quizSettingsService';

type ThemeContextType = {
  theme: ThemeMode;
  colors: typeof lightColors;
  setTheme: (theme: ThemeMode) => Promise<void>;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const database = useDatabase();
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const user = await getCurrentUser(database);
      if (user) {
        setUserId(user.userId);
        const settings = await getQuizSettings(database, user.userId);
        if (settings.theme) {
          setThemeState(settings.theme);
        } else {
          // Default to system preference if no saved theme
          setThemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
        }
      } else {
        // No user, use system preference
        setThemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setThemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (userId) {
      try {
        await updateQuizSettings(database, userId, { theme: newTheme });
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  const colors = useMemo(() => getThemeColors(theme), [theme]);

  const value = useMemo(
    () => ({
      theme,
      colors,
      setTheme,
      isLoading,
    }),
    [theme, colors, isLoading]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
