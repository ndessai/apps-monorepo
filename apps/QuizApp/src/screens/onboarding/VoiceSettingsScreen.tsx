/**
 * VoiceSettingsScreen
 *
 * Third screen of the onboarding wizard
 * Allows user to enable/disable voice interaction with live demo
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button, Text, Switch, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Voice from '@react-native-voice/voice';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, radius, elevation } from '@monorepo/ui-components';
import { useTheme } from '../../providers/ThemeProvider';
import { useDatabase } from '../../providers/DatabaseProvider';
import { getCurrentUser } from '../../services/userService';
import { updateQuizSettings } from '../../services/quizSettingsService';
import type { OnboardingStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'VoiceSettings'>;

export const VoiceSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const database = useDatabase();
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const isMountedRef = useRef(true);

  const onSpeechResults = useCallback((e: any) => {
    if (e.value && e.value.length > 0 && isMountedRef.current) {
      setSpokenText(e.value[0]);
    }
  }, []);

  const onSpeechError = useCallback((e: any) => {
    console.log('Speech error:', e);
    if (isMountedRef.current) {
      setIsListening(false);
    }
  }, []);

  const onSpeechEnd = useCallback(() => {
    if (isMountedRef.current) {
      setIsListening(false);
    }
  }, []);

  // Initialize voice
  useEffect(() => {
    isMountedRef.current = true;

    const initVoice = async () => {
      try {
        const isAvailable = await Voice.isAvailable();
        if (isMountedRef.current) {
          setVoiceAvailable(!!isAvailable);
          Voice.onSpeechResults = onSpeechResults;
          Voice.onSpeechError = onSpeechError;
          Voice.onSpeechEnd = onSpeechEnd;
        }
      } catch {
        if (isMountedRef.current) {
          setVoiceAvailable(false);
        }
      }
    };

    initVoice();

    return () => {
      isMountedRef.current = false;
      try {
        Voice.removeAllListeners();
        Voice.destroy().catch(() => {});
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [onSpeechResults, onSpeechError, onSpeechEnd]);

  // Start/stop listening based on toggle
  useEffect(() => {
    const manageListening = async () => {
      if (microphoneEnabled && voiceAvailable && !isListening) {
        try {
          setSpokenText('');
          await Voice.start('en-US');
          setIsListening(true);
        } catch (error) {
          console.log('Failed to start voice:', error);
        }
      } else if (!microphoneEnabled && isListening) {
        try {
          await Voice.stop();
          setIsListening(false);
          setSpokenText('');
        } catch {
          // Ignore stop errors
        }
      }
    };

    manageListening();
  }, [microphoneEnabled, voiceAvailable, isListening]);

  const handleToggle = (value: boolean) => {
    setMicrophoneEnabled(value);
    if (!value) {
      setSpokenText('');
    }
  };

  const handleContinue = async () => {
    // Stop listening before navigating
    if (isListening) {
      try {
        await Voice.stop();
      } catch {
        // Ignore
      }
    }

    // Save settings
    try {
      const user = await getCurrentUser(database);
      if (user) {
        await updateQuizSettings(database, user.userId, {
          microphoneEnabled,
          autoSubmitOnSilence: microphoneEnabled,
        });
      }
    } catch (error) {
      console.error('Failed to save voice settings:', error);
    }

    navigation.navigate('TimerSettings');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.content}>
        {/* Title */}
        <Text variant="headlineMedium" style={[styles.title, { color: colors.text.primary }]}>
          Voice Interaction
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: colors.text.secondary }]}>
          Enable the microphone to speak your answers instead of typing
        </Text>

        {/* Toggle Card */}
        <Card style={[styles.settingCard, { backgroundColor: colors.surface.default }]}>
          <Card.Content>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Icon
                  name={microphoneEnabled ? 'microphone' : 'microphone-off'}
                  size={28}
                  color={microphoneEnabled ? colors.primary.main : colors.text.disabled}
                />
                <View style={styles.settingTextContainer}>
                  <Text variant="titleMedium" style={[styles.settingTitle, { color: colors.text.primary }]}>
                    Microphone
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                    {microphoneEnabled ? 'Speak to answer questions' : 'Type your answers manually'}
                  </Text>
                </View>
              </View>
              <Switch
                value={microphoneEnabled}
                onValueChange={handleToggle}
                color={colors.primary.main}
                testID="microphone-toggle"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Live Demo Area */}
        <View style={[styles.demoContainer, { backgroundColor: colors.surface.variant }]}>
          {microphoneEnabled ? (
            <>
              <View style={styles.demoHeader}>
                <Icon
                  name={isListening ? 'waveform' : 'microphone'}
                  size={24}
                  color={isListening ? colors.success.main : colors.primary.main}
                />
                <Text variant="labelLarge" style={{ color: colors.text.primary, marginLeft: spacing.sm }}>
                  {isListening ? 'Listening...' : 'Microphone Enabled'}
                </Text>
              </View>
              {spokenText ? (
                <Text variant="bodyLarge" style={[styles.spokenText, { color: colors.text.primary }]}>
                  "{spokenText}"
                </Text>
              ) : (
                <Text variant="bodyMedium" style={{ color: colors.text.tertiary, textAlign: 'center' }}>
                  Try saying something...
                </Text>
              )}
              {!voiceAvailable && (
                <Text variant="bodySmall" style={{ color: colors.warning.main, textAlign: 'center', marginTop: spacing.sm }}>
                  Voice recognition is not available on this device
                </Text>
              )}
            </>
          ) : (
            <View style={styles.disabledDemo}>
              <Icon name="microphone-off" size={32} color={colors.text.disabled} />
              <Text variant="bodyMedium" style={{ color: colors.text.tertiary, marginTop: spacing.sm }}>
                Microphone Disabled
              </Text>
              <Text variant="bodySmall" style={{ color: colors.text.tertiary, textAlign: 'center' }}>
                You'll type your answers during quizzes
              </Text>
            </View>
          )}
        </View>

        {/* CTA Button */}
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          testID="continue-button"
        >
          Continue
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  settingCard: {
    marginBottom: spacing.lg,
    ...elevation.level1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingTitle: {
    fontWeight: '600',
  },
  demoContainer: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing['2xl'],
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  spokenText: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
  disabledDemo: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
