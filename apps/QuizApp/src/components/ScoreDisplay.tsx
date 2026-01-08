/**
 * ScoreDisplay Component
 *
 * Shows current score vs max possible score
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, spacing, elevation, radius } from '@monorepo/ui-components';

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
  return (
    <View style={styles.container} testID={testID}>
      <Text variant="titleMedium" style={styles.text}>
        <Text style={styles.currentScore}>{currentScore}</Text>
        <Text style={styles.separator}> / </Text>
        <Text style={styles.maxScore}>{maxScore}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.variant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    ...elevation.level1,
  },
  text: {
    fontWeight: '600',
  },
  currentScore: {
    color: colors.primary.main,
    fontSize: 18,
  },
  separator: {
    color: colors.text.secondary,
  },
  maxScore: {
    color: colors.text.secondary,
    fontSize: 18,
  },
});
