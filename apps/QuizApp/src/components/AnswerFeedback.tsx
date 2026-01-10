/**
 * AnswerFeedback Component
 *
 * Displays feedback after an answer is submitted:
 * - Whether the answer was correct or wrong
 * - Points scored
 * - Acceptable answers (if applicable)
 * - Countdown timer until next question
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, elevation, radius } from '@monorepo/ui-components';

type TimerRef = ReturnType<typeof setInterval> | null;

export type QuestionType = 'tossup' | 'bonus';

interface AnswerFeedbackProps {
  visible: boolean;
  isCorrect: boolean;
  points: number;
  userAnswer: string | null;
  acceptableAnswers: string[];
  questionType: QuestionType;
  reviewTimeMs: number;
  onReviewComplete: () => void;
  testID?: string;
}

const SHEET_HEIGHT = 280;

export const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({
  visible,
  isCorrect,
  points,
  userAnswer,
  acceptableAnswers,
  questionType,
  reviewTimeMs,
  onReviewComplete,
  testID = 'answer-feedback',
}) => {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [timeRemaining, setTimeRemaining] = useState(Math.ceil(reviewTimeMs / 1000));
  const timerRef = useRef<TimerRef>(null);
  const hasCalledCompleteRef = useRef(false);

  // Animate sheet visibility
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [visible, translateY]);

  // Reset and start countdown when visible
  useEffect(() => {
    if (visible) {
      setTimeRemaining(Math.ceil(reviewTimeMs / 1000));
      hasCalledCompleteRef.current = false;

      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            if (!hasCalledCompleteRef.current) {
              hasCalledCompleteRef.current = true;
              setTimeout(() => onReviewComplete(), 0);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, reviewTimeMs, onReviewComplete]);

  if (!visible) {
    return null;
  }

  const statusColor = isCorrect ? colors.success.main : colors.error.main;
  const statusIcon = isCorrect ? 'check-circle' : 'close-circle';
  const statusText = isCorrect ? 'Correct!' : 'Incorrect';

  // Format points display
  const getPointsDisplay = () => {
    if (points > 0) {
      return `+${points}`;
    } else if (points < 0) {
      return `${points}`;
    }
    return '0';
  };

  // Get points color
  const getPointsColor = () => {
    if (points > 0) return colors.success.main;
    if (points < 0) return colors.error.main;
    return colors.text.secondary;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
          },
        ]}
        testID={testID}
      >
        {/* Drag handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Status row */}
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <Icon name={statusIcon} size={32} color={statusColor} />
              <Text variant="headlineSmall" style={[styles.statusText, { color: statusColor }]}>
                {statusText}
              </Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text variant="titleLarge" style={[styles.pointsText, { color: getPointsColor() }]}>
                {getPointsDisplay()}
              </Text>
              <Text variant="labelSmall" style={styles.pointsLabel}>
                points
              </Text>
            </View>
          </View>

          {/* User answer */}
          {userAnswer && (
            <View style={styles.answerSection}>
              <Text variant="labelMedium" style={styles.sectionLabel}>
                Your Answer
              </Text>
              <Text
                variant="bodyLarge"
                style={[
                  styles.userAnswer,
                  { color: isCorrect ? colors.success.main : colors.error.main },
                ]}
              >
                {userAnswer}
              </Text>
            </View>
          )}

          {/* Acceptable answers */}
          {!isCorrect && acceptableAnswers.length > 0 && (
            <View style={styles.answerSection}>
              <Text variant="labelMedium" style={styles.sectionLabel}>
                Acceptable Answers
              </Text>
              <Text variant="bodyMedium" style={styles.acceptableAnswers}>
                {acceptableAnswers.join(', ')}
              </Text>
            </View>
          )}

          {/* Timer */}
          <View style={styles.timerRow}>
            <Text variant="bodySmall" style={styles.timerLabel}>
              {questionType === 'tossup' ? 'Next question in' : 'Next part in'}
            </Text>
            <View style={styles.timerBadge}>
              <Text variant="labelLarge" style={styles.timerText}>
                {timeRemaining}s
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    height: SHEET_HEIGHT,
    backgroundColor: colors.surface.default,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    ...elevation.level4,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: radius.full,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: spacing.sm,
    fontWeight: 'bold',
  },
  pointsBadge: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.default,
    borderRadius: radius.md,
  },
  pointsText: {
    fontWeight: 'bold',
  },
  pointsLabel: {
    color: colors.text.secondary,
  },
  answerSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  userAnswer: {
    fontWeight: '500',
  },
  acceptableAnswers: {
    color: colors.text.primary,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  timerLabel: {
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  timerBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary.main,
    borderRadius: radius.full,
  },
  timerText: {
    color: colors.surface.default,
    fontWeight: 'bold',
  },
});
