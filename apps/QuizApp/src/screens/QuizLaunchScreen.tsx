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

  const handleStartQuiz = () => {
    navigation.navigate('Quiz');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={[styles.title, { color: colors.text.primary }]}>
            Quiz Bowl
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: colors.text.secondary }]}>
            Test your knowledge with NAQT format questions
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleStartQuiz}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            testID="start-quiz-button"
          >
            Start Quiz
          </Button>

          <Button
            mode="outlined"
            disabled
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.disabledButtonLabel, { color: colors.text.disabled }]}
            testID="host-tournament-button"
          >
            Host Tournament
          </Button>
          <Text variant="bodySmall" style={[styles.comingSoon, { color: colors.text.secondary }]}>
            Coming Soon
          </Text>

          <Button
            mode="outlined"
            disabled
            style={[styles.button, styles.lastButton]}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.disabledButtonLabel, { color: colors.text.disabled }]}
            testID="join-tournament-button"
          >
            Join Tournament
          </Button>
          <Text variant="bodySmall" style={[styles.comingSoon, { color: colors.text.secondary }]}>
            Coming Soon
          </Text>
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
