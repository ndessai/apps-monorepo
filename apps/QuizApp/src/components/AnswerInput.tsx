/**
 * AnswerInput Component
 *
 * Text input with microphone button and Submit CTA for entering answers.
 * Supports speech-to-text for voice input with auto-submit on silence.
 * Uses nativeVoiceService directly for voice recognition.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { StyleSheet, View, TextInput as RNTextInput, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';
import * as voiceService from '../services/nativeVoiceService';

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

  // Voice state - managed locally instead of via VoiceProvider
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  console.log('[AnswerInput] Render - isAvailable:', isAvailable, 'isListening:', isListening);

  const [answer, setAnswer] = React.useState('');
  const inputRef = useRef<RNTextInput>(null);
  const hasAutoStartedRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpeechResultRef = useRef<string>('');
  const hasSpeechResultRef = useRef(false);
  const hasAutoSubmittedRef = useRef(false);
  const speechEndedRef = useRef(false);
  const onSubmitRef = useRef(onSubmit);
  const answerRef = useRef(answer);
  const isMountedRef = useRef(true);

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

  // Keep refs updated to avoid stale closures
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  // Initialize voice service on mount
  useEffect(() => {
    isMountedRef.current = true;

    const initVoice = async () => {
      const available = await voiceService.checkAvailability();
      if (available) {
        const initialized = await voiceService.initialize();
        if (isMountedRef.current) {
          setIsAvailable(initialized);
        }
      } else {
        const granted = await voiceService.requestPermission();
        if (isMountedRef.current) {
          setIsAvailable(granted);
        }
      }
    };

    initVoice();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
      if (lastSpeechResultRef.current.trim().length > 0 && !hasAutoSubmittedRef.current) {
        hasAutoSubmittedRef.current = true;
        console.log('[AnswerInput] Auto-submitting after silence:', lastSpeechResultRef.current);
        onSubmitRef.current(lastSpeechResultRef.current.trim());
      }
    }, autoSubmitSilenceMs);
  }, [autoSubmitOnSilence, autoSubmitSilenceMs, clearSilenceTimer]);

  // Handle speech result from voice service
  const handleSpeechResult = useCallback((result: string) => {
    console.log('[AnswerInput] Speech result received:', result);
    setAnswer(result);
    answerRef.current = result;
    lastSpeechResultRef.current = result;
    hasSpeechResultRef.current = true;
    clearSilenceTimer();

    if (speechEndedRef.current && autoSubmitOnSilence && result.trim().length > 0) {
      console.log('[AnswerInput] Speech already ended - starting silence timer immediately');
      startSilenceTimer();
    }
  }, [clearSilenceTimer, autoSubmitOnSilence, startSilenceTimer]);

  // Handle speech end - start silence timer
  const handleSpeechEnd = useCallback(() => {
    console.log('[AnswerInput] Speech ended');
    speechEndedRef.current = true;

    if (hasSpeechResultRef.current && autoSubmitOnSilence && lastSpeechResultRef.current.trim().length > 0) {
      console.log('[AnswerInput] Starting silence timer for auto-submit');
      startSilenceTimer();
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
  useEffect(() => {
    if (microphoneEnabledByDefault && isAvailable && !isListening && !hasAutoStartedRef.current) {
      console.log('[AnswerInput] Auto-starting microphone (isListening:', isListening, ')');
      const timer = setTimeout(() => {
        if (!hasAutoStartedRef.current && isMountedRef.current) {
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
      voiceService.stopListening();
    };
  }, [clearSilenceTimer, clearIdleTimer]);

  const startListeningHandler = async () => {
    if (!isAvailable) {
      Alert.alert('Not Available', 'Speech recognition is not available on this device.');
      return;
    }

    hasSpeechResultRef.current = false;
    hasAutoSubmittedRef.current = false;
    speechEndedRef.current = false;
    lastSpeechResultRef.current = '';
    clearSilenceTimer();

    console.log('[AnswerInput] Starting listening...');
    const success = await voiceService.startListening(
      {
        continuous: false,
        filterTTSEcho: false, // Disabled - TTS is stopped before answer tray opens, no echo to filter
        language: 'en-US',
      },
      {
        onStart: () => {
          console.log('[AnswerInput] voiceService onStart');
          if (isMountedRef.current) setIsListening(true);
        },
        onEnd: () => {
          console.log('[AnswerInput] voiceService onEnd');
          if (isMountedRef.current) setIsListening(false);
          handleSpeechEnd();
        },
        onResult: handleSpeechResult,
        onPartialResult: (text) => {
          console.log('[AnswerInput] voiceService onPartialResult:', text);
          if (isMountedRef.current) {
            setAnswer(text);
            answerRef.current = text;
            // Track partial results too for auto-submit
            // In case final result isn't received before end event
            if (text.trim().length > 0) {
              lastSpeechResultRef.current = text;
              hasSpeechResultRef.current = true;
            }
          }
        },
        onError: (error) => {
          console.log('[AnswerInput] voiceService onError:', error);
          if (isMountedRef.current) {
            setIsListening(false);
            // Treat error as speech end for auto-submit purposes
            // This handles cases like timeout or no speech detected
            handleSpeechEnd();
          }
        },
      }
    );

    if (success && isMountedRef.current) {
      setIsListening(true);
    }
  };

  const stopListeningHandler = async () => {
    await voiceService.stopListening();
    if (isMountedRef.current) {
      setIsListening(false);
    }
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
      clearSilenceTimer();
      clearIdleTimer();
      hasAutoSubmittedRef.current = true;

      if (isListening) {
        stopListeningHandler();
      }
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
