/**
 * QuizApp
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
import { ThemeProvider, useTheme } from './src/providers/ThemeProvider';
import { QuizStackNavigator } from './src/navigation/QuizStackNavigator';
import { getPaperTheme } from '@monorepo/ui-components';
import { configureGoogleSignIn } from './src/services/googleSignIn';

function AppContent() {
  const { theme } = useTheme();
  const paperTheme = getPaperTheme(theme);

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <QuizStackNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

function App() {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <DatabaseProvider>
          <SafeAreaProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </SafeAreaProvider>
        </DatabaseProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

export default App;
