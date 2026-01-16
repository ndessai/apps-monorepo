/**
 * DifficultySettingsScreen
 *
 * Fifth screen of the onboarding wizard (last before sample quiz)
 * Allows user to select their preferred difficulty level
 */

import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, radius, elevation } from '@monorepo/ui-components';
import { useTheme } from '../../providers/ThemeProvider';
import { useSettings } from '../../providers/SettingsProvider';
import {
  NAQT_DIFFICULTIES,
  NAQT_DIFFICULTY_LABELS,
  DEFAULT_QUIZ_SETTINGS,
} from '../../types/settings';
import type { OnboardingStackParamList } from '../../types/navigation';
import type { NAQTDifficulty } from '../../types/settings';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DifficultySettings'>;

// Difficulty level details for display
const DIFFICULTY_DETAILS: Record<NAQTDifficulty, { icon: string; description: string }> = {
  middle_school: {
    icon: 'school-outline',
    description: 'Introductory questions suitable for middle school students',
  },
  jv_high_school: {
    icon: 'school',
    description: 'Junior varsity level for developing high school players',
  },
  varsity: {
    icon: 'trophy-outline',
    description: 'Standard high school competition difficulty',
  },
  college: {
    icon: 'account-school',
    description: 'College-level questions for advanced players',
  },
  open: {
    icon: 'trophy',
    description: 'Expert level for experienced tournament players',
  },
};

export const DifficultySettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { settings, updateSettings } = useSettings();
  const insets = useSafeAreaInsets();

  const [selectedDifficulty, setSelectedDifficulty] = useState<NAQTDifficulty>(
    settings.difficulty || DEFAULT_QUIZ_SETTINGS.difficulty
  );

  const handleContinue = async () => {
    try {
      await updateSettings({ difficulty: selectedDifficulty });
    } catch (error) {
      console.error('Failed to save difficulty setting:', error);
    }

    navigation.navigate('SampleQuizIntro');
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
          Choose Difficulty
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: colors.text.secondary }]}>
          Select the level that matches your experience
        </Text>

        {/* Difficulty Options */}
        <View style={styles.optionsContainer}>
          {NAQT_DIFFICULTIES.map((difficulty) => {
            const isSelected = selectedDifficulty === difficulty;
            const details = DIFFICULTY_DETAILS[difficulty];

            return (
              <TouchableOpacity
                key={difficulty}
                onPress={() => setSelectedDifficulty(difficulty)}
                activeOpacity={0.7}
                testID={`difficulty-${difficulty}`}
              >
                <Card
                  style={[
                    styles.difficultyCard,
                    { backgroundColor: colors.surface.default },
                    isSelected && [
                      styles.selectedCard,
                      { borderColor: colors.primary.main, backgroundColor: colors.primary.container },
                    ],
                  ]}
                >
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.cardLeft}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor: isSelected
                              ? colors.primary.main
                              : colors.surface.variant,
                          },
                        ]}
                      >
                        <Icon
                          name={details.icon}
                          size={24}
                          color={isSelected ? colors.primary.onPrimary : colors.text.secondary}
                        />
                      </View>
                      <View style={styles.textContainer}>
                        <Text
                          variant="titleMedium"
                          style={[
                            styles.difficultyTitle,
                            { color: isSelected ? colors.primary.main : colors.text.primary },
                          ]}
                        >
                          {NAQT_DIFFICULTY_LABELS[difficulty]}
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={{ color: colors.text.secondary }}
                          numberOfLines={2}
                        >
                          {details.description}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <Icon
                        name="check-circle"
                        size={24}
                        color={colors.primary.main}
                      />
                    )}
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recommendation Note */}
        <View style={[styles.noteContainer, { backgroundColor: colors.surface.variant }]}>
          <Icon name="lightbulb-outline" size={20} color={colors.primary.main} />
          <Text variant="bodySmall" style={[styles.noteText, { color: colors.text.secondary }]}>
            You can change this anytime in Settings. We recommend starting with Varsity if you're
            new to quiz bowl.
          </Text>
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
  optionsContainer: {
    gap: spacing.md,
  },
  difficultyCard: {
    borderWidth: 2,
    borderColor: 'transparent',
    ...elevation.level1,
  },
  selectedCard: {
    borderWidth: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  difficultyTitle: {
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  noteText: {
    flex: 1,
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
