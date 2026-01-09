/**
 * TossupReader Component
 *
 * Card-based display for toss-up questions with progressive text reveal
 */

import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, elevation, radius } from '@monorepo/ui-components';

interface TossupReaderProps {
  text: string;
  currentCharIndex: number;
  powerMarkPosition?: number;
  testID?: string;
}

export const TossupReader: React.FC<TossupReaderProps> = ({
  text,
  currentCharIndex,
  powerMarkPosition,
  testID = 'tossup-reader',
}) => {
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Get the revealed text (everything up to current character index)
  const revealedText = React.useMemo(() => {
    if (currentCharIndex >= text.length) {
      return text;
    }
    // Show at least first character to indicate text is present
    const minIndex = Math.max(1, currentCharIndex);
    return text.substring(0, minIndex);
  }, [text, currentCharIndex]);

  // Check if power mark has been revealed
  const powerMarkRevealed = React.useMemo(() => {
    return powerMarkPosition !== undefined && currentCharIndex >= powerMarkPosition;
  }, [powerMarkPosition, currentCharIndex]);

  // Auto-scroll to bottom as text reveals
  React.useEffect(() => {
    if (scrollViewRef.current && currentCharIndex > 0) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [currentCharIndex]);

  return (
    <Card style={styles.card} testID={testID}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.header}>
          <Icon name="book-open-variant" size={20} color={colors.primary.main} />
          <Text variant="labelMedium" style={styles.headerText}>
            Toss-up Question
          </Text>
          {powerMarkRevealed && (
            <View style={styles.powerMarkBadge}>
              <Icon name="star" size={14} color={colors.warning.main} />
              <Text variant="labelSmall" style={styles.powerMarkText}>
                Power
              </Text>
            </View>
          )}
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text variant="bodyLarge" style={styles.questionText}>
            {revealedText}
            {currentCharIndex < text.length && (
              <Text style={styles.cursor}>|</Text>
            )}
          </Text>
        </ScrollView>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: spacing.lg,
    backgroundColor: colors.surface.default,
    ...elevation.level2,
  },
  cardContent: {
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerText: {
    marginLeft: spacing.xs,
    color: colors.text.secondary,
    fontWeight: '600',
    flex: 1,
  },
  powerMarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  powerMarkText: {
    marginLeft: spacing.xs,
    color: colors.warning.dark,
    fontWeight: '600',
  },
  scrollView: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingVertical: spacing.sm,
  },
  questionText: {
    color: colors.text.primary,
    lineHeight: 28,
    fontSize: 16,
  },
  cursor: {
    color: colors.primary.main,
    fontWeight: 'bold',
  },
});
