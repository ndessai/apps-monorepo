/**
 * QuestionDisplay Component
 *
 * Displays quiz question text with word-by-word highlighting
 * Shows power mark indicator for toss-up questions
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius } from '@monorepo/ui-components';

interface QuestionDisplayProps {
  text: string;
  currentCharIndex: number;
  powerMarkPosition?: number;
  testID?: string;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  text,
  currentCharIndex,
  powerMarkPosition,
  testID = 'question-display',
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const wordRefs = useRef<Map<number, View>>(new Map());

  // Split text into words with their positions
  const words = React.useMemo(() => {
    const wordArray: Array<{ text: string; start: number; end: number }> = [];
    let currentWord = '';
    let wordStart = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ' || char === '\n' || char === '\t') {
        if (currentWord.length > 0) {
          wordArray.push({
            text: currentWord,
            start: wordStart,
            end: i,
          });
          currentWord = '';
        }
        wordStart = i + 1;
      } else {
        if (currentWord.length === 0) {
          wordStart = i;
        }
        currentWord += char;
      }
    }

    // Add last word if exists
    if (currentWord.length > 0) {
      wordArray.push({
        text: currentWord,
        start: wordStart,
        end: text.length,
      });
    }

    return wordArray;
  }, [text]);

  // Find current word index based on character position
  const currentWordIndex = React.useMemo(() => {
    return words.findIndex(
      (word) => currentCharIndex >= word.start && currentCharIndex < word.end
    );
  }, [words, currentCharIndex]);

  // Check if power mark is in this word
  const getPowerMarkForWord = (wordIndex: number): boolean => {
    if (powerMarkPosition === undefined) return false;
    const word = words[wordIndex];
    return (
      powerMarkPosition >= word.start && powerMarkPosition < word.end
    );
  };

  // Auto-scroll to keep highlighted word visible
  useEffect(() => {
    if (currentWordIndex >= 0 && wordRefs.current.has(currentWordIndex)) {
      const wordView = wordRefs.current.get(currentWordIndex);
      if (wordView && scrollViewRef.current) {
        wordView.measureLayout(
          scrollViewRef.current as any,
          (_x, y, _width, height) => {
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, y - height * 2),
              animated: true,
            });
          },
          () => {
            // Error callback - ignore
          }
        );
      }
    }
  }, [currentWordIndex]);

  return (
    <View style={styles.container} testID={testID}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.textContainer}>
          {words.map((word, index) => {
            const isHighlighted = index === currentWordIndex;
            const hasPowerMark = getPowerMarkForWord(index);

            return (
              <View
                key={`${word.start}-${word.end}`}
                ref={(ref) => {
                  if (ref) {
                    wordRefs.current.set(index, ref);
                  }
                }}
                style={styles.wordWrapper}
              >
                <View
                  style={[
                    styles.wordContainer,
                    isHighlighted && styles.highlightedWord,
                  ]}
                >
                  <Text
                    variant="bodyLarge"
                    style={[
                      styles.wordText,
                      isHighlighted && styles.highlightedText,
                    ]}
                  >
                    {word.text}
                  </Text>
                  {hasPowerMark && (
                    <Icon
                      name="star"
                      size={14}
                      color={colors.warning.main}
                      style={styles.powerMarkIcon}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.default,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wordWrapper: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  highlightedWord: {
    backgroundColor: colors.primary.light,
  },
  wordText: {
    color: colors.text.primary,
  },
  highlightedText: {
    color: colors.primary.dark,
    fontWeight: '600',
  },
  powerMarkIcon: {
    marginLeft: 2,
  },
});
