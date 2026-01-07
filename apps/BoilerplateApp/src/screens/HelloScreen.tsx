import React, { useState, useLayoutEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SwipeableCard } from '../components/SwipeableCard';
import { colors, spacing, elevation } from '@monorepo/ui-components';
import { HomeStackParamList } from '../navigation/BottomTabNavigator';

type HelloScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Hello'>;

export const HelloScreen: React.FC = () => {
  const navigation = useNavigation<HelloScreenNavigationProp>();
  const [cards, setCards] = useState([
    { id: '1', title: 'Swipeable Card', description: 'Swipe left to delete' },
    { id: '2', title: 'Another Card', description: 'Try swiping this one too!' },
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Home',
      headerStyle: {
        backgroundColor: colors.surface.default,
      },
      headerTintColor: colors.text.primary,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.headerButton}
        >
          <Icon name="account-circle" size={28} color={colors.primary.main} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCards((prev) => prev.filter((card) => card.id !== id));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container} testID="hello-screen">
      <Icon name="rocket-launch" size={80} color={colors.primary.main} testID="rocket-icon" />
      <Text variant="displayMedium" style={styles.title} testID="hello-title">
        Hello!
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle} testID="hello-subtitle">
        Welcome to your React Native Monorepo
      </Text>

      <View style={styles.cardsContainer} testID="cards-container">
        {cards.map((card) => (
          <SwipeableCard
            key={card.id}
            onDelete={() => handleDelete(card.id)}
            testID={`swipeable-card-${card.id}`}
          >
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" testID={`card-title-${card.id}`}>
                  {card.title}
                </Text>
                <Text variant="bodyMedium" style={styles.cardDescription} testID={`card-description-${card.id}`}>
                  {card.description}
                </Text>
              </Card.Content>
            </Card>
          </SwipeableCard>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    padding: spacing.lg,
  },
  title: {
    marginTop: spacing.lg,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  cardsContainer: {
    marginTop: spacing.xl,
    width: '100%',
  },
  card: {
    marginBottom: spacing.md,
    ...elevation.level1,
  },
  cardDescription: {
    marginTop: spacing.sm,
    color: colors.text.secondary,
  },
  headerButton: {
    marginRight: spacing.md,
  },
});
