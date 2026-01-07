import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HelloScreen } from '../screens/HelloScreen';
import { SecondScreen } from '../screens/SecondScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, spacing } from '@monorepo/ui-components';

export type HomeStackParamList = {
  Hello: undefined;
  Profile: undefined;
};

export type BottomTabParamList = {
  HomeStack: undefined;
  Second: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Hello"
        component={HelloScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
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
    </HomeStack.Navigator>
  );
}

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
        name="HomeStack"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          headerShown: false,
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
