/**
 * QuizLaunchScreen
 *
 * Entry point for quiz functionality with three options:
 * - Start Quiz (active)
 * - Host Tournament (coming soon)
 * - Join Tournament (coming soon)
 */

import React, { useLayoutEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';
import type { QuizStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<QuizStackParamList, 'QuizLaunch'>;

export const QuizLaunchScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings' as any)}
          style={styles.headerButton}
          testID="settings-button"
        >
          <Icon name="cog" size={28} color={colors.primary.main} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  const handleStartProQuiz = () => {
    navigation.navigate('Quiz', { mode: 'pro' });
  };

  const handleStartLearnQuiz = () => {
    navigation.navigate('Quiz', { mode: 'learn' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={[styles.title, { color: colors.text.primary }]}>
            Quiz Me!
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: colors.text.secondary }]}>
            Test your knowledge
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleStartProQuiz}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            testID="start-quiz-pro-button"
          >
            Start Quiz (Pro)
          </Button>
          <Button
            mode="outlined"
            onPress={handleStartLearnQuiz}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            testID="start-quiz-learn-button"
          >
            Start Quiz (Learn)
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {},
  subtitle: {
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    marginBottom: spacing.xs,
  },
  lastButton: {
    marginTop: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  comingSoon: {
    textAlign: 'center',
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  headerButton: {
    marginRight: spacing.xs,
  },
});
