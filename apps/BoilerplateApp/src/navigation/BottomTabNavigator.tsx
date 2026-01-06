import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HelloScreen } from '../screens/HelloScreen';
import { SecondScreen } from '../screens/SecondScreen';
import { colors, spacing } from '@monorepo/ui-components';

export type BottomTabParamList = {
  Home: undefined;
  Second: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.disabled,
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface.default,
        },
        headerTintColor: colors.text.primary,
        tabBarStyle: {
          backgroundColor: colors.surface.default,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          paddingBottom: spacing.xs,
          paddingTop: spacing.xs,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HelloScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Second"
        component={SecondScreen}
        options={{
          title: 'Data',
          tabBarLabel: 'Data',
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-line" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
