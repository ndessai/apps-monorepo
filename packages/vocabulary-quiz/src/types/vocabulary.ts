/**
 * Core Vocabulary Word Types
 * Based on Word Power Made Easy and Six Weeks to Words of Power structures
 */

import type { EtymologyInfo, RootInfo } from './etymology';
import type { VocabularyCategory, VocabularySubcategory } from './categories';

/** Part of speech for vocabulary words */
export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'noun/adjective'
  | 'verb/noun';

/** Difficulty levels matching QuizApp */
export type QuestionDifficulty =
  | 'middle_school'
  | 'high_school'
  | 'college'
  | 'open';

/** A single vocabulary word entry */
export interface VocabularyWord {
  /** Unique identifier for the word */
  id: string;

  /** The vocabulary word itself */
  word: string;

  /** Pronunciation guide (IPA or phonetic) */
  pronunciation: string;

  /** Part of speech */
  partOfSpeech: PartOfSpeech;

  /** Primary definition */
  definition: string;

  /** Additional definitions if polysemous */
  additionalDefinitions?: string[];

  /** Primary category */
  category: VocabularyCategory;

  /** Subcategory for more granular classification */
  subcategory: VocabularySubcategory;

  /** Difficulty level for question generation */
  difficulty: QuestionDifficulty;

  /** Etymology information */
  etymology: EtymologyInfo;

  /** Example sentences demonstrating usage */
  exampleSentences: string[];

  /** Synonyms (for clue generation) */
  synonyms: string[];

  /** Antonyms (for bonus questions) */
  antonyms?: string[];

  /** Related words (share roots or concepts) */
  relatedWords: string[];

  /** Mnemonic device for memorization */
  mnemonic?: string;

  /** Common misconceptions or usage notes */
  usageNotes?: string;

  /** Acceptable answer variations */
  acceptableAnswers: string[];

  /** Source reference (e.g., "Word Power Made Easy, Ch. 3") */
  source?: string;
}

/** Word family - group of words sharing a root */
export interface WordFamily {
  /** Unique identifier */
  id: string;
  /** Root ID this family is based on */
  rootId: string;
  /** Root information */
  root: RootInfo;
  /** Words in this family */
  words: VocabularyWord[];
}

/** Thematic word group (like Norman Lewis sections) */
export interface ThematicWordGroup {
  /** Unique identifier */
  id: string;
  /** Group name (e.g., "Medical Specialists") */
  name: string;
  /** Description of the theme */
  description: string;
  /** Thematic focus (e.g., "medical specialists", "personality types") */
  theme: string;
  /** Primary category */
  category: VocabularyCategory;
  /** Words in this group */
  words: VocabularyWord[];
  /** Related thematic groups */
  relatedGroups?: string[];
}

/** Word database statistics */
export interface WordDatabaseStats {
  totalWords: number;
  byCategory: Record<VocabularyCategory, number>;
  byDifficulty: Record<QuestionDifficulty, number>;
  bySubcategory: Record<VocabularySubcategory, number>;
}
