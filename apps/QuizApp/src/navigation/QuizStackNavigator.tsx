/**
 * QuizStackNavigator
 *
 * Navigation stack for quiz flow:
 * - QuizLaunch: Entry screen with options
 * - Quiz: Main quiz gameplay (no back button)
 * - QuizResults: Results screen (no back button, use action buttons)
 * - Profile: User profile screen
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@monorepo/ui-components';
import type { QuizStackParamList } from '../types/navigation';
import {
  QuizLaunchScreen,
  QuizScreen,
  QuizResultsScreen,
} from '../screens';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<QuizStackParamList>();

export const QuizStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="QuizLaunch"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="QuizLaunch"
        component={QuizLaunchScreen}
        options={{
          title: 'Quiz Bowl',
          headerLargeTitle: true,
        }}
      />

      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          title: 'Quiz',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="QuizResults"
        component={QuizResultsScreen}
        options={{
          title: 'Results',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: colors.surface.default,
          },
          headerTintColor: colors.text.primary,
        }}
      />
    </Stack.Navigator>
  );
};
