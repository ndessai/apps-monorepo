/**
 * Vocabulary Tossup Generator
 * Generates NAQT-style pyramidal tossup questions for vocabulary words
 */

import { v4 as uuidv4 } from 'uuid';
import type { VocabularyWord, VocabularyTossupQuestion, QuestionDifficulty } from '../types';
import {
  buildPyramidalClues,
  assembleQuestionText,
  calculatePowerMarkPosition,
  buildExplanation,
} from './clue-builder';

/** Options for tossup generation */
export interface TossupGenerationOptions {
  /** Target difficulty level */
  difficulty?: QuestionDifficulty;
  /** Power mark position ratio (0-1, default 0.35) */
  powerMarkRatio?: number;
  /** Whether to include mnemonic in explanation */
  includeMnemonic?: boolean;
}

const DEFAULT_OPTIONS: Required<TossupGenerationOptions> = {
  difficulty: 'high_school',
  powerMarkRatio: 0.35,
  includeMnemonic: true,
};

/**
 * Generate a NAQT-style vocabulary tossup question
 *
 * Pyramidal Structure (hard to easy):
 * 1. Etymology clue (hardest - requires root knowledge)
 * 2. Word family clue (related words)
 * 3. Usage context clue
 * 4. Synonym clue
 * 5. "For ten points, name this word meaning [definition]"
 */
export function generateVocabularyTossup(
  word: VocabularyWord,
  options: TossupGenerationOptions = {}
): VocabularyTossupQuestion {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const difficulty = opts.difficulty;

  // Build pyramidal clues
  const clues = buildPyramidalClues(word, difficulty);

  // Assemble full question text
  const questionText = assembleQuestionText(clues);

  // Calculate power mark position
  const powerMarkPosition = calculatePowerMarkPosition(questionText, opts.powerMarkRatio);

  // Build explanation
  const explanation = buildExplanation(word);

  return {
    id: `vocab-tossup-${uuidv4()}`,
    category: 'Vocabulary',
    subcategory: word.category,
    detailedCategory: word.subcategory,
    difficulty,
    targetWord: word,
    clues,
    text: questionText,
    powerMarkPosition,
    answer: word.word,
    acceptableAnswers: word.acceptableAnswers,
    explanation,
    source: 'vocabulary-quiz',
  };
}

/**
 * Generate multiple tossups from a list of words
 */
export function generateTossupBatch(
  words: VocabularyWord[],
  options: TossupGenerationOptions = {}
): VocabularyTossupQuestion[] {
  return words.map(word => generateVocabularyTossup(word, options));
}

/**
 * Generate tossups with varying difficulties from a word list
 */
export function generateMixedDifficultyTossups(
  words: VocabularyWord[],
  options: Omit<TossupGenerationOptions, 'difficulty'> = {}
): VocabularyTossupQuestion[] {
  return words.map(word =>
    generateVocabularyTossup(word, {
      ...options,
      difficulty: word.difficulty,
    })
  );
}

/**
 * Validate a generated tossup
 */
export function validateTossup(tossup: VocabularyTossupQuestion): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!tossup.id) errors.push('Missing id');
  if (!tossup.text) errors.push('Missing text');
  if (!tossup.answer) errors.push('Missing answer');
  if (!tossup.targetWord) errors.push('Missing targetWord');

  // Check text length (should be reasonable)
  if (tossup.text.length < 100) {
    errors.push('Question text too short (< 100 chars)');
  }
  if (tossup.text.length > 1000) {
    errors.push('Question text too long (> 1000 chars)');
  }

  // Check power mark position
  if (tossup.powerMarkPosition < 0 || tossup.powerMarkPosition > tossup.text.length) {
    errors.push('Invalid power mark position');
  }

  // Check that power mark is in reasonable range (20-50% of text)
  const powerMarkRatio = tossup.powerMarkPosition / tossup.text.length;
  if (powerMarkRatio < 0.15 || powerMarkRatio > 0.55) {
    errors.push(`Power mark ratio ${powerMarkRatio.toFixed(2)} outside expected range (0.15-0.55)`);
  }

  // Check clues
  if (!tossup.clues || tossup.clues.length < 2) {
    errors.push('Too few clues (minimum 2)');
  }

  // Check that answer is not in question text (except in acceptable "name this X" format)
  const answerRegex = new RegExp(`\\b${tossup.answer}\\b`, 'gi');
  const textBeforeFTP = tossup.text.split('For ten points')[0];
  if (answerRegex.test(textBeforeFTP)) {
    errors.push('Answer appears in question text before giveaway');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Insert power mark symbol into question text for display
 */
export function insertPowerMark(tossup: VocabularyTossupQuestion, symbol: string = '★'): string {
  const text = tossup.text;
  const position = tossup.powerMarkPosition;

  if (position <= 0 || position >= text.length) {
    return text;
  }

  return text.slice(0, position) + ` ${symbol} ` + text.slice(position);
}

/**
 * Get the power portion of the question (before power mark)
 */
export function getPowerPortion(tossup: VocabularyTossupQuestion): string {
  return tossup.text.slice(0, tossup.powerMarkPosition);
}

/**
 * Get the non-power portion of the question (after power mark)
 */
export function getNonPowerPortion(tossup: VocabularyTossupQuestion): string {
  return tossup.text.slice(tossup.powerMarkPosition);
}
