/**
 * RootNavigator
 *
 * Root navigator that conditionally shows either:
 * - OnboardingNavigator (first-time users)
 * - QuizStackNavigator (returning users)
 *
 * Checks MMKV storage for onboarding completion flag.
 */

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useTheme } from '../providers/ThemeProvider';
import { appStateStorage, StorageKeys, storage } from '../storage/KeyValueStorage';
import { OnboardingNavigator } from './OnboardingNavigator';
import { QuizStackNavigator } from './QuizStackNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Check onboarding status on mount
    const checkOnboardingStatus = () => {
      const completed = appStateStorage.isOnboardingCompleted();
      setIsOnboardingCompleted(completed);
      setIsLoading(false);
    };

    checkOnboardingStatus();

    // Listen for changes to onboarding completion flag
    const removeListener = storage.addOnValueChangedListener((key) => {
      if (key === StorageKeys.ONBOARDING_COMPLETED) {
        const completed = appStateStorage.isOnboardingCompleted();
        setIsOnboardingCompleted(completed);
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  // Show loading spinner while checking onboarding status
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background.default }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      {isOnboardingCompleted ? (
        <Stack.Screen name="Main" component={QuizStackNavigator} />
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
