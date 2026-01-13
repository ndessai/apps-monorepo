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

  console.log('[AnswerInput] Render - isAvailable:', isAvailable, 'isListening:', isListening);

  // Log props on mount for debugging
  useEffect(() => {
    console.log('[AnswerInput] Mounted with props:', {
      microphoneEnabledByDefault,
      autoSubmitOnSilence,
      autoSubmitSilenceMs,
      autoSubmitOnIdle,
      autoSubmitIdleMs,
    });
    return () => {
      console.log('[AnswerInput] Unmounting');
    };
  }, []);

  const [answer, setAnswer] = React.useState('');
  const inputRef = useRef<RNTextInput>(null);
  const hasAutoStartedRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpeechResultRef = useRef<string>('');
  const hasSpeechResultRef = useRef(false);
  const hasAutoSubmittedRef = useRef(false);
  const onSubmitRef = useRef(onSubmit);
  const answerRef = useRef(answer);

  // Keep refs updated to avoid stale closures
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

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

    console.log('[AnswerInput] Starting idle timer for:', currentAnswer);
    idleTimerRef.current = setTimeout(() => {
      // Use ref to get latest answer value
      const latestAnswer = answerRef.current;
      // Auto-submit if we have text and haven't already submitted
      if (latestAnswer.trim().length > 0 && !hasAutoSubmittedRef.current) {
        hasAutoSubmittedRef.current = true;
        console.log('[AnswerInput] Auto-submitting after typing idle:', latestAnswer);
        onSubmitRef.current(latestAnswer.trim());
      }
    }, autoSubmitIdleMs);
  }, [autoSubmitOnIdle, autoSubmitIdleMs, clearIdleTimer]);

  // Start silence timer for auto-submit after speech ends
  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();

    if (!autoSubmitOnSilence || !hasSpeechResultRef.current || hasAutoSubmittedRef.current) {
      console.log('[AnswerInput] Skipping silence timer:', {
        autoSubmitOnSilence,
        hasSpeechResult: hasSpeechResultRef.current,
        hasAutoSubmitted: hasAutoSubmittedRef.current,
      });
      return;
    }

    console.log('[AnswerInput] Starting silence timer for:', lastSpeechResultRef.current);
    silenceTimerRef.current = setTimeout(() => {
      // Auto-submit if we have spoken text and haven't already submitted
      if (lastSpeechResultRef.current.trim().length > 0 && !hasAutoSubmittedRef.current) {
        hasAutoSubmittedRef.current = true;
        console.log('[AnswerInput] Auto-submitting after silence:', lastSpeechResultRef.current);
        onSubmitRef.current(lastSpeechResultRef.current.trim());
      }
    }, autoSubmitSilenceMs);
  }, [autoSubmitOnSilence, autoSubmitSilenceMs, clearSilenceTimer]);

  // Handle speech result from VoiceProvider
  const handleSpeechResult = useCallback((result: string) => {
    console.log('[AnswerInput] Speech result received:', result);
    console.log('[AnswerInput] Setting answer state to:', result);
    setAnswer(result);
    answerRef.current = result;
    lastSpeechResultRef.current = result;
    hasSpeechResultRef.current = true;
    console.log('[AnswerInput] hasSpeechResultRef set to true');
    // Reset silence timer on new speech (will be restarted on speech end)
    clearSilenceTimer();
  }, [clearSilenceTimer]);

  // Handle speech end - start silence timer
  const handleSpeechEnd = useCallback(() => {
    console.log('[AnswerInput] Speech ended');
    console.log('[AnswerInput] - hasSpeechResult:', hasSpeechResultRef.current);
    console.log('[AnswerInput] - autoSubmitOnSilence:', autoSubmitOnSilence);
    console.log('[AnswerInput] - lastSpeechResult:', lastSpeechResultRef.current);
    // Start silence timer when speech ends (if we have results)
    if (hasSpeechResultRef.current && autoSubmitOnSilence && lastSpeechResultRef.current.trim().length > 0) {
      console.log('[AnswerInput] Starting silence timer for auto-submit');
      startSilenceTimer();
    } else {
      console.log('[AnswerInput] NOT starting silence timer - conditions not met');
    }
  }, [autoSubmitOnSilence, startSilenceTimer]);

  // Auto-focus input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-start microphone if enabled by default
  // Re-check when isListening changes (e.g., after audioActionsService stops)
  useEffect(() => {
    // Only auto-start if:
    // 1. microphoneEnabledByDefault is true
    // 2. Voice is available
    // 3. Voice is NOT currently listening (someone else might be using it)
    // 4. We haven't successfully started listening yet
    if (microphoneEnabledByDefault && isAvailable && !isListening && !hasAutoStartedRef.current) {
      // Small delay to ensure component is fully mounted and voice is ready
      console.log('[AnswerInput] Auto-starting microphone (isListening:', isListening, ')');
      const timer = setTimeout(() => {
        // Double-check we still want to start (component might have unmounted)
        if (!hasAutoStartedRef.current) {
          hasAutoStartedRef.current = true;
          startListeningHandler();
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [microphoneEnabledByDefault, isAvailable, isListening]);

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

    // Reset state for new listening session
    hasSpeechResultRef.current = false;
    hasAutoSubmittedRef.current = false;
    lastSpeechResultRef.current = '';
    clearSilenceTimer();

    console.log('[AnswerInput] Starting listening...');
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
    console.log('[AnswerInput] Text changed to:', text);
    setAnswer(text);
    answerRef.current = text;
    // Start/reset idle timer when user types (only if there's text)
    if (autoSubmitOnIdle && text.trim().length > 0) {
      console.log('[AnswerInput] autoSubmitOnIdle is true, starting idle timer');
      startIdleTimer(text);
    } else {
      console.log('[AnswerInput] NOT starting idle timer - autoSubmitOnIdle:', autoSubmitOnIdle);
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
