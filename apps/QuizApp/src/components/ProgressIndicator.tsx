/**
 * ProgressIndicator Component
 *
 * Shows current question number and type
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';
import type { QuestionTypeKey } from '../types/quizFormat';

interface ProgressIndicatorProps {
  currentQuestion: number;
  totalQuestions: number;
  questionType: QuestionTypeKey;
  bonusPartIndex?: number;
  totalBonusParts?: number;
  testID?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentQuestion,
  totalQuestions,
  questionType,
  bonusPartIndex,
  totalBonusParts,
  testID = 'progress-indicator',
}) => {
  const { colors } = useTheme();
  const iconName = questionType === 'Tossup' ? 'bell-ring' : 'star-three-points';
  const label =
    questionType === 'Tossup'
      ? `Question ${currentQuestion} of ${totalQuestions}`
      : `Q${currentQuestion} Bonus (Part ${(bonusPartIndex ?? 0) + 1}${totalBonusParts ? `/${totalBonusParts}` : ''})`;

  return (
    <View style={styles.container} testID={testID}>
      <Icon
        name={iconName}
        size={16}
        color={colors.text.secondary}
        style={styles.icon}
      />
      <Text variant="bodyMedium" style={[styles.text, { color: colors.text.secondary }]}>
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
  text: {},
});
