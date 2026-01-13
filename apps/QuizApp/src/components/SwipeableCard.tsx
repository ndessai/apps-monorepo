import React, { ReactNode } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing, radius } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';

interface SwipeableCardProps {
  children: ReactNode;
  onDelete: () => void;
  testID?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onDelete,
  testID,
}) => {
  const { colors } = useTheme();

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity onPress={onDelete} style={[styles.deleteButton, { backgroundColor: colors.error.main }]} testID={`${testID}-delete-button`}>
        <Animated.View style={[styles.deleteContent, { transform: [{ scale }] }]}>
          <Icon name="delete" size={24} color="#fff" />
          <Text style={[styles.deleteText, { color: colors.error.onError }]}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      testID={testID}
    >
      <View testID={`${testID}-content`}>{children}</View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    marginBottom: spacing.md,
    borderRadius: radius.sm,
  },
  deleteContent: {
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
