/**
 * ThemeSelectionScreen
 *
 * Second screen of the onboarding wizard
 * Allows user to choose between light and dark theme
 */

import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, radius, elevation, lightColors, darkColors } from '@monorepo/ui-components';
import { useTheme } from '../../providers/ThemeProvider';
import type { OnboardingStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ThemeSelection'>;

export const ThemeSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(theme);

  const handleThemeSelect = (newTheme: 'light' | 'dark') => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };

  const handleContinue = () => {
    navigation.navigate('VoiceSettings');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.content}>
        {/* Title */}
        <Text variant="headlineMedium" style={[styles.title, { color: colors.text.primary }]}>
          Choose Your Theme
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: colors.text.secondary }]}>
          Select the appearance that's easiest on your eyes
        </Text>

        {/* Theme Options */}
        <View style={styles.optionsContainer}>
          {/* Light Theme */}
          <TouchableOpacity
            style={[
              styles.themeCard,
              { backgroundColor: lightColors.surface.default },
              selectedTheme === 'light' && [styles.selectedCard, { borderColor: colors.primary.main }],
            ]}
            onPress={() => handleThemeSelect('light')}
            testID="light-theme-option"
          >
            <View style={[styles.previewHeader, { backgroundColor: lightColors.primary.main }]}>
              <Icon name="white-balance-sunny" size={24} color={lightColors.primary.onPrimary} />
            </View>
            <View style={styles.previewContent}>
              <View style={[styles.previewLine, { backgroundColor: lightColors.text.primary, width: '80%' }]} />
              <View style={[styles.previewLine, { backgroundColor: lightColors.text.secondary, width: '60%' }]} />
              <View style={[styles.previewLine, { backgroundColor: lightColors.divider, width: '90%' }]} />
            </View>
            <View style={styles.labelContainer}>
              <Text variant="titleMedium" style={[styles.themeLabel, { color: lightColors.text.primary }]}>
                Light
              </Text>
              {selectedTheme === 'light' && (
                <Icon name="check-circle" size={20} color={colors.primary.main} />
              )}
            </View>
          </TouchableOpacity>

          {/* Dark Theme */}
          <TouchableOpacity
            style={[
              styles.themeCard,
              { backgroundColor: darkColors.surface.default },
              selectedTheme === 'dark' && [styles.selectedCard, { borderColor: colors.primary.main }],
            ]}
            onPress={() => handleThemeSelect('dark')}
            testID="dark-theme-option"
          >
            <View style={[styles.previewHeader, { backgroundColor: darkColors.primary.main }]}>
              <Icon name="moon-waning-crescent" size={24} color={darkColors.primary.onPrimary} />
            </View>
            <View style={styles.previewContent}>
              <View style={[styles.previewLine, { backgroundColor: darkColors.text.primary, width: '80%' }]} />
              <View style={[styles.previewLine, { backgroundColor: darkColors.text.secondary, width: '60%' }]} />
              <View style={[styles.previewLine, { backgroundColor: darkColors.divider, width: '90%' }]} />
            </View>
            <View style={styles.labelContainer}>
              <Text variant="titleMedium" style={[styles.themeLabel, { color: darkColors.text.primary }]}>
                Dark
              </Text>
              {selectedTheme === 'dark' && (
                <Icon name="check-circle" size={20} color={colors.primary.main} />
              )}
            </View>
          </TouchableOpacity>
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
    gap: spacing.md,
  },
  themeCard: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    ...elevation.level2,
  },
  selectedCard: {
    borderWidth: 3,
  },
  previewHeader: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  previewLine: {
    height: 8,
    borderRadius: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: 0,
  },
  themeLabel: {
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
