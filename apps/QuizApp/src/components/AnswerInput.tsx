/**
 * AnswerInput Component
 *
 * Text input with microphone button and Submit CTA for entering answers.
 * Supports speech-to-text for voice input with auto-submit on silence.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, TextInput as RNTextInput, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Voice from '@react-native-voice/voice';
import { spacing } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';

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
  const [answer, setAnswer] = React.useState('');
  const [isListening, setIsListening] = React.useState(false);
  const [voiceAvailable, setVoiceAvailable] = React.useState(false);
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
        onSubmit(lastSpeechResultRef.current.trim());
      }
    }, autoSubmitSilenceMs);
  }, [autoSubmitOnSilence, autoSubmitSilenceMs, hasSpeechResult, onSubmit, clearSilenceTimer]);

  // Define callback functions first
  const onSpeechResults = useCallback((e: any) => {
    if (e.value && e.value.length > 0) {
      const result = e.value[0];
      setAnswer(result);
      lastSpeechResultRef.current = result;
      setHasSpeechResult(true);

      // Reset silence timer on new speech
      clearSilenceTimer();
    }
  }, [clearSilenceTimer]);

  const onSpeechError = useCallback((e: any) => {
    console.error('Speech recognition error:', e);
    setIsListening(false);
    clearSilenceTimer();
    Alert.alert('Speech Recognition Error', 'Failed to recognize speech. Please try again.');
  }, [clearSilenceTimer]);

  const onSpeechEnd = useCallback(() => {
    setIsListening(false);

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

  // Setup voice recognition listeners
  useEffect(() => {
    let isMounted = true;

    const initVoice = async () => {
      // On Android, the native Voice module may not be properly linked
      // The Voice JS object exists but its native module is null
      // This causes errors like "Cannot read property 'isSpeechAvailable' of null"
      // We wrap everything in try-catch since errors occur inside the native calls
      try {
        const isAvailable = await Voice.isAvailable();
        if (!isMounted) return;

        if (isAvailable) {
          setVoiceAvailable(true);
          Voice.onSpeechResults = onSpeechResults;
          Voice.onSpeechError = onSpeechError;
          Voice.onSpeechEnd = onSpeechEnd;

          // Auto-start microphone if enabled by default
          if (microphoneEnabledByDefault && !hasAutoStartedRef.current) {
            hasAutoStartedRef.current = true;
            // Small delay to ensure component is fully mounted
            setTimeout(() => {
              if (isMounted) {
                startListeningInternal();
              }
            }, 300);
          }
        } else {
          setVoiceAvailable(false);
        }
      } catch {
        // Native module not available - this is expected on some Android devices
        // or when the native module isn't properly linked
        if (isMounted) {
          setVoiceAvailable(false);
        }
      }
    };

    initVoice();

    return () => {
      isMounted = false;
      clearSilenceTimer();
      clearIdleTimer();
      // Clean up Voice recognition on unmount
      try {
        Voice.removeAllListeners();
        Voice.destroy().catch(() => {});
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [microphoneEnabledByDefault, onSpeechResults, onSpeechError, onSpeechEnd, clearSilenceTimer, clearIdleTimer]);

  const startListeningInternal = async () => {
    try {
      setIsListening(true);
      setHasSpeechResult(false);
      hasAutoSubmittedRef.current = false;
      lastSpeechResultRef.current = '';
      clearSilenceTimer();
      await Voice.start('en-US');
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setIsListening(false);
    }
  };

  const startListening = async () => {
    if (!voiceAvailable) {
      Alert.alert('Not Available', 'Speech recognition is not available on this device.');
      return;
    }

    try {
      setIsListening(true);
      setHasSpeechResult(false);
      hasAutoSubmittedRef.current = false;
      lastSpeechResultRef.current = '';
      clearSilenceTimer();
      await Voice.start('en-US');
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setIsListening(false);
      Alert.alert('Error', 'Failed to start speech recognition. Please check microphone permissions.');
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
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
        stopListening();
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
                  disabled={!voiceAvailable}
                >
                  <Icon
                    name={isListening ? 'microphone' : 'microphone-outline'}
                    size={24}
                    color={
                      !voiceAvailable
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
