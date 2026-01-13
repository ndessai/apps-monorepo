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
import { spacing, elevation, radius } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';
import type { TossupResult, BonusResult } from '../types/quiz';

// Component accepts the actual result types from QuizScreen
type ResultRuntime = TossupResult | BonusResult;

// Type guard to check if result is a TossupResult
const isTossupResult = (result: ResultRuntime): result is TossupResult => {
  return 'wasBeforePowerMark' in result;
};

interface QuestionBreakdownProps {
  result: ResultRuntime;
  questionNumber: number;
  testID?: string;
}

export const QuestionBreakdown: React.FC<QuestionBreakdownProps> = ({
  result,
  questionNumber,
  testID = 'question-breakdown',
}) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  const isTossup = isTossupResult(result);
  const questionType = isTossup ? 'Toss-up' : 'Bonus';

  // Get points for display
  const getPoints = (): number => {
    if (isTossupResult(result)) {
      return result.points;
    }
    return result.totalPoints;
  };

  const points = getPoints();

  // Get point color based on score
  const getPointColor = (pts: number) => {
    if (pts > 0) return colors.success.main;
    if (pts < 0) return colors.error.main;
    return colors.text.secondary;
  };

  // Get result icon
  const getResultIcon = () => {
    if (points > 0) return 'check-circle';
    if (points < 0) return 'close-circle';
    return 'minus-circle';
  };

  const getResultIconColor = () => {
    if (points > 0) return colors.success.main;
    if (points < 0) return colors.error.main;
    return colors.text.secondary;
  };

  // Render question text for tossups
  const renderTossupQuestionText = (tossupResult: TossupResult) => {
    const text = tossupResult.questionText;
    // We don't have powerMarkPosition in the result, just show the text
    return (
      <Text variant="bodyMedium" style={[styles.questionText, { color: colors.text.primary }]}>
        {text}
      </Text>
    );
  };

  // Render question text for bonuses (show all parts)
  const renderBonusQuestionText = (bonusResult: BonusResult) => {
    return (
      <View>
        {bonusResult.parts.map((part, index) => (
          <View key={index} style={styles.bonusPartContainer}>
            <Text variant="bodyMedium" style={[styles.questionText, { color: colors.text.primary }]}>
              {index + 1}. {part.questionText}
            </Text>
            <View style={styles.bonusPartAnswer}>
              <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                Your answer:{' '}
                <Text style={{ color: part.isCorrect ? colors.success.main : colors.error.main }}>
                  {part.userAnswer || '(no answer)'}
                </Text>
              </Text>
              <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                Correct:{' '}
                <Text style={{ color: colors.success.dark }}>{part.correctAnswer}</Text>
              </Text>
              <Text variant="bodySmall" style={{ color: getPointColor(part.points) }}>
                {part.points > 0 ? '+' : ''}{part.points} pts
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface.default }]} testID={testID}>
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
              <Text variant="titleMedium" style={[styles.title, { color: colors.text.primary }]}>
                {questionType} {questionNumber}
              </Text>
              <Text variant="bodySmall" style={[styles.category, { color: colors.text.secondary }]}>
                {result.category}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text
              variant="titleLarge"
              style={[
                styles.points,
                { color: getPointColor(points) },
              ]}
            >
              {points > 0 ? '+' : ''}
              {points}
            </Text>
            <Icon
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.text.secondary}
            />
          </View>
        </View>

        {expanded && (
          <View style={[styles.details, { borderTopColor: colors.divider }]}>
            {/* Question text */}
            <View style={styles.section}>
              <Text variant="labelMedium" style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                Question
              </Text>
              {isTossupResult(result)
                ? renderTossupQuestionText(result)
                : renderBonusQuestionText(result)
              }
            </View>

            {/* Toss-up specific details */}
            {isTossupResult(result) && (
              <>
                <View style={styles.section}>
                  <Text variant="labelMedium" style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                    Details
                  </Text>
                  <Text variant="bodySmall" style={[styles.detailText, { color: colors.text.secondary }]}>
                    {result.wasBeforePowerMark
                      ? '⭐ Answered before power mark (15 pts)'
                      : 'Answered after power mark (10 pts)'}
                  </Text>
                  {result.wasInterrupted && (
                    <Text variant="bodySmall" style={[styles.detailText, { color: colors.text.secondary }]}>
                      ⚠️ Interrupted penalty (-5 pts)
                    </Text>
                  )}
                </View>

                {/* User answer for tossups */}
                <View style={styles.section}>
                  <Text variant="labelMedium" style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                    Your Answer
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.answerText,
                      result.isCorrect
                        ? { backgroundColor: colors.success.light, color: colors.success.dark }
                        : { backgroundColor: colors.error.light, color: colors.error.dark },
                    ]}
                  >
                    {result.userAnswer || '(no answer)'}
                  </Text>
                </View>

                {/* Correct answer for tossups */}
                <View style={styles.section}>
                  <Text variant="labelMedium" style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                    Correct Answer
                  </Text>
                  <Text variant="bodyMedium" style={[styles.correctAnswerText, { color: colors.success.dark }]}>
                    {result.correctAnswer}
                  </Text>
                </View>

                {/* Explanation if available */}
                {result.explanation && (
                  <View style={styles.section}>
                    <Text variant="labelMedium" style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                      Explanation
                    </Text>
                    <Text variant="bodySmall" style={[styles.explanationText, { color: colors.text.secondary }]}>
                      {result.explanation}
                    </Text>
                  </View>
                )}
              </>
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
  },
  category: {
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
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  questionText: {
    lineHeight: 22,
  },
  bonusPartContainer: {
    marginBottom: spacing.sm,
  },
  bonusPartAnswer: {
    marginTop: spacing.xs,
    marginLeft: spacing.md,
  },
  detailText: {
    marginTop: spacing.xs,
  },
  answerText: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    fontWeight: '500',
  },
  correctAnswerText: {
    fontWeight: '600',
  },
  explanationText: {
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
