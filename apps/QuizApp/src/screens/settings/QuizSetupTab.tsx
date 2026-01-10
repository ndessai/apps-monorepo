import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, RadioButton, ActivityIndicator, Switch } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '@monorepo/ui-components';
import { useDatabase } from '../../providers/DatabaseProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { getCurrentUser } from '../../services/userService';
import { getQuizSettings, updateQuizSettings } from '../../services/quizSettingsService';
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
  ThemeMode,
} from '../../types/settings';

export const QuizSetupTab: React.FC = () => {
  const database = useDatabase();
  const { theme: currentTheme, setTheme: setAppTheme, colors: themeColors } = useTheme();
  const [settings, setSettings] = useState<QuizSettingsData>(DEFAULT_QUIZ_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<QuizSettingsData>(DEFAULT_QUIZ_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  // Sync theme with app theme
  useEffect(() => {
    setSettings((prev) => ({ ...prev, theme: currentTheme }));
  }, [currentTheme]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser(database);

      if (user) {
        setUserId(user.userId);
        const userSettings = await getQuizSettings(database, user.userId);
        setSettings(userSettings);
        setOriginalSettings(userSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      settings.buzzerTimeMs !== originalSettings.buzzerTimeMs ||
      settings.answerTimeMs !== originalSettings.answerTimeMs ||
      settings.tossupAnswerTimeMs !== originalSettings.tossupAnswerTimeMs ||
      settings.bonusAnswerTimeMs !== originalSettings.bonusAnswerTimeMs ||
      settings.microphoneEnabled !== originalSettings.microphoneEnabled ||
      settings.autoSubmitOnSilence !== originalSettings.autoSubmitOnSilence ||
      settings.autoSubmitSilenceMs !== originalSettings.autoSubmitSilenceMs ||
      settings.difficulty !== originalSettings.difficulty
    );
  };

  const formatSilenceTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const handleThemeChange = async (newTheme: ThemeMode) => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    await setAppTheme(newTheme);
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      setIsSaving(true);
      await updateQuizSettings(database, userId, settings);
      setOriginalSettings(settings);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset to default settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            setSettings({ ...DEFAULT_QUIZ_SETTINGS, theme: currentTheme });
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
              name={settings.theme === 'dark' ? 'weather-night' : 'white-balance-sunny'}
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
                color={settings.theme === 'light' ? themeColors.primary.main : themeColors.text.disabled}
              />
              <Text
                style={[
                  styles.themeLabel,
                  { color: settings.theme === 'light' ? themeColors.primary.main : themeColors.text.secondary }
                ]}
              >
                Light
              </Text>
            </View>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={(isDark) => handleThemeChange(isDark ? 'dark' : 'light')}
              color={themeColors.primary.main}
              testID="theme-toggle"
            />
            <View style={styles.themeOption}>
              <Icon
                name="weather-night"
                size={20}
                color={settings.theme === 'dark' ? themeColors.primary.main : themeColors.text.disabled}
              />
              <Text
                style={[
                  styles.themeLabel,
                  { color: settings.theme === 'dark' ? themeColors.primary.main : themeColors.text.secondary }
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
              value={settings.microphoneEnabled}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, microphoneEnabled: value }))
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
              value={settings.autoSubmitOnSilence}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, autoSubmitOnSilence: value }))
              }
              color={themeColors.primary.main}
              testID="auto-submit-silence-toggle"
            />
          </View>

          {/* Silence Duration Slider - only show when auto-submit is enabled */}
          {settings.autoSubmitOnSilence && (
            <>
              <View style={[styles.settingHeader, { marginTop: spacing.md }]}>
                <View style={styles.settingTitleContainer}>
                  <Text variant="bodyMedium" style={{ color: themeColors.text.secondary }}>
                    Silence Duration
                  </Text>
                </View>
                <Text variant="titleMedium" style={[styles.settingValue, { color: themeColors.primary.main }]}>
                  {formatSilenceTime(settings.autoSubmitSilenceMs)}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={MIN_SILENCE_MS}
                maximumValue={MAX_SILENCE_MS}
                step={100}
                value={settings.autoSubmitSilenceMs}
                onValueChange={(value: number) =>
                  setSettings((prev) => ({ ...prev, autoSubmitSilenceMs: value }))
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
              {formatTime(settings.buzzerTimeMs)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={MIN_TIME_MS}
            maximumValue={MAX_TIME_MS}
            step={500}
            value={settings.buzzerTimeMs}
            onValueChange={(value: number) =>
              setSettings((prev) => ({ ...prev, buzzerTimeMs: value }))
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
              {formatTime(settings.answerTimeMs)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={MIN_TIME_MS}
            maximumValue={MAX_TIME_MS}
            step={500}
            value={settings.answerTimeMs}
            onValueChange={(value: number) =>
              setSettings((prev) => ({ ...prev, answerTimeMs: value }))
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
              {formatTime(settings.tossupAnswerTimeMs)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={MIN_TIME_MS}
            maximumValue={MAX_TIME_MS}
            step={500}
            value={settings.tossupAnswerTimeMs}
            onValueChange={(value: number) =>
              setSettings((prev) => ({ ...prev, tossupAnswerTimeMs: value }))
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
              {formatTime(settings.bonusAnswerTimeMs)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={MIN_TIME_MS}
            maximumValue={MAX_TIME_MS}
            step={500}
            value={settings.bonusAnswerTimeMs}
            onValueChange={(value: number) =>
              setSettings((prev) => ({ ...prev, bonusAnswerTimeMs: value }))
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
            onValueChange={(value) =>
              setSettings((prev) => ({ ...prev, difficulty: value as NAQTDifficulty }))
            }
            value={settings.difficulty}
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
          testID="reset-settings-button"
        >
          Reset to Defaults
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={isSaving}
          disabled={!hasChanges() || isSaving}
          style={styles.saveButton}
          testID="save-settings-button"
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
});
