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
import { colors, spacing } from '@monorepo/ui-components';
import type { QuizStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<QuizStackParamList, 'QuizLaunch'>;

export const QuizLaunchScreen: React.FC<Props> = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.headerButton}
        >
          <Icon name="account-circle" size={28} color={colors.primary.main} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleStartQuiz = () => {
    navigation.navigate('Quiz');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            Quiz Bowl
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
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
            labelStyle={styles.disabledButtonLabel}
            testID="host-tournament-button"
          >
            Host Tournament
          </Button>
          <Text variant="bodySmall" style={styles.comingSoon}>
            Coming Soon
          </Text>

          <Button
            mode="outlined"
            disabled
            style={[styles.button, styles.lastButton]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.disabledButtonLabel}
            testID="join-tournament-button"
          >
            Join Tournament
          </Button>
          <Text variant="bodySmall" style={styles.comingSoon}>
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
    backgroundColor: colors.background.default,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    color: colors.primary.main,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.text.secondary,
    textAlign: 'center',
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
    color: colors.text.disabled,
  },
  comingSoon: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  headerButton: {
    marginRight: spacing.md,
  },
});
