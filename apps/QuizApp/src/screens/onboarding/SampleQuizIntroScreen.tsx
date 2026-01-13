/**
 * SampleQuizIntroScreen
 *
 * Fifth screen of the onboarding wizard
 * Introduces the sample quiz before starting
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, radius } from '@monorepo/ui-components';
import { useTheme } from '../../providers/ThemeProvider';
import type { OnboardingStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SampleQuizIntro'>;

export const SampleQuizIntroScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  const handleStartQuiz = () => {
    navigation.navigate('Quiz', { isOnboarding: true });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.success.container }]}>
          <Icon name="play-circle" size={64} color={colors.success.main} />
        </View>

        {/* Title */}
        <Text variant="headlineMedium" style={[styles.title, { color: colors.text.primary }]}>
          Ready for a Practice Round?
        </Text>

        {/* Description */}
        <Text variant="bodyLarge" style={[styles.description, { color: colors.text.secondary }]}>
          Let's try a quick 2-question quiz to get you familiar with the format.
        </Text>

        {/* Info Cards */}
        <View style={styles.infoContainer}>
          <View style={[styles.infoCard, { backgroundColor: colors.surface.variant }]}>
            <Icon name="help-circle-outline" size={24} color={colors.primary.main} />
            <View style={styles.infoTextContainer}>
              <Text variant="titleSmall" style={{ color: colors.text.primary }}>
                2 Toss-up Questions
              </Text>
              <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                Buzz in when you know the answer
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.surface.variant }]}>
            <Icon name="star-outline" size={24} color={colors.warning.main} />
            <View style={styles.infoTextContainer}>
              <Text variant="titleSmall" style={{ color: colors.text.primary }}>
                Bonus Questions
              </Text>
              <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                Earn extra points for correct answers
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.surface.variant }]}>
            <Icon name="trophy-outline" size={24} color={colors.success.main} />
            <View style={styles.infoTextContainer}>
              <Text variant="titleSmall" style={{ color: colors.text.primary }}>
                See Your Results
              </Text>
              <Text variant="bodySmall" style={{ color: colors.text.secondary }}>
                Review your performance at the end
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <Button
          mode="contained"
          onPress={handleStartQuiz}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="play"
          testID="start-practice-quiz-button"
        >
          Start Practice Quiz
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
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  infoContainer: {
    width: '100%',
    marginBottom: spacing['2xl'],
    gap: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  infoTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
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
