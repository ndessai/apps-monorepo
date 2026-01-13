/**
 * TimerDisplay Component
 *
 * Countdown timer with color transitions
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { spacing } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';

interface TimerDisplayProps {
  seconds: number;
  isWarning: boolean;
  label?: string;
  testID?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  seconds,
  isWarning,
  label,
  testID = 'timer-display',
}) => {
  const { colors } = useTheme();
  const timerColor = isWarning ? colors.error.main : colors.success.main;

  return (
    <View style={styles.container} testID={testID}>
      {label && (
        <Text variant="labelMedium" style={[styles.label, { color: colors.text.secondary }]}>
          {label}
        </Text>
      )}
      <View style={[styles.timerCircle, { borderColor: timerColor }]}>
        <Text
          variant="displaySmall"
          style={[styles.timerText, { color: timerColor }]}
        >
          {seconds}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    marginBottom: spacing.xs,
  },
  timerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontWeight: 'bold',
  },
});
