import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const HelloScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Icon name="rocket-launch" size={80} color="#6200ee" />
      <Text variant="displayMedium" style={styles.title}>
        Hello!
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Welcome to your React Native Monorepo
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 10,
    color: '#666',
  },
});
