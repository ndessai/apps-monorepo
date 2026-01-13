/**
 * ScoreDisplay Component
 *
 * Shows current score vs max possible score
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { spacing, elevation, radius } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';

interface ScoreDisplayProps {
  currentScore: number;
  maxScore: number;
  testID?: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  currentScore,
  maxScore,
  testID = 'score-display',
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface.variant }]} testID={testID}>
      <Text variant="titleMedium" style={styles.text}>
        <Text style={[styles.currentScore, { color: colors.primary.main }]}>{currentScore}</Text>
        <Text style={[styles.separator, { color: colors.text.secondary }]}> / </Text>
        <Text style={[styles.maxScore, { color: colors.text.secondary }]}>{maxScore}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    ...elevation.level1,
  },
  text: {
    fontWeight: '600',
  },
  currentScore: {
    fontSize: 18,
  },
  separator: {},
  maxScore: {
    fontSize: 18,
  },
});
