/**
 * OnboardingNavigator
 *
 * Stack navigator for first-time user onboarding flow.
 * Screens: Welcome → ThemeSelection → AudioFeedback → VoiceSettings → TimerSettings → SampleQuizIntro → Quiz → QuizResults
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../types/navigation';
import { useTheme } from '../providers/ThemeProvider';
import {
  WelcomeScreen,
  ThemeSelectionScreen,
  AudioFeedbackScreen,
  VoiceSettingsScreen,
  TimerSettingsScreen,
  SampleQuizIntroScreen,
} from '../screens/onboarding';
import { QuizScreen, QuizResultsScreen } from '../screens';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        headerStyle: {
          backgroundColor: colors.surface.default,
        },
        headerTintColor: colors.text.primary,
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ThemeSelection"
        component={ThemeSelectionScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AudioFeedback"
        component={AudioFeedbackScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="VoiceSettings"
        component={VoiceSettingsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="TimerSettings"
        component={TimerSettingsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="SampleQuizIntro"
        component={SampleQuizIntroScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          headerShown: true,
          title: 'Practice Quiz',
          headerBackVisible: false,
          gestureEnabled: false,
          headerStyle: {
            backgroundColor: colors.surface.default,
          },
        }}
      />

      <Stack.Screen
        name="QuizResults"
        component={QuizResultsScreen}
        options={{
          headerShown: true,
          title: 'Results',
          headerBackVisible: false,
          gestureEnabled: false,
          headerStyle: {
            backgroundColor: colors.surface.default,
          },
        }}
      />
    </Stack.Navigator>
  );
};
