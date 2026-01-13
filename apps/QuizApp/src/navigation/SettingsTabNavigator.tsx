/**
 * SettingsTabNavigator
 *
 * Bottom tab navigator for settings with 5 tabs:
 * - Profile: User profile management
 * - Teams: Team management
 * - Badges: Earned badges display
 * - History: Quiz history and stats
 * - QuizSetup: Quiz configuration settings
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { SettingsTabParamList } from '../types/navigation';
import { useTheme } from '../providers/ThemeProvider';
import {
  ProfileTab,
  TeamsTab,
  BadgesTab,
  HistoryTab,
  QuizSetupTab,
} from '../screens/settings';

const Tab = createBottomTabNavigator<SettingsTabParamList>();

const TAB_ICONS: Record<keyof SettingsTabParamList, string> = {
  Profile: 'account',
  Teams: 'account-group',
  Badges: 'medal',
  History: 'history',
  QuizSetup: 'cog',
};

export const SettingsTabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Icon
            name={TAB_ICONS[route.name]}
            size={size}
            color={color}
            testID={`tab-icon-${route.name.toLowerCase()}`}
          />
        ),
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.surface.default,
          borderTopColor: colors.divider,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Profile"
        component={ProfileTab}
        options={{ tabBarLabel: 'Profile' }}
      />
      <Tab.Screen
        name="Teams"
        component={TeamsTab}
        options={{ tabBarLabel: 'Teams' }}
      />
      <Tab.Screen
        name="Badges"
        component={BadgesTab}
        options={{ tabBarLabel: 'Badges' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryTab}
        options={{ tabBarLabel: 'History' }}
      />
      <Tab.Screen
        name="QuizSetup"
        component={QuizSetupTab}
        options={{ tabBarLabel: 'Setup' }}
      />
    </Tab.Navigator>
  );
};
