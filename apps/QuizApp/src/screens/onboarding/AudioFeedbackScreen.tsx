/**
 * AudioFeedbackScreen
 *
 * Onboarding screen for audio settings (Audio Support)
 * Appears after ThemeSelection and before VoiceSettings
 * Allows user to configure TTS reading and audio feedback options
 */

import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, Switch, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, radius, elevation } from '@monorepo/ui-components';
import { useTheme } from '../../providers/ThemeProvider';
import { useSettings } from '../../providers/SettingsProvider';
import { DEFAULT_QUIZ_SETTINGS } from '../../types/settings';
import type { AudioFeedbackTone } from '../../types/settings';
import type { OnboardingStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AudioFeedback'>;

export const AudioFeedbackScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { updateSettings } = useSettings();
  const insets = useSafeAreaInsets();

  const [readQuestions, setReadQuestions] = useState(DEFAULT_QUIZ_SETTINGS.readQuestions);
  const [provideAudioFeedback, setProvideAudioFeedback] = useState(DEFAULT_QUIZ_SETTINGS.provideAudioFeedback);
  const [audioFeedbackTone, setAudioFeedbackTone] = useState<AudioFeedbackTone>(DEFAULT_QUIZ_SETTINGS.audioFeedbackTone);

  const handleContinue = async () => {
    // Save settings via SettingsProvider
    try {
      await updateSettings({
        readQuestions,
        provideAudioFeedback,
        audioFeedbackTone,
      });
    } catch (error) {
      console.error('Failed to save audio feedback settings:', error);
    }

    navigation.navigate('VoiceSettings');
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
          { paddingTop: insets.top + spacing['2xl'] }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text variant="headlineMedium" style={[styles.title, { color: colors.text.primary }]}>
          Talk to me!
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: colors.text.secondary }]}>
          Customize how app talks to you.
        </Text>

        {/* Read Questions Card */}
        <Card style={[styles.settingCard, { backgroundColor: colors.surface.default }]}>
          <Card.Content>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Icon
                  name="volume-high"
                  size={28}
                  color={readQuestions ? colors.primary.main : colors.text.disabled}
                />
                <View style={styles.settingTextContainer}>
                  <Text variant="titleMedium" style={[styles.settingTitle, { color: colors.text.primary }]}>
                    Read Questions Aloud
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                    Questions will be read via text-to-speech
                  </Text>
                </View>
              </View>
              <Switch
                value={readQuestions}
                onValueChange={setReadQuestions}
                color={colors.primary.main}
                testID="read-questions-toggle"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Audio Feedback Toggle Card */}
        <Card style={[styles.settingCard, { backgroundColor: colors.surface.default }]}>
          <Card.Content>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Icon
                  name="message-text-outline"
                  size={28}
                  color={provideAudioFeedback ? colors.primary.main : colors.text.disabled}
                />
                <View style={styles.settingTextContainer}>
                  <Text variant="titleMedium" style={[styles.settingTitle, { color: colors.text.primary }]}>
                    Audio Feedback
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                    Get spoken commentary on your answers
                  </Text>
                </View>
              </View>
              <Switch
                value={provideAudioFeedback}
                onValueChange={setProvideAudioFeedback}
                color={colors.primary.main}
                testID="audio-feedback-toggle"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Feedback Tone Selection - Only show when audio feedback is enabled */}
        {provideAudioFeedback && (
          <Card style={[styles.settingCard, { backgroundColor: colors.surface.default }]}>
            <Card.Content>
              {/* Header with Beta Badge */}
              <View style={styles.toneHeader}>
                <View style={styles.toneHeaderLeft}>
                  <Icon
                    name="emoticon-outline"
                    size={24}
                    color={colors.primary.main}
                  />
                  <Text variant="titleMedium" style={[styles.settingTitle, { color: colors.text.primary, marginLeft: spacing.md }]}>
                    Feedback Tone
                  </Text>
                </View>
                <View style={[styles.betaBadge, { backgroundColor: colors.warning.container }]}>
                  <Text variant="labelSmall" style={[styles.betaText, { color: colors.warning.onContainer }]}>
                    BETA
                  </Text>
                </View>
              </View>

              {/* Tone Options */}
              <View style={styles.toneOptions}>
                {/* Positive Option */}
                <TouchableOpacity
                  style={[
                    styles.toneOption,
                    { backgroundColor: colors.surface.variant },
                    audioFeedbackTone === 'Positive' && [
                      styles.toneOptionSelected,
                      { borderColor: colors.primary.main, backgroundColor: colors.primary.container }
                    ],
                  ]}
                  onPress={() => setAudioFeedbackTone('Positive')}
                  testID="tone-positive"
                >
                  <Text style={styles.toneEmoji}>😊</Text>
                  <Text
                    variant="titleSmall"
                    style={[
                      styles.toneLabel,
                      { color: audioFeedbackTone === 'Positive' ? colors.primary.main : colors.text.primary }
                    ]}
                  >
                    Positive
                  </Text>
                  {audioFeedbackTone === 'Positive' && (
                    <Icon name="check-circle" size={18} color={colors.primary.main} style={styles.toneCheck} />
                  )}
                </TouchableOpacity>

                {/* Sarcastic Option */}
                <TouchableOpacity
                  style={[
                    styles.toneOption,
                    { backgroundColor: colors.surface.variant },
                    audioFeedbackTone === 'Sarcastic' && [
                      styles.toneOptionSelected,
                      { borderColor: colors.primary.main, backgroundColor: colors.primary.container }
                    ],
                  ]}
                  onPress={() => setAudioFeedbackTone('Sarcastic')}
                  testID="tone-sarcastic"
                >
                  <Text style={styles.toneEmoji}>😏</Text>
                  <Text
                    variant="titleSmall"
                    style={[
                      styles.toneLabel,
                      { color: audioFeedbackTone === 'Sarcastic' ? colors.primary.main : colors.text.primary }
                    ]}
                  >
                    Sarcastic
                  </Text>
                  {audioFeedbackTone === 'Sarcastic' && (
                    <Icon name="check-circle" size={18} color={colors.primary.main} style={styles.toneCheck} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Tone Description */}
              <Text variant="bodySmall" style={[styles.toneDescription, { color: colors.text.tertiary }]}>
                {audioFeedbackTone === 'Positive'
                  ? '"Great job! You earned 15 points!"'
                  : '"Oh wow, you actually got it right. 15 points for you."'
                }
              </Text>
            </Card.Content>
          </Card>
        )}
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
  toneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  toneHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  betaBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
  },
  betaText: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  toneOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  toneOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toneOptionSelected: {
    borderWidth: 2,
  },
  toneEmoji: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  toneLabel: {
    fontWeight: '600',
  },
  toneCheck: {
    marginLeft: spacing.xs,
  },
  toneDescription: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.md,
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
