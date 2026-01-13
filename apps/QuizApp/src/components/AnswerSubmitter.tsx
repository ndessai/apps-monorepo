/**
 * AnswerSubmitter Component
 *
 * Wraps AnswerInput with a countdown timer.
 * Timer can be in 'idle' (shows "--") or 'counting' (shows countdown) state.
 */

import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
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
  autoSubmitOnSilence?: boolean;
  autoSubmitSilenceMs?: number;
  testID?: string;
}

export const AnswerSubmitter: React.FC<AnswerSubmitterProps> = ({
  onSubmit,
  onTimeUp,
  questionType,
  timerState,
  answerTimeMs,
  microphoneEnabledByDefault = false,
  autoSubmitOnSilence = false,
  autoSubmitSilenceMs = 1500,
  testID = 'answer-submitter',
}) => {
  const [timeRemaining, setTimeRemaining] = useState(Math.ceil(answerTimeMs / 1000));
  const timerRef = useRef<TimerRef>(null);
  const hasCalledTimeUpRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const onTimeUpRef = useRef(onTimeUp);

  // Keep onTimeUp ref updated to avoid stale closures
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Handle timer state changes and countdown
  useEffect(() => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (timerState !== 'counting') {
      return;
    }

    // Reset state when starting to count
    const initialTime = Math.ceil(answerTimeMs / 1000);
    setTimeRemaining(initialTime);
    hasCalledTimeUpRef.current = false;

    // Start countdown
    let currentTime = initialTime;
    timerRef.current = setInterval(() => {
      currentTime -= 1;
      setTimeRemaining(currentTime);

      if (currentTime <= 0) {
        // Time's up
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // Call onTimeUp only once
        if (!hasCalledTimeUpRef.current) {
          hasCalledTimeUpRef.current = true;
          // Use setTimeout to avoid state update during render
          setTimeout(() => onTimeUpRef.current(), 0);
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerState, answerTimeMs]);

  // Pulse animation when time is low
  useEffect(() => {
    if (timerState === 'counting' && timeRemaining <= 5 && timeRemaining > 0) {
      // Create pulse animation
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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
  }, [timeRemaining, timerState, pulseAnim]);

  // Get timer color based on time remaining
  const getTimerColor = () => {
    if (timerState === 'idle') {
      return colors.text.disabled;
    }
    if (timeRemaining <= 2) return colors.error.main;
    if (timeRemaining <= 5) return colors.warning.main;
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
          Your Answer
        </Text>
        <Animated.View
          style={[
            styles.timer,
            { backgroundColor: getTimerColor(), transform: [{ scale: pulseAnim }] },
          ]}
          testID={`${testID}-timer`}
        >
          <Text variant="labelLarge" style={styles.timerText}>
            {getTimerDisplay()}
          </Text>
        </Animated.View>
      </View>

      <AnswerInput
        onSubmit={handleSubmit}
        microphoneEnabledByDefault={microphoneEnabledByDefault}
        autoSubmitOnSilence={autoSubmitOnSilence}
        autoSubmitSilenceMs={autoSubmitSilenceMs}
        autoSubmitOnIdle={autoSubmitOnSilence}
        autoSubmitIdleMs={autoSubmitSilenceMs}
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
