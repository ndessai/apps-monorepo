/**
 * AnswerBottomSheet Component
 *
 * Animated bottom sheet containing AnswerSubmitter.
 * Slides up from bottom with spring animation.
 * Voice recognition state is passed through from parent (QuizScreen).
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { spacing, elevation, radius } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';
import { AnswerSubmitter, TimerState, QuestionTypeKey } from './AnswerSubmitter';

const SHEET_HEIGHT = 220;

interface AnswerBottomSheetProps {
  visible: boolean;
  onSubmit: (answer: string) => void;
  onTimeUp: () => void;
  questionType: QuestionTypeKey;
  timerState: TimerState;
  answerTimeMs: number;
  /** Text from voice recognition (managed by parent) */
  voiceText?: string;
  /** Whether voice recognition is currently active */
  isVoiceListening?: boolean;
  /** Whether voice recognition is available on this device */
  isVoiceAvailable?: boolean;
  /** Callback when microphone button is pressed */
  onMicrophonePress?: () => void;
  /** Auto-submit after silence (used with voice input) */
  autoSubmitOnSilence?: boolean;
  autoSubmitSilenceMs?: number;
  testID?: string;
}

export const AnswerBottomSheet: React.FC<AnswerBottomSheetProps> = ({
  visible,
  onSubmit,
  onTimeUp,
  questionType,
  timerState,
  answerTimeMs,
  voiceText,
  isVoiceListening = false,
  isVoiceAvailable = true,
  onMicrophonePress,
  autoSubmitOnSilence = false,
  autoSubmitSilenceMs = 1500,
  testID = 'answer-bottom-sheet',
}) => {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [visible, translateY]);

  // Don't render if not visible to save resources
  if (!visible) {
    return null;
  }

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
            backgroundColor: colors.surface.elevated,
            borderTopColor: colors.divider,
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
          <AnswerSubmitter
            onSubmit={onSubmit}
            onTimeUp={onTimeUp}
            questionType={questionType}
            timerState={timerState}
            answerTimeMs={answerTimeMs}
            voiceText={voiceText}
            isVoiceListening={isVoiceListening}
            isVoiceAvailable={isVoiceAvailable}
            onMicrophonePress={onMicrophonePress}
            autoSubmitOnSilence={autoSubmitOnSilence}
            autoSubmitSilenceMs={autoSubmitSilenceMs}
            testID={`${testID}-submitter`}
          />
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
    borderTopWidth: 1,
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
});
