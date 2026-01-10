/**
 * AnswerBottomSheet Component
 *
 * Animated bottom sheet containing AnswerSubmitter.
 * Slides up from bottom with spring animation.
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { colors, spacing, elevation, radius } from '@monorepo/ui-components';
import { AnswerSubmitter, TimerState, QuestionType } from './AnswerSubmitter';

const SHEET_HEIGHT = 220;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AnswerBottomSheetProps {
  visible: boolean;
  onSubmit: (answer: string) => void;
  onTimeUp: () => void;
  questionType: QuestionType;
  timerState: TimerState;
  answerTimeMs: number;
  microphoneEnabledByDefault?: boolean;
  testID?: string;
}

export const AnswerBottomSheet: React.FC<AnswerBottomSheetProps> = ({
  visible,
  onSubmit,
  onTimeUp,
  questionType,
  timerState,
  answerTimeMs,
  microphoneEnabledByDefault = false,
  testID = 'answer-bottom-sheet',
}) => {
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
          <AnswerSubmitter
            onSubmit={onSubmit}
            onTimeUp={onTimeUp}
            questionType={questionType}
            timerState={timerState}
            answerTimeMs={answerTimeMs}
            microphoneEnabledByDefault={microphoneEnabledByDefault}
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
});
