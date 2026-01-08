/**
 * AnswerInput Component
 *
 * Bottom tray for entering answers with countdown timer and speech-to-text
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput as RNTextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Voice from '@react-native-voice/voice';
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
  const [isListening, setIsListening] = React.useState(false);
  const inputRef = useRef<RNTextInput>(null);

  // Auto-focus input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Setup voice recognition listeners
  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechEnd = onSpeechEnd;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

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

  const startListening = async () => {
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
            right={
              <TextInput.Icon
                icon={() => (
                  <TouchableOpacity onPress={toggleListening} testID={`${testID}-mic-button`}>
                    <Icon
                      name={isListening ? 'microphone' : 'microphone-outline'}
                      size={24}
                      color={isListening ? colors.error.main : colors.primary.main}
                    />
                  </TouchableOpacity>
                )}
              />
            }
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
