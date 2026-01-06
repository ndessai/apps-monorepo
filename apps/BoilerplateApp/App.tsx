/**
 * BoilerplateApp
 * React Native Monorepo Application
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryProvider } from './src/providers/QueryProvider';
import { BottomTabNavigator } from './src/navigation/BottomTabNavigator';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <SafeAreaProvider>
          <PaperProvider>
            <NavigationContainer>
              <StatusBar barStyle="dark-content" />
              <BottomTabNavigator />
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

export default App;
