/**
 * AnswerInput Component
 *
 * Text input with microphone button and Submit CTA for entering answers.
 * Supports speech-to-text for voice input.
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput as RNTextInput, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Voice from '@react-native-voice/voice';
import { colors, spacing } from '@monorepo/ui-components';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  placeholder?: string;
  microphoneEnabledByDefault?: boolean;
  testID?: string;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  onSubmit,
  placeholder = 'Enter your answer...',
  microphoneEnabledByDefault = false,
  testID = 'answer-input',
}) => {
  const [answer, setAnswer] = React.useState('');
  const [isListening, setIsListening] = React.useState(false);
  const [voiceAvailable, setVoiceAvailable] = React.useState(false);
  const inputRef = useRef<RNTextInput>(null);
  const hasAutoStartedRef = useRef(false);

  // Define callback functions first
  const onSpeechResults = (e: any) => {
    if (e.value && e.value.length > 0) {
      setAnswer(e.value[0]);
    }
  };

  const onSpeechError = (e: any) => {
    console.error('Speech recognition error:', e);
    setIsListening(false);
    Alert.alert('Speech Recognition Error', 'Failed to recognize speech. Please try again.');
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

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
      // Clean up Voice recognition on unmount
      try {
        Voice.removeAllListeners();
        Voice.destroy().catch(() => {});
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [microphoneEnabledByDefault]);

  const startListeningInternal = async () => {
    try {
      setIsListening(true);
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
      // Stop listening if active before submitting
      if (isListening) {
        stopListening();
      }
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  const isSubmitDisabled = answer.trim().length === 0;

  return (
    <View style={styles.container} testID={testID}>
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
  input: {
    backgroundColor: colors.surface.default,
  },
  submitContainer: {
    alignItems: 'center',
  },
  submitButton: {
    minWidth: 120,
  },
});
