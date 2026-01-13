/**
 * AnswerInput Component
 *
 * Text input with microphone button and Submit CTA for entering answers.
 * Supports speech-to-text for voice input with auto-submit on silence.
 * Uses VoiceProvider for unified voice recognition.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, TextInput as RNTextInput, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';
import { useVoice } from '../providers/VoiceProvider';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  placeholder?: string;
  microphoneEnabledByDefault?: boolean;
  autoSubmitOnSilence?: boolean;
  autoSubmitSilenceMs?: number;
  autoSubmitOnIdle?: boolean;
  autoSubmitIdleMs?: number;
  testID?: string;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  onSubmit,
  placeholder = 'Enter your answer...',
  microphoneEnabledByDefault = false,
  autoSubmitOnSilence = false,
  autoSubmitSilenceMs = 1500,
  autoSubmitOnIdle = false,
  autoSubmitIdleMs = 1500,
  testID = 'answer-input',
}) => {
  const { colors } = useTheme();
  const { isListening, isAvailable, startListening, stopListening } = useVoice();

  const [answer, setAnswer] = React.useState('');
  const [hasSpeechResult, setHasSpeechResult] = React.useState(false);
  const inputRef = useRef<RNTextInput>(null);
  const hasAutoStartedRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpeechResultRef = useRef<string>('');
  const hasAutoSubmittedRef = useRef(false);
  const onSubmitRef = useRef(onSubmit);

  // Keep onSubmit ref updated to avoid stale closures
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  // Clear silence timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

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

    // Only start timer if there's text to submit
    if (currentAnswer.trim().length === 0) {
      return;
    }

    idleTimerRef.current = setTimeout(() => {
      // Auto-submit if we have text and haven't already submitted
      if (currentAnswer.trim().length > 0 && !hasAutoSubmittedRef.current) {
        hasAutoSubmittedRef.current = true;
        console.log('Auto-submitting after typing idle:', currentAnswer);
        onSubmitRef.current(currentAnswer.trim());
      }
    }, autoSubmitIdleMs);
  }, [autoSubmitOnIdle, autoSubmitIdleMs, clearIdleTimer]);

  // Start silence timer for auto-submit
  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();

    if (!autoSubmitOnSilence || !hasSpeechResult || hasAutoSubmittedRef.current) {
      return;
    }

    silenceTimerRef.current = setTimeout(() => {
      // Auto-submit if we have spoken text and haven't already submitted
      if (lastSpeechResultRef.current.trim().length > 0 && !hasAutoSubmittedRef.current) {
        hasAutoSubmittedRef.current = true;
        console.log('Auto-submitting after silence:', lastSpeechResultRef.current);
        onSubmitRef.current(lastSpeechResultRef.current.trim());
      }
    }, autoSubmitSilenceMs);
  }, [autoSubmitOnSilence, autoSubmitSilenceMs, hasSpeechResult, clearSilenceTimer]);

  // Handle speech result from VoiceProvider
  const handleSpeechResult = useCallback((result: string) => {
    setAnswer(result);
    lastSpeechResultRef.current = result;
    setHasSpeechResult(true);
    // Reset silence timer on new speech
    clearSilenceTimer();
  }, [clearSilenceTimer]);

  // Handle speech end - start silence timer
  const handleSpeechEnd = useCallback(() => {
    // Start silence timer when speech ends (if we have results)
    if (hasSpeechResult && autoSubmitOnSilence && lastSpeechResultRef.current.trim().length > 0) {
      startSilenceTimer();
    }
  }, [hasSpeechResult, autoSubmitOnSilence, startSilenceTimer]);

  // Auto-focus input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-start microphone if enabled by default
  useEffect(() => {
    if (microphoneEnabledByDefault && isAvailable && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      // Small delay to ensure component is fully mounted
      setTimeout(() => {
        startListeningHandler();
      }, 300);
    }
  }, [microphoneEnabledByDefault, isAvailable]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      clearIdleTimer();
    };
  }, [clearSilenceTimer, clearIdleTimer]);

  const startListeningHandler = async () => {
    if (!isAvailable) {
      Alert.alert('Not Available', 'Speech recognition is not available on this device.');
      return;
    }

    setHasSpeechResult(false);
    hasAutoSubmittedRef.current = false;
    lastSpeechResultRef.current = '';
    clearSilenceTimer();

    await startListening({
      continuous: false,
      filterTTS: false,
      onResult: handleSpeechResult,
      onEnd: handleSpeechEnd,
    });
  };

  const stopListeningHandler = async () => {
    await stopListening();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListeningHandler();
    } else {
      startListeningHandler();
    }
  };

  const handleSubmit = () => {
    if (answer.trim().length > 0) {
      // Clear timers and mark as submitted
      clearSilenceTimer();
      clearIdleTimer();
      hasAutoSubmittedRef.current = true;

      // Stop listening if active before submitting
      if (isListening) {
        stopListeningHandler();
      }
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  // Handle text changes - start idle timer on each change
  const handleTextChange = (text: string) => {
    setAnswer(text);
    // Start/reset idle timer when user types (only if there's text)
    if (autoSubmitOnIdle && text.trim().length > 0) {
      startIdleTimer(text);
    } else {
      clearIdleTimer();
    }
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
                  onPress={toggleListening}
                  testID={`${testID}-mic-button`}
                  disabled={!isAvailable}
                >
                  <Icon
                    name={isListening ? 'microphone' : 'microphone-outline'}
                    size={24}
                    color={
                      !isAvailable
                        ? colors.text.disabled
                        : isListening
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
