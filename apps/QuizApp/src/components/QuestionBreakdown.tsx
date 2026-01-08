/**
 * QuestionBreakdown Component
 *
 * Card showing individual question results
 * Used in QuizResultsScreen
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, elevation, radius } from '@monorepo/ui-components';
import type { TossupResult, BonusResult } from '../types/quiz';

interface QuestionBreakdownProps {
  result: TossupResult | BonusResult;
  questionNumber: number;
  testID?: string;
}

export const QuestionBreakdown: React.FC<QuestionBreakdownProps> = ({
  result,
  questionNumber,
  testID = 'question-breakdown',
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const isTossup = 'wasBeforePowerMark' in result;
  const questionType = isTossup ? 'Toss-up' : 'Bonus';

  // Get point color based on score
  const getPointColor = (points: number) => {
    if (points > 0) return colors.success.main;
    if (points < 0) return colors.error.main;
    return colors.text.secondary;
  };

  // Get result icon
  const getResultIcon = () => {
    if (result.points > 0) return 'check-circle';
    if (result.points < 0) return 'close-circle';
    return 'minus-circle';
  };

  const getResultIconColor = () => {
    if (result.points > 0) return colors.success.main;
    if (result.points < 0) return colors.error.main;
    return colors.text.secondary;
  };

  return (
    <Card style={styles.card} testID={testID}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={styles.pressable}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon
              name={getResultIcon()}
              size={24}
              color={getResultIconColor()}
              style={styles.resultIcon}
            />
            <View>
              <Text variant="titleMedium" style={styles.title}>
                {questionType} {questionNumber}
              </Text>
              <Text variant="bodySmall" style={styles.category}>
                {result.question.category}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text
              variant="titleLarge"
              style={[
                styles.points,
                { color: getPointColor(result.points) },
              ]}
            >
              {result.points > 0 ? '+' : ''}
              {result.points}
            </Text>
            <Icon
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.text.secondary}
            />
          </View>
        </View>

        {expanded && (
          <View style={styles.details}>
            {/* Question text */}
            <View style={styles.section}>
              <Text variant="labelMedium" style={styles.sectionLabel}>
                Question
              </Text>
              <Text variant="bodyMedium" style={styles.questionText}>
                {result.question.text}
              </Text>
            </View>

            {/* Toss-up specific details */}
            {isTossup && (
              <View style={styles.section}>
                <Text variant="labelMedium" style={styles.sectionLabel}>
                  Details
                </Text>
                <Text variant="bodySmall" style={styles.detailText}>
                  {(result as TossupResult).wasBeforePowerMark
                    ? '⭐ Answered before power mark (15 pts)'
                    : 'Answered after power mark (10 pts)'}
                </Text>
                {(result as TossupResult).wasInterrupted && (
                  <Text variant="bodySmall" style={styles.detailText}>
                    ⚠️ Interrupted penalty (-5 pts)
                  </Text>
                )}
              </View>
            )}

            {/* User answer */}
            {result.userAnswer && (
              <View style={styles.section}>
                <Text variant="labelMedium" style={styles.sectionLabel}>
                  Your Answer
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.answerText,
                    result.isCorrect
                      ? styles.correctAnswer
                      : styles.incorrectAnswer,
                  ]}
                >
                  {result.userAnswer}
                </Text>
              </View>
            )}

            {/* Correct answer */}
            <View style={styles.section}>
              <Text variant="labelMedium" style={styles.sectionLabel}>
                Correct Answer
              </Text>
              <Text variant="bodyMedium" style={styles.correctAnswerText}>
                {result.question.answer}
              </Text>
            </View>

            {/* Explanation if available */}
            {result.question.explanation && (
              <View style={styles.section}>
                <Text variant="labelMedium" style={styles.sectionLabel}>
                  Explanation
                </Text>
                <Text variant="bodySmall" style={styles.explanationText}>
                  {result.question.explanation}
                </Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface.default,
    ...elevation.level1,
  },
  pressable: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultIcon: {
    marginRight: spacing.sm,
  },
  title: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  category: {
    color: colors.text.secondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  points: {
    fontWeight: 'bold',
    marginRight: spacing.xs,
    minWidth: 50,
    textAlign: 'right',
  },
  details: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  questionText: {
    color: colors.text.primary,
    lineHeight: 22,
  },
  detailText: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  answerText: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    fontWeight: '500',
  },
  correctAnswer: {
    backgroundColor: colors.success.light,
    color: colors.success.dark,
  },
  incorrectAnswer: {
    backgroundColor: colors.error.light,
    color: colors.error.dark,
  },
  correctAnswerText: {
    color: colors.success.dark,
    fontWeight: '600',
  },
  explanationText: {
    color: colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
