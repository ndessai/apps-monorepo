import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, RadioButton, ActivityIndicator, Switch } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '@monorepo/ui-components';
import { useTheme } from '../../providers/ThemeProvider';
import { useSettings } from '../../providers/SettingsProvider';
import {
  QuizSettingsData,
  DEFAULT_QUIZ_SETTINGS,
  NAQTDifficulty,
  NAQT_DIFFICULTIES,
  NAQT_DIFFICULTY_LABELS,
  MIN_TIME_MS,
  MAX_TIME_MS,
  MIN_SILENCE_MS,
  MAX_SILENCE_MS,
  MIN_WPM,
  MAX_WPM,
  WPM_STEP,
  ThemeMode,
} from '../../types/settings';

export const QuizSetupTab: React.FC = () => {
  const { theme: currentTheme, setTheme: setAppTheme, colors: themeColors } = useTheme();
  const { settings: providerSettings, isLoading, updateSettings } = useSettings();

  // Local state for edits (not yet saved)
  const [localSettings, setLocalSettings] = useState<QuizSettingsData>(providerSettings);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state when provider localSettings change (e.g., on initial load)
  useEffect(() => {
    setLocalSettings(providerSettings);
  }, [providerSettings]);

  // Sync theme with app theme
  useEffect(() => {
    setLocalSettings((prev) => ({ ...prev, theme: currentTheme }));
  }, [currentTheme]);

  const hasChanges = () => {
    return (
      localSettings.buzzerTimeMs !== providerSettings.buzzerTimeMs ||
      localSettings.answerTimeMs !== providerSettings.answerTimeMs ||
      localSettings.tossupAnswerTimeMs !== providerSettings.tossupAnswerTimeMs ||
      localSettings.bonusAnswerTimeMs !== providerSettings.bonusAnswerTimeMs ||
      localSettings.tossupReviewTimeMs !== providerSettings.tossupReviewTimeMs ||
      localSettings.bonusReviewTimeMs !== providerSettings.bonusReviewTimeMs ||
      localSettings.readingSpeedWpm !== providerSettings.readingSpeedWpm ||
      localSettings.microphoneEnabled !== providerSettings.microphoneEnabled ||
      localSettings.autoSubmitOnSilence !== providerSettings.autoSubmitOnSilence ||
      localSettings.autoSubmitSilenceMs !== providerSettings.autoSubmitSilenceMs ||
      localSettings.audioActionsEnabled !== providerSettings.audioActionsEnabled ||
      localSettings.difficulty !== providerSettings.difficulty
    );
  };

  const formatSilenceTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const handleThemeChange = async (newTheme: ThemeMode) => {
    setLocalSettings((prev) => ({ ...prev, theme: newTheme }));
    await setAppTheme(newTheme);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSettings(localSettings);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving localSettings:', error);
      Alert.alert('Error', 'Failed to save localSettings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset to default localSettings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            setLocalSettings({ ...DEFAULT_QUIZ_SETTINGS, theme: currentTheme });
          },
        },
      ]
    );
  };

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background.default }]}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background.default }]}
      contentContainerStyle={styles.content}
    >
      {/* Theme Toggle */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface.default }]}>
        <Card.Content>
          <View style={styles.settingHeader}>
            <Icon
              name={localSettings.theme === 'dark' ? 'weather-night' : 'white-balance-sunny'}
              size={24}
              color={themeColors.primary.main}
            />
            <View style={styles.settingTitleContainer}>
              <Text variant="titleMedium" style={[styles.settingTitle, { color: themeColors.text.primary }]}>
                App Theme
              </Text>
              <Text variant="bodySmall" style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                Switch between light and dark mode
              </Text>
            </View>
          </View>
          <View style={styles.themeToggleContainer}>
            <View style={styles.themeOption}>
              <Icon
                name="white-balance-sunny"
                size={20}
                color={localSettings.theme === 'light' ? themeColors.primary.main : themeColors.text.disabled}
              />
              <Text
                style={[
                  styles.themeLabel,
                  { color: localSettings.theme === 'light' ? themeColors.primary.main : themeColors.text.secondary }
                ]}
              >
                Light
              </Text>
            </View>
            <Switch
              value={localSettings.theme === 'dark'}
              onValueChange={(isDark) => handleThemeChange(isDark ? 'dark' : 'light')}
              color={themeColors.primary.main}
              testID="theme-toggle"
            />
            <View style={styles.themeOption}>
              <Icon
                name="weather-night"
                size={20}
                color={localSettings.theme === 'dark' ? themeColors.primary.main : themeColors.text.disabled}
              />
              <Text
                style={[
                  styles.themeLabel,
                  { color: localSettings.theme === 'dark' ? themeColors.primary.main : themeColors.text.secondary }
                ]}
              >
                Dark
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Microphone Auto-Enable */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface.default }]}>
        <Card.Content>
          <View style={styles.settingHeader}>
            <Icon name="microphone" size={24} color={themeColors.primary.main} />
            <View style={styles.settingTitleContainer}>
              <Text variant="titleMedium" style={[styles.settingTitle, { color: themeColors.text.primary }]}>
                Auto-Enable Microphone
              </Text>
              <Text variant="bodySmall" style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                Automatically start listening when answering
              </Text>
            </View>
            <Switch
              value={localSettings.microphoneEnabled}
              onValueChange={(value) =>
                setLocalSettings((prev) => ({ ...prev, microphoneEnabled: value }))
              }
              color={themeColors.primary.main}
              testID="microphone-enabled-toggle"
            />
          </View>
        </Card.Content>
      </Card>

      {/* Auto-Submit on Silence */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface.default }]}>
        <Card.Content>
          <View style={styles.settingHeader}>
            <Icon name="microphone-off" size={24} color={themeColors.primary.main} />
            <View style={styles.settingTitleContainer}>
              <Text variant="titleMedium" style={[styles.settingTitle, { color: themeColors.text.primary }]}>
                Auto-Submit on Silence
              </Text>
              <Text variant="bodySmall" style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                Submit spoken answer after silence
              </Text>
            </View>
            <Switch
              value={localSettings.autoSubmitOnSilence}
              onValueChange={(value) =>
                setLocalSettings((prev) => ({ ...prev, autoSubmitOnSilence: value }))
              }
              color={themeColors.primary.main}
              testID="auto-submit-silence-toggle"
            />
          </View>

          {/* Silence Duration Slider - only show when auto-submit is enabled */}
          {localSettings.autoSubmitOnSilence && (
            <>
              <View style={[styles.settingHeader, { marginTop: spacing.md }]}>
                <View style={styles.settingTitleContainer}>
                  <Text variant="bodyMedium" style={{ color: themeColors.text.secondary }}>
                    Silence Duration
                  </Text>
                </View>
                <Text variant="titleMedium" style={[styles.settingValue, { color: themeColors.primary.main }]}>
                  {formatSilenceTime(localSettings.autoSubmitSilenceMs)}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={MIN_SILENCE_MS}
                maximumValue={MAX_SILENCE_MS}
                step={100}
                value={localSettings.autoSubmitSilenceMs}
                onValueChange={(value: number) =>
                  setLocalSettings((prev) => ({ ...prev, autoSubmitSilenceMs: value }))
                }
                minimumTrackTintColor={themeColors.primary.main}
                maximumTrackTintColor={themeColors.divider}
                thumbTintColor={themeColors.primary.main}
                testID="auto-submit-silence-slider"
              />
              <View style={styles.sliderLabels}>
                <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatSilenceTime(MIN_SILENCE_MS)}</Text>
                <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatSilenceTime(MAX_SILENCE_MS)}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Audio Actions (Hands-Free Mode) */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface.default }]}>
        <Card.Content>
          <View style={styles.settingHeader}>
            <Icon name="account-voice" size={24} color={themeColors.primary.main} />
            <View style={styles.settingTitleContainer}>
              <Text variant="titleMedium" style={[styles.settingTitle, { color: themeColors.text.primary }]}>
                Hands-Free Mode
              </Text>
              <Text variant="bodySmall" style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                Say "Buzz" to buzz in, speak answer to submit
              </Text>
            </View>
            <Switch
              value={localSettings.audioActionsEnabled}
              onValueChange={(value) =>
                setLocalSettings((prev) => ({ ...prev, audioActionsEnabled: value }))
              }
              color={themeColors.primary.main}
              testID="audio-actions-enabled-toggle"
            />
          </View>
          {localSettings.audioActionsEnabled && (
            <View style={[styles.handsFreeInfo, { backgroundColor: themeColors.background.default }]}>
              <Icon name="information-outline" size={16} color={themeColors.text.secondary} />
              <Text variant="bodySmall" style={[styles.handsFreeInfoText, { color: themeColors.text.secondary }]}>
                Microphone listens continuously. Say "Buzz" during tossup to buzz in.
                Your spoken answer will be auto-submitted after silence.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Buzzer Time */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface.default }]}>
        <Card.Content>
          <View style={styles.settingHeader}>
            <Icon name="timer" size={24} color={themeColors.primary.main} />
            <View style={styles.settingTitleContainer}>
              <Text variant="titleMedium" style={[styles.settingTitle, { color: themeColors.text.primary }]}>
                Buzzer Window
              </Text>
              <Text variant="bodySmall" style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                Time allowed to buzz after question ends
              </Text>
            </View>
            <Text variant="titleMedium" style={[styles.settingValue, { color: themeColors.primary.main }]}>
              {formatTime(localSettings.buzzerTimeMs)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={MIN_TIME_MS}
            maximumValue={MAX_TIME_MS}
            step={500}
            value={localSettings.buzzerTimeMs}
            onValueChange={(value: number) =>
              setLocalSettings((prev) => ({ ...prev, buzzerTimeMs: value }))
            }
            minimumTrackTintColor={themeColors.primary.main}
            maximumTrackTintColor={themeColors.divider}
            thumbTintColor={themeColors.primary.main}
            testID="buzzer-time-slider"
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatTime(MIN_TIME_MS)}</Text>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatTime(MAX_TIME_MS)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Answer Time */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface.default }]}>
        <Card.Content>
          <View style={styles.settingHeader}>
            <Icon name="clock-outline" size={24} color={themeColors.primary.main} />
            <View style={styles.settingTitleContainer}>
              <Text variant="titleMedium" style={[styles.settingTitle, { color: themeColors.text.primary }]}>
                Answer Time
              </Text>
              <Text variant="bodySmall" style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                Time allowed to answer after buzzing
              </Text>
            </View>
            <Text variant="titleMedium" style={[styles.settingValue, { color: themeColors.primary.main }]}>
              {formatTime(localSettings.answerTimeMs)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={MIN_TIME_MS}
            maximumValue={MAX_TIME_MS}
            step={500}
            value={localSettings.answerTimeMs}
            onValueChange={(value: number) =>
              setLocalSettings((prev) => ({ ...prev, answerTimeMs: value }))
            }
            minimumTrackTintColor={themeColors.primary.main}
            maximumTrackTintColor={themeColors.divider}
            thumbTintColor={themeColors.primary.main}
            testID="answer-time-slider"
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatTime(MIN_TIME_MS)}</Text>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatTime(MAX_TIME_MS)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Tossup Answer Time */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface.default }]}>
        <Card.Content>
          <View style={styles.settingHeader}>
            <Icon name="timer-sand" size={24} color={themeColors.primary.main} />
            <View style={styles.settingTitleContainer}>
              <Text variant="titleMedium" style={[styles.settingTitle, { color: themeColors.text.primary }]}>
                Tossup Answer Time
              </Text>
              <Text variant="bodySmall" style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                Time to answer tossup questions after buzzing
              </Text>
            </View>
            <Text variant="titleMedium" style={[styles.settingValue, { color: themeColors.primary.main }]}>
              {formatTime(localSettings.tossupAnswerTimeMs)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={MIN_TIME_MS}
            maximumValue={MAX_TIME_MS}
            step={500}
            value={localSettings.tossupAnswerTimeMs}
            onValueChange={(value: number) =>
              setLocalSettings((prev) => ({ ...prev, tossupAnswerTimeMs: value }))
            }
            minimumTrackTintColor={themeColors.primary.main}
            maximumTrackTintColor={themeColors.divider}
            thumbTintColor={themeColors.primary.main}
            testID="tossup-answer-time-slider"
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatTime(MIN_TIME_MS)}</Text>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatTime(MAX_TIME_MS)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Bonus Answer Time */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface.default }]}>
        <Card.Content>
          <View style={styles.settingHeader}>
            <Icon name="timer-sand-complete" size={24} color={themeColors.primary.main} />
            <View style={styles.settingTitleContainer}>
              <Text variant="titleMedium" style={[styles.settingTitle, { color: themeColors.text.primary }]}>
                Bonus Answer Time
              </Text>
              <Text variant="bodySmall" style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                Time to answer each bonus part
              </Text>
            </View>
            <Text variant="titleMedium" style={[styles.settingValue, { color: themeColors.primary.main }]}>
              {formatTime(localSettings.bonusAnswerTimeMs)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={MIN_TIME_MS}
            maximumValue={MAX_TIME_MS}
            step={500}
            value={localSettings.bonusAnswerTimeMs}
            onValueChange={(value: number) =>
              setLocalSettings((prev) => ({ ...prev, bonusAnswerTimeMs: value }))
            }
            minimumTrackTintColor={themeColors.primary.main}
            maximumTrackTintColor={themeColors.divider}
            thumbTintColor={themeColors.primary.main}
            testID="bonus-answer-time-slider"
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatTime(MIN_TIME_MS)}</Text>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatTime(MAX_TIME_MS)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Tossup Review Time */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface.default }]}>
        <Card.Content>
          <View style={styles.settingHeader}>
            <Icon name="eye-check" size={24} color={themeColors.primary.main} />
            <View style={styles.settingTitleContainer}>
              <Text variant="titleMedium" style={[styles.settingTitle, { color: themeColors.text.primary }]}>
                Tossup Review Time
              </Text>
              <Text variant="bodySmall" style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                Time to review answer after tossup submission
              </Text>
            </View>
            <Text variant="titleMedium" style={[styles.settingValue, { color: themeColors.primary.main }]}>
              {formatTime(localSettings.tossupReviewTimeMs)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={MIN_TIME_MS}
            maximumValue={MAX_TIME_MS}
            step={500}
            value={localSettings.tossupReviewTimeMs}
            onValueChange={(value: number) =>
              setLocalSettings((prev) => ({ ...prev, tossupReviewTimeMs: value }))
            }
            minimumTrackTintColor={themeColors.primary.main}
            maximumTrackTintColor={themeColors.divider}
            thumbTintColor={themeColors.primary.main}
            testID="tossup-review-time-slider"
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatTime(MIN_TIME_MS)}</Text>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatTime(MAX_TIME_MS)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Bonus Review Time */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface.default }]}>
        <Card.Content>
          <View style={styles.settingHeader}>
            <Icon name="eye-check-outline" size={24} color={themeColors.primary.main} />
            <View style={styles.settingTitleContainer}>
              <Text variant="titleMedium" style={[styles.settingTitle, { color: themeColors.text.primary }]}>
                Bonus Review Time
              </Text>
              <Text variant="bodySmall" style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                Time to review answer after each bonus part
              </Text>
            </View>
            <Text variant="titleMedium" style={[styles.settingValue, { color: themeColors.primary.main }]}>
              {formatTime(localSettings.bonusReviewTimeMs)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={MIN_TIME_MS}
            maximumValue={MAX_TIME_MS}
            step={500}
            value={localSettings.bonusReviewTimeMs}
            onValueChange={(value: number) =>
              setLocalSettings((prev) => ({ ...prev, bonusReviewTimeMs: value }))
            }
            minimumTrackTintColor={themeColors.primary.main}
            maximumTrackTintColor={themeColors.divider}
            thumbTintColor={themeColors.primary.main}
            testID="bonus-review-time-slider"
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatTime(MIN_TIME_MS)}</Text>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{formatTime(MAX_TIME_MS)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Reading Speed (WPM) */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface.default }]}>
        <Card.Content>
          <View style={styles.settingHeader}>
            <Icon name="text-to-speech" size={24} color={themeColors.primary.main} />
            <View style={styles.settingTitleContainer}>
              <Text variant="titleMedium" style={[styles.settingTitle, { color: themeColors.text.primary }]}>
                Reading Speed
              </Text>
              <Text variant="bodySmall" style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                Words per minute for question reading (NAQT standard: 150)
              </Text>
            </View>
            <Text variant="titleMedium" style={[styles.settingValue, { color: themeColors.primary.main }]}>
              {localSettings.readingSpeedWpm} WPM
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={MIN_WPM}
            maximumValue={MAX_WPM}
            step={WPM_STEP}
            value={localSettings.readingSpeedWpm}
            onValueChange={(value: number) =>
              setLocalSettings((prev) => ({ ...prev, readingSpeedWpm: value }))
            }
            minimumTrackTintColor={themeColors.primary.main}
            maximumTrackTintColor={themeColors.divider}
            thumbTintColor={themeColors.primary.main}
            testID="reading-speed-slider"
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{MIN_WPM} WPM</Text>
            <Text style={[styles.sliderLabel, { color: themeColors.text.secondary }]}>{MAX_WPM} WPM</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Difficulty */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface.default }]}>
        <Card.Content>
          <View style={styles.settingHeader}>
            <Icon name="school" size={24} color={themeColors.primary.main} />
            <View style={styles.settingTitleContainer}>
              <Text variant="titleMedium" style={[styles.settingTitle, { color: themeColors.text.primary }]}>
                Difficulty Level
              </Text>
              <Text variant="bodySmall" style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                NAQT competition level for questions
              </Text>
            </View>
          </View>
          <RadioButton.Group
            onValueChange={(value) => {
              setLocalSettings((prev) => ({ ...prev, difficulty: value as NAQTDifficulty }));
            }}
            value={localSettings.difficulty}
          >
            {NAQT_DIFFICULTIES.map((difficulty) => (
              <RadioButton.Item
                key={difficulty}
                label={NAQT_DIFFICULTY_LABELS[difficulty]}
                value={difficulty}
                style={styles.radioItem}
                labelStyle={[styles.radioLabel, { color: themeColors.text.primary }]}
                testID={`difficulty-${difficulty}`}
              />
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={handleReset}
          style={styles.resetButton}
          testID="reset-localSettings-button"
        >
          Reset to Defaults
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={isSaving}
          disabled={!hasChanges() || isSaving}
          style={styles.saveButton}
          testID="save-localSettings-button"
        >
          Save Settings
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: spacing.md,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  settingTitleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingTitle: {
    fontWeight: '600',
  },
  settingDescription: {
    marginTop: 2,
  },
  settingValue: {
    fontWeight: '600',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  themeLabel: {
    marginLeft: spacing.xs,
    fontSize: 14,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  sliderLabel: {
    fontSize: 12,
  },
  radioItem: {
    paddingVertical: spacing.xs,
  },
  radioLabel: {},
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  resetButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  handsFreeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  handsFreeInfoText: {
    flex: 1,
    marginLeft: spacing.xs,
    lineHeight: 18,
  },
});
