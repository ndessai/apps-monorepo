/**
 * TimerSettingsScreen
 *
 * Fourth screen of the onboarding wizard
 * Allows user to customize countdown timers
 */

import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, Card } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, elevation } from '@monorepo/ui-components';
import { useTheme } from '../../providers/ThemeProvider';
import { useSettings } from '../../providers/SettingsProvider';
import { DEFAULT_QUIZ_SETTINGS } from '../../types/settings';
import type { OnboardingStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'TimerSettings'>;

interface TimerSetting {
  key: 'buzzerTimeMs' | 'tossupAnswerTimeMs' | 'bonusAnswerTimeMs';
  icon: string;
  title: string;
  description: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

const TIMER_SETTINGS: TimerSetting[] = [
  {
    key: 'buzzerTimeMs',
    icon: 'timer-alert',
    title: 'Buzzer Time',
    description: 'Time to buzz in after question finishes',
    min: 1000,
    max: 10000,
    step: 1000,
    defaultValue: DEFAULT_QUIZ_SETTINGS.buzzerTimeMs,
  },
  {
    key: 'tossupAnswerTimeMs',
    icon: 'clock-fast',
    title: 'Tossup Answer Time',
    description: 'Time to answer after buzzing',
    min: 1000,
    max: 10000,
    step: 1000,
    defaultValue: DEFAULT_QUIZ_SETTINGS.tossupAnswerTimeMs,
  },
  {
    key: 'bonusAnswerTimeMs',
    icon: 'clock-outline',
    title: 'Bonus Answer Time',
    description: 'Time to answer each bonus part',
    min: 1000,
    max: 10000,
    step: 1000,
    defaultValue: DEFAULT_QUIZ_SETTINGS.bonusAnswerTimeMs,
  },
];

export const TimerSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { settings, updateSettings } = useSettings();
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<Record<string, number>>({
    buzzerTimeMs: settings.buzzerTimeMs,
    tossupAnswerTimeMs: settings.tossupAnswerTimeMs,
    bonusAnswerTimeMs: settings.bonusAnswerTimeMs,
  });

  const handleValueChange = (key: string, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinue = async () => {
    // Only save settings that differ from defaults
    const changedSettings: Partial<Record<string, number>> = {};
    for (const setting of TIMER_SETTINGS) {
      if (values[setting.key] !== setting.defaultValue) {
        changedSettings[setting.key] = values[setting.key];
      }
    }

    if (Object.keys(changedSettings).length > 0) {
      try {
        await updateSettings(changedSettings);
      } catch (error) {
        console.error('Failed to save timer settings:', error);
      }
    }

    navigation.navigate('SampleQuizIntro');
  };

  const formatTime = (ms: number): string => {
    return `${(ms / 1000).toFixed(0)}s`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xl }]}>
        {/* Title */}
        <Text variant="headlineMedium" style={[styles.title, { color: colors.text.primary }]}>
          Customize Timers
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: colors.text.secondary }]}>
          Adjust the countdown timers to match your pace
        </Text>

        {/* Timer Cards */}
        {TIMER_SETTINGS.map((setting) => (
          <Card
            key={setting.key}
            style={[styles.settingCard, { backgroundColor: colors.surface.default }]}
          >
            <Card.Content>
              <View style={styles.settingHeader}>
                <Icon name={setting.icon} size={24} color={colors.primary.main} />
                <View style={styles.settingTextContainer}>
                  <Text variant="titleMedium" style={[styles.settingTitle, { color: colors.text.primary }]}>
                    {setting.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                    {setting.description}
                  </Text>
                </View>
                <View style={[styles.valueContainer, { backgroundColor: colors.primary.container }]}>
                  <Text variant="titleMedium" style={[styles.valueText, { color: colors.primary.onContainer }]}>
                    {formatTime(values[setting.key])}
                  </Text>
                </View>
              </View>

              <View style={styles.sliderContainer}>
                <Text variant="labelSmall" style={{ color: colors.text.tertiary }}>
                  {formatTime(setting.min)}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={setting.min}
                  maximumValue={setting.max}
                  step={setting.step}
                  value={values[setting.key]}
                  onValueChange={(value) => handleValueChange(setting.key, value)}
                  minimumTrackTintColor={colors.primary.main}
                  maximumTrackTintColor={colors.divider}
                  thumbTintColor={colors.primary.main}
                />
                <Text variant="labelSmall" style={{ color: colors.text.tertiary }}>
                  {formatTime(setting.max)}
                </Text>
              </View>

              {values[setting.key] !== setting.defaultValue && (
                <Text variant="labelSmall" style={[styles.defaultLabel, { color: colors.text.tertiary }]}>
                  Default: {formatTime(setting.defaultValue)}
                </Text>
              )}
            </Card.Content>
          </Card>
        ))}

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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
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
    marginBottom: spacing.md,
    ...elevation.level1,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingTitle: {
    fontWeight: '600',
  },
  valueContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  valueText: {
    fontWeight: 'bold',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  defaultLabel: {
    textAlign: 'right',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  button: {
    marginTop: spacing.lg,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
