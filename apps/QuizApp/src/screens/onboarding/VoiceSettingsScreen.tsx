/**
 * VoiceSettingsScreen
 *
 * Third screen of the onboarding wizard
 * Allows user to enable/disable voice interaction with live demo
 * Uses VoiceProvider for unified voice recognition
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, Switch, Card } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, radius, elevation } from '@monorepo/ui-components';
import { useTheme } from '../../providers/ThemeProvider';
import { useSettings } from '../../providers/SettingsProvider';
import { useVoice } from '../../providers/VoiceProvider';
import { DEFAULT_QUIZ_SETTINGS, MIN_SILENCE_MS, MAX_SILENCE_MS } from '../../types/settings';
import type { OnboardingStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'VoiceSettings'>;

export const VoiceSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { updateSettings } = useSettings();
  const { isListening, isAvailable, startListening, stopListening, lastResult } = useVoice();
  const insets = useSafeAreaInsets();

  // Default to OFF - user must explicitly enable
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [autoSubmitOnSilence, setAutoSubmitOnSilence] = useState(true);
  const [autoSubmitSilenceMs, setAutoSubmitSilenceMs] = useState(DEFAULT_QUIZ_SETTINGS.autoSubmitSilenceMs);
  const [audioActionsEnabled, setAudioActionsEnabled] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const isMountedRef = useRef(true);

  const formatSilenceTime = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

  // Update spoken text when voice result changes
  useEffect(() => {
    if (lastResult && isMountedRef.current) {
      setSpokenText(lastResult);
    }
  }, [lastResult]);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Start/stop listening based on toggle
  useEffect(() => {
    const manageListening = async () => {
      if (microphoneEnabled && isAvailable && !isListening) {
        setSpokenText('');
        await startListening({
          continuous: true,
          filterTTS: false,
          onResult: (text) => {
            if (isMountedRef.current) {
              setSpokenText(text);
            }
          },
        });
      } else if (!microphoneEnabled && isListening) {
        await stopListening();
        setSpokenText('');
      }
    };

    manageListening();
  }, [microphoneEnabled, isAvailable, isListening, startListening, stopListening]);

  const handleToggle = (value: boolean) => {
    setMicrophoneEnabled(value);
    if (!value) {
      setSpokenText('');
    }
  };

  const handleContinue = async () => {
    // Stop listening before navigating
    if (isListening) {
      await stopListening();
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
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text variant="headlineMedium" style={[styles.title, { color: colors.text.primary }]}>
          Voice Interaction
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: colors.text.secondary }]}>
          Answer questions hands-free by speaking
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
                      Say "Buzz" to interrupt questions and answer by voice
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
