/**
 * QuizResultsScreen
 *
 * Shows detailed breakdown of quiz results
 * Displays score, accuracy, and each question's result
 */

import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Button, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, elevation, radius } from '@monorepo/ui-components';
import type { QuizStackParamList } from '../types/navigation';
import { QuestionBreakdown } from '../components';

type Props = NativeStackScreenProps<QuizStackParamList, 'QuizResults'>;

export const QuizResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { session } = route.params;

  // Calculate statistics
  const accuracy =
    session.maxScore > 0
      ? Math.round((session.totalScore / session.maxScore) * 100)
      : 0;

  const tossupCorrect = session.tossupResults.filter((r) => r.isCorrect).length;
  const tossupTotal = session.tossupResults.length;

  const bonusPointsEarned = session.bonusResults.reduce(
    (sum, r) => sum + r.totalPoints,
    0
  );
  const bonusMaxPoints = session.bonusResults.length * 30;

  // Get score color
  const getScoreColor = () => {
    if (accuracy >= 80) return colors.success.main;
    if (accuracy >= 60) return colors.warning.main;
    return colors.error.main;
  };

  // Handle play again
  const handlePlayAgain = () => {
    navigation.replace('Quiz');
  };

  // Handle back to menu
  const handleBackToMenu = () => {
    navigation.navigate('QuizLaunch');
  };

  // Combine all results for display
  const allResults = [
    ...session.tossupResults.map((r, i) => ({
      type: 'tossup' as const,
      result: r,
      number: i + 1,
    })),
    ...session.bonusResults.map((r, i) => ({
      type: 'bonus' as const,
      result: r,
      number: i + 1,
    })),
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Score Summary */}
        <View style={styles.summaryCard}>
          <Text variant="headlineMedium" style={styles.summaryTitle}>
            Quiz Complete!
          </Text>

          <View style={styles.scoreContainer}>
            <Text
              variant="displayLarge"
              style={[styles.score, { color: getScoreColor() }]}
            >
              {session.totalScore}
            </Text>
            <Text variant="titleLarge" style={styles.maxScore}>
              / {session.maxScore}
            </Text>
          </View>

          <Text variant="titleMedium" style={styles.accuracy}>
            {accuracy}% Accuracy
          </Text>

          {/* Breakdown stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="labelMedium" style={styles.statLabel}>
                Toss-ups
              </Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {tossupCorrect} / {tossupTotal}
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text variant="labelMedium" style={styles.statLabel}>
                Bonus Points
              </Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {bonusPointsEarned} / {bonusMaxPoints}
              </Text>
            </View>
          </View>
        </View>

        {/* Detailed Breakdown */}
        <View style={styles.breakdownSection}>
          <Text variant="titleLarge" style={styles.breakdownTitle}>
            Question Breakdown
          </Text>

          {allResults.map((item, index) => (
            <QuestionBreakdown
              key={`${item.type}-${item.number}`}
              result={item.result}
              questionNumber={item.number}
              testID={`breakdown-${index}`}
            />
          ))}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handlePlayAgain}
          style={styles.actionButton}
          contentStyle={styles.buttonContent}
          testID="play-again-button"
        >
          Play Again
        </Button>

        <Button
          mode="outlined"
          onPress={handleBackToMenu}
          style={styles.actionButton}
          contentStyle={styles.buttonContent}
          testID="back-to-menu-button"
        >
          Back to Menu
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...elevation.level2,
  },
  summaryTitle: {
    color: colors.text.primary,
    marginBottom: spacing.lg,
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  score: {
    fontWeight: 'bold',
  },
  maxScore: {
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  accuracy: {
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
  breakdownSection: {
    marginBottom: spacing.xl,
  },
  breakdownTitle: {
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  actionsContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface.default,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
});
