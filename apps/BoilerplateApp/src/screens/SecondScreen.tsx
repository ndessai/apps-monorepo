import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQuery } from '@tanstack/react-query';

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
        <Icon name="chart-line" size={80} color="#2196F3" testID="chart-icon" />
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
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text variant="bodyMedium" style={styles.featureText}>
                Bottom Tab Navigation
              </Text>
            </View>
            <View style={styles.featureItem} testID="feature-2">
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text variant="bodyMedium" style={styles.featureText}>
                React Query for State Management
              </Text>
            </View>
            <View style={styles.featureItem} testID="feature-3">
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text variant="bodyMedium" style={styles.featureText}>
                Swipeable Cards with Gestures
              </Text>
            </View>
            <View style={styles.featureItem} testID="feature-4">
              <Icon name="check-circle" size={20} color="#4CAF50" />
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    marginTop: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardText: {
    color: '#333',
    marginTop: 8,
  },
  timestamp: {
    color: '#999',
    marginTop: 8,
    fontSize: 12,
  },
  errorText: {
    color: '#f44336',
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  featureText: {
    marginLeft: 12,
    flex: 1,
  },
});
