/**
 * AnswerSubmitter Component
 *
 * Wraps AnswerInput with a countdown timer.
 * Timer can be in 'idle' (shows "--") or 'counting' (shows countdown) state.
 */

import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, spacing, radius } from '@monorepo/ui-components';
import { AnswerInput } from './AnswerInput';

export type TimerState = 'idle' | 'counting';
export type QuestionType = 'tossup' | 'bonus';

// Use ReturnType to get the correct timer type for React Native
type TimerRef = ReturnType<typeof setInterval> | null;

interface AnswerSubmitterProps {
  onSubmit: (answer: string) => void;
  onTimeUp: () => void;
  questionType: QuestionType;
  timerState: TimerState;
  answerTimeMs: number;
  microphoneEnabledByDefault?: boolean;
  testID?: string;
}

export const AnswerSubmitter: React.FC<AnswerSubmitterProps> = ({
  onSubmit,
  onTimeUp,
  questionType,
  timerState,
  answerTimeMs,
  microphoneEnabledByDefault = false,
  testID = 'answer-submitter',
}) => {
  const [timeRemaining, setTimeRemaining] = useState(Math.ceil(answerTimeMs / 1000));
  const timerRef = useRef<TimerRef>(null);
  const hasCalledTimeUpRef = useRef(false);

  // Reset timer when timerState changes to 'counting'
  useEffect(() => {
    if (timerState === 'counting') {
      setTimeRemaining(Math.ceil(answerTimeMs / 1000));
      hasCalledTimeUpRef.current = false;
    }
  }, [timerState, answerTimeMs]);

  // Handle countdown
  useEffect(() => {
    if (timerState !== 'counting') {
      // Clear any existing timer when not counting
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Call onTimeUp only once
          if (!hasCalledTimeUpRef.current) {
            hasCalledTimeUpRef.current = true;
            // Use setTimeout to avoid state update during render
            setTimeout(() => onTimeUp(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerState, onTimeUp]);

  // Get timer color based on time remaining
  const getTimerColor = () => {
    if (timerState === 'idle') {
      return colors.text.disabled;
    }
    if (timeRemaining <= 1) return colors.error.main;
    if (timeRemaining <= 2) return colors.warning.main;
    return colors.success.main;
  };

  // Get timer display text
  const getTimerDisplay = () => {
    if (timerState === 'idle') {
      return '--';
    }
    return `${timeRemaining}s`;
  };

  const handleSubmit = (answer: string) => {
    // Clear timer on submit
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onSubmit(answer);
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text variant="labelMedium" style={styles.label}>
          {questionType === 'tossup' ? 'Tossup Answer' : 'Bonus Answer'}
        </Text>
        <View style={[styles.timer, { backgroundColor: getTimerColor() }]} testID={`${testID}-timer`}>
          <Text variant="labelLarge" style={styles.timerText}>
            {getTimerDisplay()}
          </Text>
        </View>
      </View>

      <AnswerInput
        onSubmit={handleSubmit}
        microphoneEnabledByDefault={microphoneEnabledByDefault}
        testID={`${testID}-input`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  timer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    minWidth: 50,
    alignItems: 'center',
  },
  timerText: {
    color: colors.surface.default,
    fontWeight: 'bold',
  },
});
