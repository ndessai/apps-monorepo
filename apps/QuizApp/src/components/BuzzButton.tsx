/**
 * BuzzButton Component
 *
 * Large, prominent button for buzzing in during toss-up questions
 */

import React from 'react';
import { StyleSheet, Pressable, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, spacing, elevation } from '@monorepo/ui-components';

interface BuzzButtonProps {
  onPress: () => void;
  disabled: boolean;
  testID?: string;
}

export const BuzzButton: React.FC<BuzzButtonProps> = ({
  onPress,
  disabled,
  testID = 'buzz-button',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
        disabled && styles.disabled,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={styles.button}
        testID={testID}
      >
        <Text variant="displaySmall" style={styles.text}>
          BUZZ
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.level3,
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.surface.default,
    fontWeight: 'bold',
    fontSize: 32,
  },
  disabled: {
    backgroundColor: colors.text.disabled,
    opacity: 0.5,
  },
});
