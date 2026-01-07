/**
 * BoilerplateApp
 * React Native Monorepo Application
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryProvider } from './src/providers/QueryProvider';
import { DatabaseProvider } from './src/providers/DatabaseProvider';
import { BottomTabNavigator } from './src/navigation/BottomTabNavigator';
import { paperTheme } from '@monorepo/ui-components';
import { configureGoogleSignIn } from './src/services/googleSignIn';

function App() {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <DatabaseProvider>
          <SafeAreaProvider>
            <PaperProvider theme={paperTheme}>
              <NavigationContainer>
                <StatusBar barStyle="dark-content" />
                <BottomTabNavigator />
              </NavigationContainer>
            </PaperProvider>
          </SafeAreaProvider>
        </DatabaseProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

export default App;
