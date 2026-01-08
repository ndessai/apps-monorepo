import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, elevation } from '@monorepo/ui-components';

// Mock API call
const fetchData = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    message: 'Data loaded with React Query!',
    timestamp: new Date().toISOString(),
  };
};

export const SecondScreen: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['secondScreenData'],
    queryFn: fetchData,
  });

  return (
    <ScrollView style={styles.container} testID="second-screen">
      <View style={styles.content}>
        <Icon name="chart-line" size={80} color={colors.secondary.main} testID="chart-icon" />
        <Text variant="displayMedium" style={styles.title} testID="second-title">
          Second Screen
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle} testID="second-subtitle">
          Demonstrating React Query
        </Text>

        <Card style={styles.card} testID="react-query-card">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              React Query Demo
            </Text>

            {isLoading && (
              <Text variant="bodyMedium" style={styles.cardText} testID="loading-text">
                Loading data...
              </Text>
            )}

            {isError && (
              <Text variant="bodyMedium" style={styles.errorText} testID="error-text">
                Error loading data
              </Text>
            )}

            {data && (
              <View testID="data-container">
                <Text variant="bodyMedium" style={styles.cardText} testID="data-message">
                  {data.message}
                </Text>
                <Text variant="bodySmall" style={styles.timestamp} testID="data-timestamp">
                  Loaded at: {new Date(data.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            )}
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => refetch()} mode="contained" testID="refresh-button">
              Refresh Data
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card} testID="features-card">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Features
            </Text>
            <View style={styles.featureItem} testID="feature-1">
              <Icon name="check-circle" size={20} color={colors.success.main} />
              <Text variant="bodyMedium" style={styles.featureText}>
                Bottom Tab Navigation
              </Text>
            </View>
            <View style={styles.featureItem} testID="feature-2">
              <Icon name="check-circle" size={20} color={colors.success.main} />
              <Text variant="bodyMedium" style={styles.featureText}>
                React Query for State Management
              </Text>
            </View>
            <View style={styles.featureItem} testID="feature-3">
              <Icon name="check-circle" size={20} color={colors.success.main} />
              <Text variant="bodyMedium" style={styles.featureText}>
                Swipeable Cards with Gestures
              </Text>
            </View>
            <View style={styles.featureItem} testID="feature-4">
              <Icon name="check-circle" size={20} color={colors.success.main} />
              <Text variant="bodyMedium" style={styles.featureText}>
                Industry Standard Folder Structure
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing['2xl'],
  },
  title: {
    marginTop: spacing.lg,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  card: {
    width: '100%',
    marginTop: spacing.md,
    ...elevation.level1,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  cardText: {
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  timestamp: {
    color: colors.text.disabled,
    marginTop: spacing.sm,
    fontSize: 12,
  },
  errorText: {
    color: colors.error.main,
    marginTop: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  featureText: {
    marginLeft: spacing.md,
    flex: 1,
  },
});
