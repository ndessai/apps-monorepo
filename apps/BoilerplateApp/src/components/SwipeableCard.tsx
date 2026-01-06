import React, { ReactNode } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton} testID={`${testID}-delete-button`}>
        <Animated.View style={[styles.deleteContent, { transform: [{ scale }] }]}>
          <Icon name="delete" size={24} color="#fff" />
          <Text style={styles.deleteText}>Delete</Text>
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
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    marginBottom: 12,
    borderRadius: 8,
  },
  deleteContent: {
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
