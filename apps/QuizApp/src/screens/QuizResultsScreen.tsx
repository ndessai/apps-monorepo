/**
 * QuizResultsScreen
 *
 * Shows detailed breakdown of quiz results
 * Displays score, accuracy, and each question's result
 */

import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, elevation, radius } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';
import type { QuizStackParamList } from '../types/navigation';
import { QuestionBreakdown } from '../components';
import { appStateStorage } from '../storage/KeyValueStorage';

type Props = NativeStackScreenProps<QuizStackParamList, 'QuizResults'>;

export const QuizResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { session, isOnboarding } = route.params;

  // Calculate statistics
  const accuracy =
    session.maxScore > 0
      ? Math.round((session.totalScore / session.maxScore) * 100)
      : 0;

  const tossupCorrect = session.tossupResults.filter((r) => r.isCorrect).length;
  const tossupTotal = session.tossupResults.length;

  const bonusPointsEarned = session.bonusResults.reduce(
    (sum, r) => sum + ((r as any).points ?? r.totalPoints ?? 0),
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

  // Handle back to menu - reset stack so QuizLaunch is the root
  const handleBackToMenu = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'QuizLaunch' }],
    });
  };

  // Handle finish onboarding - mark complete and RootNavigator will auto-switch to Main
  const handleFinishOnboarding = () => {
    // Setting this flag triggers the MMKV listener in RootNavigator
    // which automatically switches from OnboardingNavigator to QuizStackNavigator
    appStateStorage.setOnboardingCompleted(true);
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
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Score Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface.default }]}>
          <Text variant="headlineMedium" style={[styles.summaryTitle, { color: colors.text.primary }]}>
            Quiz Complete!
          </Text>

          <View style={styles.scoreContainer}>
            <Text
              variant="displayLarge"
              style={[styles.score, { color: getScoreColor() }]}
            >
              {session.totalScore}
            </Text>
            <Text variant="titleLarge" style={[styles.maxScore, { color: colors.text.secondary }]}>
              / {session.maxScore}
            </Text>
          </View>

          <Text variant="titleMedium" style={[styles.accuracy, { color: colors.text.secondary }]}>
            {accuracy}% Accuracy
          </Text>

          {/* Breakdown stats */}
          <View style={[styles.statsContainer, { borderTopColor: colors.divider }]}>
            <View style={styles.statItem}>
              <Text variant="labelMedium" style={[styles.statLabel, { color: colors.text.secondary }]}>
                Toss-ups
              </Text>
              <Text variant="bodyLarge" style={[styles.statValue, { color: colors.text.primary }]}>
                {tossupCorrect} / {tossupTotal}
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />

            <View style={styles.statItem}>
              <Text variant="labelMedium" style={[styles.statLabel, { color: colors.text.secondary }]}>
                Bonus Points
              </Text>
              <Text variant="bodyLarge" style={[styles.statValue, { color: colors.text.primary }]}>
                {bonusPointsEarned} / {bonusMaxPoints}
              </Text>
            </View>
          </View>
        </View>

        {/* Detailed Breakdown */}
        <View style={styles.breakdownSection}>
          <Text variant="titleLarge" style={[styles.breakdownTitle, { color: colors.text.primary }]}>
            Question Breakdown
          </Text>

          {allResults.map((item, index) => (
            <QuestionBreakdown
              key={`${item.type}-${item.number}`}
              result={item.result as any}
              questionNumber={item.number}
              testID={`breakdown-${index}`}
            />
          ))}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionsContainer, { backgroundColor: colors.surface.elevated, borderTopColor: colors.divider }]}>
        {isOnboarding ? (
          // Onboarding mode: Show only home button
          <TouchableOpacity
            style={[styles.homeButton, { backgroundColor: colors.primary.main }]}
            onPress={handleFinishOnboarding}
            testID="finish-onboarding-button"
          >
            <Icon name="home" size={28} color={colors.primary.onPrimary} />
            <Text variant="titleMedium" style={[styles.homeButtonText, { color: colors.primary.onPrimary }]}>
              Go to Home
            </Text>
          </TouchableOpacity>
        ) : (
          // Regular mode: Show play again and back to menu buttons
          <>
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
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  summaryCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...elevation.level2,
  },
  summaryTitle: {
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
    marginLeft: spacing.xs,
  },
  accuracy: {
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    marginBottom: spacing.xs,
  },
  statValue: {
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  breakdownSection: {
    marginBottom: spacing.xl,
  },
  breakdownTitle: {
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  actionsContainer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  homeButtonText: {
    fontWeight: '600',
  },
});
