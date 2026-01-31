/**
 * NAQT-Style Question Types for Vocabulary
 * Extends QuizApp question types for vocabulary-specific features
 */

import type { VocabularyWord, QuestionDifficulty } from './vocabulary';
import type { VocabularyCategory, VocabularySubcategory } from './categories';

/** Question source tracking */
export type QuestionSource = 'vocabulary-quiz' | 'ai-generated' | 'manual';

/** Clue types for pyramidal structure */
export type ClueType =
  | 'etymology'          // Root/origin clue (hardest)
  | 'obscure_synonym'    // Rare synonym
  | 'usage_context'      // Specific usage context
  | 'common_synonym'     // Common synonym
  | 'definition'         // Direct definition (easiest)
  | 'antonym'            // Opposite meaning
  | 'example_sentence'   // Sentence with blank
  | 'word_family';       // Related words clue

/** A single clue in the pyramidal structure */
export interface VocabularyClue {
  /** Type of clue */
  type: ClueType;
  /** Clue text */
  text: string;
  /** Difficulty rank within the question (1 = hardest, 5 = easiest) */
  difficultyRank: number;
}

/** Vocabulary Tossup Question */
export interface VocabularyTossupQuestion {
  /** Unique identifier */
  id: string;
  /** Always 'Vocabulary' for this package */
  category: 'Vocabulary';
  /** Vocabulary-specific category */
  subcategory: VocabularyCategory;
  /** Detailed subcategory */
  detailedCategory: VocabularySubcategory;
  /** Difficulty level */
  difficulty: QuestionDifficulty;

  /** The target vocabulary word (answer) */
  targetWord: VocabularyWord;

  /** Pyramidal clues (ordered hard to easy) */
  clues: VocabularyClue[];

  /** Full question text (assembled from clues) */
  text: string;

  /** Character position for power mark */
  powerMarkPosition: number;

  /** Primary answer */
  answer: string;

  /** Acceptable answer variations */
  acceptableAnswers: string[];

  /** Explanation after answering */
  explanation: string;

  /** Source tracking */
  source: QuestionSource;
}

/** Vocabulary Bonus Part */
export interface VocabularyBonusPart {
  /** Part text/question */
  text: string;
  /** Correct answer */
  answer: string;
  /** Acceptable variations */
  acceptableAnswers: string[];
  /** Point value (always 10) */
  pointValue: 10;
  /** Type of clue used */
  clueType: ClueType;
}

/** Bonus question pattern types */
export type BonusPattern =
  | 'etymology'        // 3 words from same root
  | 'synonym_antonym'  // Related word trio
  | 'category'         // 3 words from same subcategory
  | 'word_forms';      // Different forms of related words

/** Vocabulary Bonus Question */
export interface VocabularyBonusQuestion {
  /** Unique identifier */
  id: string;
  /** Linked tossup ID */
  linkedTossupId: string;
  /** Always 'Vocabulary' */
  category: 'Vocabulary';
  /** Vocabulary-specific category */
  subcategory: VocabularyCategory;
  /** Detailed subcategory */
  detailedCategory: VocabularySubcategory;
  /** Difficulty level */
  difficulty: QuestionDifficulty;

  /** Lead-in text introducing the bonus */
  leadin: string;

  /** Exactly three bonus parts */
  parts: [VocabularyBonusPart, VocabularyBonusPart, VocabularyBonusPart];

  /** Pattern used for this bonus */
  pattern: BonusPattern;

  /** Root/etymology focus (if etymology-based) */
  etymologyFocus?: {
    root: string;
    meaning: string;
    language: string;
  };

  /** Source tracking */
  source: QuestionSource;
}

/** Complete vocabulary quiz packet */
export interface VocabularyQuizData {
  /** Tossup questions */
  tossups: VocabularyTossupQuestion[];
  /** Bonus questions */
  bonuses: VocabularyBonusQuestion[];
  /** Packet metadata */
  metadata: {
    generatedAt: string;
    wordCount: number;
    categoryBreakdown: Record<VocabularyCategory, number>;
    difficultyBreakdown: Record<QuestionDifficulty, number>;
  };
}

/** Options for generating quiz packets */
export interface QuizGenerationOptions {
  /** Categories to include */
  categories?: VocabularyCategory[];
  /** Target difficulty level */
  difficulty?: QuestionDifficulty;
  /** Number of tossups to generate */
  tossupCount?: number;
  /** Whether to include bonuses */
  includeBonuses?: boolean;
  /** Preferred bonus pattern */
  bonusPattern?: BonusPattern;
}
