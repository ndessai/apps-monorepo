/**
 * AnswerInput Component
 *
 * Text input with microphone indicator and Submit CTA for entering answers.
 * Voice recognition is handled externally via props - this component
 * only displays the input field and handles text entry.
 *
 * Voice text is passed in via the `voiceText` prop from the parent component
 * which manages voice recognition through useQuizVoice hook.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { StyleSheet, View, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  placeholder?: string;
  /** Text from voice recognition (managed by parent) */
  voiceText?: string;
  /** Whether voice recognition is currently active (managed by parent) */
  isVoiceListening?: boolean;
  /** Whether voice recognition is available on this device */
  isVoiceAvailable?: boolean;
  /** Callback when microphone button is pressed */
  onMicrophonePress?: () => void;
  /** Auto-submit after typing inactivity */
  autoSubmitOnIdle?: boolean;
  autoSubmitIdleMs?: number;
  testID?: string;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  onSubmit,
  placeholder = 'Enter your answer...',
  voiceText,
  isVoiceListening = false,
  isVoiceAvailable = true,
  onMicrophonePress,
  autoSubmitOnIdle = false,
  autoSubmitIdleMs = 1500,
  testID = 'answer-input',
}) => {
  const { colors } = useTheme();

  const [answer, setAnswer] = useState('');
  const inputRef = useRef<RNTextInput>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoSubmittedRef = useRef(false);
  const onSubmitRef = useRef(onSubmit);
  const answerRef = useRef(answer);
  const isMountedRef = useRef(true);

  // Keep refs updated to avoid stale closures
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Update answer when voiceText prop changes
  useEffect(() => {
    if (voiceText !== undefined && voiceText !== answer) {
      console.log('[AnswerInput] Voice text received:', voiceText);
      setAnswer(voiceText);
      answerRef.current = voiceText;

      // Start idle timer for auto-submit if enabled
      if (autoSubmitOnIdle && voiceText.trim().length > 0) {
        startIdleTimer(voiceText);
      }
    }
  }, [voiceText]);

  // Clear idle timer
  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  // Start idle timer for auto-submit on typing inactivity
  const startIdleTimer = useCallback((currentAnswer: string) => {
    clearIdleTimer();

    if (!autoSubmitOnIdle || hasAutoSubmittedRef.current) {
      return;
    }

    if (currentAnswer.trim().length === 0) {
      return;
    }

    console.log('[AnswerInput] Starting idle timer for:', currentAnswer);
    idleTimerRef.current = setTimeout(() => {
      const latestAnswer = answerRef.current;
      if (latestAnswer.trim().length > 0 && !hasAutoSubmittedRef.current) {
        hasAutoSubmittedRef.current = true;
        console.log('[AnswerInput] Auto-submitting after typing idle:', latestAnswer);
        onSubmitRef.current(latestAnswer.trim());
      }
    }, autoSubmitIdleMs);
  }, [autoSubmitOnIdle, autoSubmitIdleMs, clearIdleTimer]);

  // Auto-focus input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearIdleTimer();
    };
  }, [clearIdleTimer]);

  const handleSubmit = () => {
    if (answer.trim().length > 0) {
      clearIdleTimer();
      hasAutoSubmittedRef.current = true;
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  const handleTextChange = (text: string) => {
    console.log('[AnswerInput] Text changed to:', text);
    setAnswer(text);
    answerRef.current = text;
    if (autoSubmitOnIdle && text.trim().length > 0) {
      startIdleTimer(text);
    } else {
      clearIdleTimer();
    }
  };

  const handleMicrophonePress = () => {
    onMicrophonePress?.();
  };

  const isSubmitDisabled = answer.trim().length === 0;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          value={answer}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.surface.default }]}
          returnKeyType="done"
          autoCapitalize="none"
          autoCorrect={false}
          testID={`${testID}-field`}
          right={
            <TextInput.Icon
              icon={() => (
                <TouchableOpacity
                  onPress={handleMicrophonePress}
                  testID={`${testID}-mic-button`}
                  disabled={!isVoiceAvailable || !onMicrophonePress}
                >
                  <Icon
                    name={isVoiceListening ? 'microphone' : 'microphone-outline'}
                    size={24}
                    color={
                      !isVoiceAvailable
                        ? colors.text.disabled
                        : isVoiceListening
                        ? colors.error.main
                        : colors.primary.main
                    }
                  />
                </TouchableOpacity>
              )}
            />
          }
        />
      </View>

      <View style={styles.submitContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          style={styles.submitButton}
          testID={`${testID}-submit-button`}
        >
          Submit
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.sm,
  },
  input: {},
  submitContainer: {
    alignItems: 'center',
  },
  submitButton: {
    minWidth: 120,
  },
});
