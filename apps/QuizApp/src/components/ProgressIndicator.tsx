/**
 * ProgressIndicator Component
 *
 * Shows current question number and type
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '@monorepo/ui-components';

interface ProgressIndicatorProps {
  currentQuestion: number;
  totalQuestions: number;
  questionType: 'tossup' | 'bonus';
  testID?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentQuestion,
  totalQuestions,
  questionType,
  testID = 'progress-indicator',
}) => {
  const iconName = questionType === 'tossup' ? 'bell-ring' : 'star-three-points';
  const label =
    questionType === 'tossup'
      ? `Question ${currentQuestion} of ${totalQuestions}`
      : `Bonus ${currentQuestion} of ${totalQuestions}`;

  return (
    <View style={styles.container} testID={testID}>
      <Icon
        name={iconName}
        size={16}
        color={colors.text.secondary}
        style={styles.icon}
      />
      <Text variant="bodyMedium" style={styles.text}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    color: colors.text.secondary,
  },
});
