/**
 * AnswerInput Component
 *
 * Bottom tray for entering answers with countdown timer
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput as RNTextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { colors, spacing, elevation, radius } from '@monorepo/ui-components';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  timeRemaining: number;
  placeholder?: string;
  testID?: string;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  onSubmit,
  timeRemaining,
  placeholder = 'Enter your answer...',
  testID = 'answer-input',
}) => {
  const [answer, setAnswer] = React.useState('');
  const inputRef = useRef<RNTextInput>(null);

  // Auto-focus input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (answer.trim().length > 0) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  // Get timer color based on time remaining
  const getTimerColor = () => {
    if (timeRemaining <= 1) return colors.error.main;
    if (timeRemaining <= 2) return colors.warning.main;
    return colors.success.main;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <View style={styles.container} testID={testID}>
        <View style={styles.header}>
          <Text variant="labelMedium" style={styles.label}>
            Answer
          </Text>
          <View style={[styles.timer, { backgroundColor: getTimerColor() }]}>
            <Text variant="labelLarge" style={styles.timerText}>
              {timeRemaining}s
            </Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            value={answer}
            onChangeText={setAnswer}
            onSubmitEditing={handleSubmit}
            placeholder={placeholder}
            mode="outlined"
            style={styles.input}
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            testID={`${testID}-field`}
          />
        </View>
      </View>
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
    backgroundColor: colors.surface.default,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    ...elevation.level4,
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
  inputContainer: {
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface.default,
  },
});
