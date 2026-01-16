/**
 * VoiceSettingsScreen
 *
 * Third screen of the onboarding wizard
 * Allows user to enable/disable voice interaction with live demo
 * Uses nativeVoiceService directly for voice recognition
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, Switch, Card } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, radius, elevation } from '@monorepo/ui-components';
import { useTheme } from '../../providers/ThemeProvider';
import { useSettings } from '../../providers/SettingsProvider';
import * as voiceService from '../../services/nativeVoiceService';
import { DEFAULT_QUIZ_SETTINGS, MIN_SILENCE_MS, MAX_SILENCE_MS } from '../../types/settings';
import type { OnboardingStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'VoiceSettings'>;

export const VoiceSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { updateSettings } = useSettings();
  const insets = useSafeAreaInsets();

  // Voice state - managed locally
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Default to OFF - user must explicitly enable
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [autoSubmitOnSilence, setAutoSubmitOnSilence] = useState(true);
  const [autoSubmitSilenceMs, setAutoSubmitSilenceMs] = useState(DEFAULT_QUIZ_SETTINGS.autoSubmitSilenceMs);
  const [audioActionsEnabled, setAudioActionsEnabled] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const isMountedRef = useRef(true);

  const formatSilenceTime = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

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
      }
    };

    initVoice();

    return () => {
      isMountedRef.current = false;
      voiceService.stopListening();
    };
  }, []);

  // Start/stop listening based on toggle
  useEffect(() => {
    const manageListening = async () => {
      if (microphoneEnabled && isAvailable && !isListening) {
        setSpokenText('');
        const success = await voiceService.startListening(
          {
            continuous: true,
            filterTTSEcho: false,
            language: 'en-US',
          },
          {
            onStart: () => {
              if (isMountedRef.current) setIsListening(true);
            },
            onEnd: () => {
              // Don't set isListening false in continuous mode
            },
            onResult: (text) => {
              if (isMountedRef.current) {
                setSpokenText(text);
              }
            },
            onPartialResult: (text) => {
              if (isMountedRef.current) {
                setSpokenText(text);
              }
            },
            onError: (error) => {
              console.log('[VoiceSettingsScreen] Voice error:', error);
              if (isMountedRef.current) setIsListening(false);
            },
          }
        );
        if (success && isMountedRef.current) {
          setIsListening(true);
        }
      } else if (!microphoneEnabled && isListening) {
        await voiceService.stopListening();
        if (isMountedRef.current) {
          setIsListening(false);
          setSpokenText('');
        }
      }
    };

    manageListening();
  }, [microphoneEnabled, isAvailable, isListening]);

  const handleToggle = async (value: boolean) => {
    if (value) {
      // Request permission when enabling microphone
      const granted = await voiceService.requestPermission();
      if (!granted) {
        // Permission denied, don't enable
        return;
      }
      if (isMountedRef.current) {
        setIsAvailable(true);
      }
    } else {
      setSpokenText('');
    }
    setMicrophoneEnabled(value);
  };

  const handleContinue = async () => {
    // Stop listening before navigating
    if (isListening) {
      await voiceService.stopListening();
      if (isMountedRef.current) {
        setIsListening(false);
      }
    }

    // Save settings via SettingsProvider
    try {
      await updateSettings({
        microphoneEnabled,
        autoSubmitOnSilence: microphoneEnabled && autoSubmitOnSilence,
        autoSubmitSilenceMs,
        audioActionsEnabled: microphoneEnabled && audioActionsEnabled,
      });
    } catch (error) {
      console.error('Failed to save voice settings:', error);
    }

    navigation.navigate('TimerSettings');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + spacing.sm }]}
        onPress={() => navigation.goBack()}
        testID="back-button"
      >
        <Icon name="arrow-left" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text variant="headlineMedium" style={[styles.title, { color: colors.text.primary }]}>
          Listen to me!
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: colors.text.secondary }]}>
          Customize how the app listens to your voice commands.
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
                    Enable Microphone
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                    {microphoneEnabled ? 'Voice input is enabled' : 'Turn on to use voice answers'}
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

        {/* Auto-Submit Settings - only show when microphone is enabled */}
        {microphoneEnabled && (
          <Card style={[styles.settingCard, { backgroundColor: colors.surface.default }]}>
            <Card.Content>
              {/* Auto-Submit Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Icon
                    name="timer-sand"
                    size={24}
                    color={autoSubmitOnSilence ? colors.primary.main : colors.text.disabled}
                  />
                  <View style={styles.settingTextContainer}>
                    <Text variant="titleMedium" style={[styles.settingTitle, { color: colors.text.primary }]}>
                      Auto-Submit on Silence
                    </Text>
                    <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                      Automatically submit your answer after you stop speaking
                    </Text>
                  </View>
                </View>
                <Switch
                  value={autoSubmitOnSilence}
                  onValueChange={setAutoSubmitOnSilence}
                  color={colors.primary.main}
                  testID="auto-submit-toggle"
                />
              </View>

              {/* Silence Duration Slider - only show when auto-submit is enabled */}
              {autoSubmitOnSilence && (
                <View style={styles.sliderSection}>
                  <View style={styles.sliderHeader}>
                    <Text variant="bodyMedium" style={{ color: colors.text.secondary }}>
                      Silence Duration
                    </Text>
                    <Text variant="titleMedium" style={{ color: colors.primary.main, fontWeight: '600' }}>
                      {formatSilenceTime(autoSubmitSilenceMs)}
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={MIN_SILENCE_MS}
                    maximumValue={MAX_SILENCE_MS}
                    step={100}
                    value={autoSubmitSilenceMs}
                    onValueChange={setAutoSubmitSilenceMs}
                    minimumTrackTintColor={colors.primary.main}
                    maximumTrackTintColor={colors.divider}
                    thumbTintColor={colors.primary.main}
                    testID="silence-duration-slider"
                  />
                  <View style={styles.sliderLabels}>
                    <Text variant="labelSmall" style={{ color: colors.text.tertiary }}>
                      {formatSilenceTime(MIN_SILENCE_MS)}
                    </Text>
                    <Text variant="labelSmall" style={{ color: colors.text.tertiary }}>
                      {formatSilenceTime(MAX_SILENCE_MS)}
                    </Text>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Hands-Free Mode Card - only show when microphone is enabled */}
        {microphoneEnabled && (
          <Card style={[styles.settingCard, { backgroundColor: colors.surface.default }]}>
            <Card.Content>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Icon
                    name="hand-wave"
                    size={24}
                    color={audioActionsEnabled ? colors.primary.main : colors.text.disabled}
                  />
                  <View style={styles.settingTextContainer}>
                    <Text variant="titleMedium" style={[styles.settingTitle, { color: colors.text.primary }]}>
                      Hands-Free Mode
                    </Text>
                    <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                      Say "Buzz" on toss-up and "Pause" or "Stop" on other questions to interrupt questions and answer by voice
                    </Text>
                  </View>
                </View>
                <Switch
                  value={audioActionsEnabled}
                  onValueChange={setAudioActionsEnabled}
                  color={colors.primary.main}
                  testID="hands-free-toggle"
                />
              </View>
            </Card.Content>
          </Card>
        )}

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
              {!isAvailable && (
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
      </ScrollView>

      {/* CTA Button - Anchored at bottom */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
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
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
    padding: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
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
  sliderSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  demoContainer: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    minHeight: 80,
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
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: 'transparent',
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
