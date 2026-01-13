/**
 * BuzzButton Component
 *
 * Large, prominent button with bell icon for buzzing in during toss-up questions.
 * Shows static bell during question reading, then vibrates with countdown timer
 * after question is fully read.
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, Pressable, Animated, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { elevation } from '@monorepo/ui-components';
import { useTheme } from '../providers/ThemeProvider';

interface BuzzButtonProps {
  onPress: () => void;
  disabled: boolean;
  isInBuzzWindow?: boolean;
  countdownSeconds?: number;
  testID?: string;
}

export const BuzzButton: React.FC<BuzzButtonProps> = ({
  onPress,
  disabled,
  isInBuzzWindow = false,
  countdownSeconds,
  testID = 'buzz-button',
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Vibrating bell animation when in buzz window
  useEffect(() => {
    if (isInBuzzWindow) {
      const shake = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.delay(200),
        ])
      );
      shake.start();

      return () => {
        shake.stop();
        shakeAnim.setValue(0);
      };
    } else {
      shakeAnim.setValue(0);
    }
  }, [isInBuzzWindow, shakeAnim]);

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

  // Interpolate shake animation to rotation
  const rotate = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  // Get button background color based on state
  const getBackgroundColor = () => {
    if (disabled) return colors.text.disabled;
    if (isInBuzzWindow) return colors.warning.main;
    return colors.primary.main;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor(), transform: [{ scale: scaleAnim }] },
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
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon
            name={isInBuzzWindow ? 'bell-ring' : 'bell'}
            size={48}
            color={colors.primary.onPrimary}
          />
        </Animated.View>

        {/* Countdown overlay when in buzz window */}
        {isInBuzzWindow && countdownSeconds !== undefined && (
          <View style={[styles.countdownOverlay, { backgroundColor: colors.error.main }]}>
            <Text style={[styles.countdownText, { color: colors.error.onError }]}>{countdownSeconds}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.level3,
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  countdownOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.level2,
  },
  countdownText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
