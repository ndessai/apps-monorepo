/**
 * QuizStackNavigator
 *
 * Navigation stack for quiz flow:
 * - QuizLaunch: Entry screen with options
 * - Quiz: Main quiz gameplay (no back button)
 * - QuizResults: Results screen (no back button, use action buttons)
 * - Settings: Settings screen with nested bottom tabs
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { QuizStackParamList } from '../types/navigation';
import { useTheme } from '../providers/ThemeProvider';
import {
  QuizLaunchScreen,
  QuizScreen,
  QuizResultsScreen,
} from '../screens';
import { SettingsTabNavigator } from './SettingsTabNavigator';

const Stack = createNativeStackNavigator<QuizStackParamList>();

export const QuizStackNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="QuizLaunch"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface.default,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          color: colors.text.primary,
        },
      }}
    >
      <Stack.Screen
        name="QuizLaunch"
        component={QuizLaunchScreen}
        options={{
          title: '',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background.default,
          },
        }}
      />

      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          title: 'Quiz',
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
          title: 'Results',
          headerBackVisible: false,
          gestureEnabled: false,
          headerStyle: {
            backgroundColor: colors.surface.default,
          },
        }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsTabNavigator}
        options={{
          title: 'Settings',
          headerStyle: {
            backgroundColor: colors.surface.default,
          },
          headerTintColor: colors.text.primary,
        }}
      />
    </Stack.Navigator>
  );
};
