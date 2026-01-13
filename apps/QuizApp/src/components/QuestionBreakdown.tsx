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
import type { TossupQuestion, BonusQuestion } from '../types/quiz';

// Runtime result types (what QuizScreen actually passes)
interface TossupResultRuntime {
  question: TossupQuestion;
  userAnswer: string | null;
  isCorrect: boolean;
  wasBeforePowerMark: boolean;
  wasInterrupted: boolean;
  points: number;
}

interface BonusResultRuntime {
  question: BonusQuestion;
  userAnswer: string | null;
  isCorrect: boolean;
  points: number;
}

type ResultRuntime = TossupResultRuntime | BonusResultRuntime;

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

  // Find the end of word position from a given index
  const findWordEnd = (text: string, pos: number): number => {
    let endPos = pos;
    // If we're in the middle of a word, find the end of that word
    while (endPos < text.length && !/\s/.test(text[endPos])) {
      endPos++;
    }
    return endPos;
  };

  // Render question text with power mark highlighting for tossups
  const renderQuestionText = () => {
    if (isTossup) {
      const tossupResult = result as TossupResultRuntime;
      const question = tossupResult.question;
      const powerMarkPos = question.powerMarkPosition;
      const text = question.text;

      if (powerMarkPos > 0 && powerMarkPos < text.length) {
        // If power mark is in the middle of a word, extend to end of word
        const adjustedPowerMarkPos = findWordEnd(text, powerMarkPos);
        const powerPortion = text.substring(0, adjustedPowerMarkPos);
        const remainingPortion = text.substring(adjustedPowerMarkPos);

        return (
          <Text variant="bodyMedium" style={[styles.questionText, { color: colors.text.primary }]}>
            <Text style={[styles.powerText, { color: colors.warning.dark }]}>{powerPortion}</Text>
            <Text style={[styles.powerMarker, { color: colors.warning.main }]}> ★ </Text>
            <Text>{remainingPortion}</Text>
          </Text>
        );
      }
    }

    // For bonus questions, show all parts
    if (!isTossup) {
      const bonusResult = result as BonusResultRuntime;
      return (
        <View>
          {bonusResult.question.parts.map((part, index) => (
            <Text key={index} variant="bodyMedium" style={[styles.questionText, { color: colors.text.primary }]}>
              {index + 1}. {part.text}
            </Text>
          ))}
        </View>
      );
    }

    // Default: tossup without power mark
    return (
      <Text variant="bodyMedium" style={[styles.questionText, { color: colors.text.primary }]}>
        {(result as TossupResultRuntime).question.text}
      </Text>
    );
  };

  // Get the correct answer text
  const getCorrectAnswer = () => {
    if (isTossup) {
      return (result as TossupResultRuntime).question.answer;
    }
    // For bonus, show all part answers
    const bonusResult = result as BonusResultRuntime;
    return bonusResult.question.parts.map((p) => p.answer).join(', ');
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
          <View style={[styles.details, { borderTopColor: colors.divider }]}>
            {/* Question text with power mark for tossups */}
            <View style={styles.section}>
              <Text variant="labelMedium" style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                Question
              </Text>
              {renderQuestionText()}
            </View>

            {/* Toss-up specific details */}
            {isTossup && (
              <View style={styles.section}>
                <Text variant="labelMedium" style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                  Details
                </Text>
                <Text variant="bodySmall" style={[styles.detailText, { color: colors.text.secondary }]}>
                  {(result as TossupResultRuntime).wasBeforePowerMark
                    ? '⭐ Answered before power mark (15 pts)'
                    : 'Answered after power mark (10 pts)'}
                </Text>
                {(result as TossupResultRuntime).wasInterrupted && (
                  <Text variant="bodySmall" style={[styles.detailText, { color: colors.text.secondary }]}>
                    ⚠️ Interrupted penalty (-5 pts)
                  </Text>
                )}
              </View>
            )}

            {/* User answer */}
            {result.userAnswer && (
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
                  {result.userAnswer}
                </Text>
              </View>
            )}

            {/* Correct answer */}
            <View style={styles.section}>
              <Text variant="labelMedium" style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                Correct Answer
              </Text>
              <Text variant="bodyMedium" style={[styles.correctAnswerText, { color: colors.success.dark }]}>
                {getCorrectAnswer()}
              </Text>
            </View>

            {/* Explanation if available (tossups only) */}
            {isTossup && (result as TossupResultRuntime).question.explanation && (
              <View style={styles.section}>
                <Text variant="labelMedium" style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                  Explanation
                </Text>
                <Text variant="bodySmall" style={[styles.explanationText, { color: colors.text.secondary }]}>
                  {(result as TossupResultRuntime).question.explanation}
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
  powerText: {
    fontWeight: '600',
  },
  powerMarker: {
    fontWeight: 'bold',
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
