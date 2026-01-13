/**
 * WelcomeScreen
 *
 * First screen of the onboarding wizard
 * Shows welcome message, description, and inspirational quote
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing } from '@monorepo/ui-components';
import { useTheme } from '../../providers/ThemeProvider';
import type { OnboardingStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  const handleGetStarted = () => {
    navigation.navigate('ThemeSelection');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.content}>
        {/* App Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primary.container }]}>
          <Icon name="head-question" size={64} color={colors.primary.main} />
        </View>

        {/* Title */}
        <Text variant="displaySmall" style={[styles.title, { color: colors.text.primary }]}>
          Welcome to Quiz Me!
        </Text>

        {/* Subtitle */}
        <Text variant="bodyLarge" style={[styles.subtitle, { color: colors.text.secondary }]}>
          Let's set up a few things to personalize your experience. You can always change these later in Settings.
        </Text>

        {/* Quote */}
        <View style={[styles.quoteContainer, { backgroundColor: colors.surface.variant }]}>
          <Text variant="bodyMedium" style={[styles.quote, { color: colors.text.primary }]}>
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
          </Text>
          <Text variant="labelMedium" style={[styles.quoteAuthor, { color: colors.text.tertiary }]}>
            — Aristotle
          </Text>
        </View>

        {/* CTA Button */}
        <Button
          mode="contained"
          onPress={handleGetStarted}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          testID="get-started-button"
        >
          Get Started
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
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  quoteContainer: {
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing['2xl'],
    width: '100%',
  },
  quote: {
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    marginVertical: spacing.sm,
  },
  quoteAuthor: {
    textAlign: 'right',
    fontWeight: '600',
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
