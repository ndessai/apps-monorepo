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
import { spacing, elevation, radius } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';

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
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [timeRemaining, setTimeRemaining] = useState(Math.ceil(reviewTimeMs / 1000));
  const timerRef = useRef<TimerRef>(null);
  const hasCalledCompleteRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  // Pulse animation for countdown timer
  useEffect(() => {
    if (visible && timeRemaining > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [timeRemaining, visible, pulseAnim]);

  if (!visible) {
    return null;
  }

  // Determine status based on correctness and whether an answer was submitted
  const noAnswerSubmitted = !userAnswer || userAnswer.trim() === '';
  const statusColor = isCorrect
    ? colors.success.main
    : noAnswerSubmitted
      ? colors.warning.main
      : colors.error.main;
  const statusIcon = isCorrect
    ? 'check-circle'
    : noAnswerSubmitted
      ? 'clock-outline'
      : 'close-circle';
  const statusText = isCorrect
    ? 'Correct!'
    : noAnswerSubmitted
      ? "Time's Up!"
      : 'Incorrect';

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
            backgroundColor: colors.surface.default,
            transform: [{ translateY }],
          },
        ]}
        testID={testID}
      >
        {/* Drag handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.divider }]} />
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
            <View style={[styles.pointsBadge, { backgroundColor: colors.background.default }]}>
              <Text variant="titleLarge" style={[styles.pointsText, { color: getPointsColor() }]}>
                {getPointsDisplay()}
              </Text>
              <Text variant="labelSmall" style={[styles.pointsLabel, { color: colors.text.secondary }]}>
                points
              </Text>
            </View>
          </View>

          {/* User answer */}
          {userAnswer && (
            <View style={styles.answerSection}>
              <Text variant="labelMedium" style={[styles.sectionLabel, { color: colors.text.secondary }]}>
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
              <Text variant="labelMedium" style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                Acceptable Answers
              </Text>
              <Text variant="bodyMedium" style={[styles.acceptableAnswers, { color: colors.text.primary }]}>
                {acceptableAnswers.join(', ')}
              </Text>
            </View>
          )}

          {/* Timer */}
          <View style={styles.timerRow}>
            <Text variant="bodySmall" style={[styles.timerLabel, { color: colors.text.secondary }]}>
              {questionType === 'tossup' ? 'Next question in' : 'Next part in'}
            </Text>
            <Animated.View
              style={[styles.timerBadge, { backgroundColor: colors.primary.main, transform: [{ scale: pulseAnim }] }]}
            >
              <Text variant="headlineSmall" style={[styles.timerText, { color: colors.surface.default }]}>
                {timeRemaining}s
              </Text>
            </Animated.View>
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
    borderRadius: radius.md,
  },
  pointsText: {
    fontWeight: 'bold',
  },
  pointsLabel: {},
  answerSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  userAnswer: {
    fontWeight: '500',
  },
  acceptableAnswers: {},
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  timerLabel: {
    marginRight: spacing.sm,
  },
  timerBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    minWidth: 60,
    alignItems: 'center',
  },
  timerText: {
    fontWeight: 'bold',
  },
});
