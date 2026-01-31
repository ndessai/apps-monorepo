/**
 * Vocabulary Bonus Generator
 * Generates NAQT-style 3-part bonus questions for vocabulary
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  VocabularyWord,
  VocabularyBonusQuestion,
  VocabularyBonusPart,
  BonusPattern,
  QuestionDifficulty,
  ClueType,
} from '../types';
import { getAllWords, getWordsByRootId } from '../data/words';

/** Options for bonus generation */
export interface BonusGenerationOptions {
  /** Preferred bonus pattern */
  pattern?: BonusPattern;
  /** Target difficulty level */
  difficulty?: QuestionDifficulty;
}

const DEFAULT_OPTIONS: Required<BonusGenerationOptions> = {
  pattern: 'etymology',
  difficulty: 'high_school',
};

/**
 * Generate a vocabulary bonus question
 *
 * Bonus Patterns:
 * 1. Etymology-based: 3 words from the same root
 * 2. Synonym/Antonym: Related word trio
 * 3. Category: 3 words from the same subcategory
 * 4. Word forms: Different grammatical forms
 */
export function generateVocabularyBonus(
  primaryWord: VocabularyWord,
  linkedTossupId: string,
  options: BonusGenerationOptions = {}
): VocabularyBonusQuestion | null {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Try to find the best pattern based on available data
  const pattern = selectBestPattern(primaryWord, opts.pattern);
  if (!pattern) return null;

  // Get words for the bonus parts
  const bonusWords = selectBonusWords(primaryWord, pattern);
  if (bonusWords.length < 3) return null;

  // Generate parts
  const parts = generateBonusParts(bonusWords, pattern);

  // Generate lead-in
  const leadin = generateLeadin(primaryWord, pattern);

  // Build etymology focus if applicable
  const etymologyFocus = pattern === 'etymology' && primaryWord.etymology.roots.length > 0
    ? {
        root: primaryWord.etymology.roots[0].root,
        meaning: primaryWord.etymology.roots[0].meaning,
        language: primaryWord.etymology.roots[0].language,
      }
    : undefined;

  return {
    id: `vocab-bonus-${uuidv4()}`,
    linkedTossupId,
    category: 'Vocabulary',
    subcategory: primaryWord.category,
    detailedCategory: primaryWord.subcategory,
    difficulty: opts.difficulty,
    leadin,
    parts: parts as [VocabularyBonusPart, VocabularyBonusPart, VocabularyBonusPart],
    pattern,
    etymologyFocus,
    source: 'vocabulary-quiz',
  };
}

/**
 * Select the best bonus pattern based on available word data
 */
function selectBestPattern(
  word: VocabularyWord,
  preferredPattern?: BonusPattern
): BonusPattern | null {
  const allWords = getAllWords();

  // Check etymology pattern
  if (word.etymology.roots.length > 0) {
    const rootId = word.etymology.roots[0].id;
    const rootWords = getWordsByRootId(rootId);
    if (rootWords.length >= 3) {
      if (preferredPattern === 'etymology' || !preferredPattern) {
        return 'etymology';
      }
    }
  }

  // Check synonym/antonym pattern
  const synonymsInDb = word.synonyms.filter(syn =>
    allWords.some(w => w.word.toLowerCase() === syn.toLowerCase())
  );
  const antonymsInDb = word.antonyms?.filter(ant =>
    allWords.some(w => w.word.toLowerCase() === ant.toLowerCase())
  ) || [];

  if (synonymsInDb.length + antonymsInDb.length >= 2) {
    if (preferredPattern === 'synonym_antonym') {
      return 'synonym_antonym';
    }
  }

  // Check category pattern
  const categoryWords = allWords.filter(w =>
    w.subcategory === word.subcategory && w.id !== word.id
  );
  if (categoryWords.length >= 2) {
    if (preferredPattern === 'category' || !preferredPattern) {
      return 'category';
    }
  }

  // Default to category if possible
  if (categoryWords.length >= 2) {
    return 'category';
  }

  return null;
}

/**
 * Select 3 words for bonus parts based on pattern
 */
function selectBonusWords(word: VocabularyWord, pattern: BonusPattern): VocabularyWord[] {
  const allWords = getAllWords();
  const words: VocabularyWord[] = [];

  switch (pattern) {
    case 'etymology': {
      if (word.etymology.roots.length === 0) return [];
      const rootId = word.etymology.roots[0].id;
      const rootWords = getWordsByRootId(rootId)
        .filter(w => w.id !== word.id)
        .slice(0, 3);
      words.push(...rootWords);
      break;
    }

    case 'synonym_antonym': {
      // Add word's synonyms from database
      for (const syn of word.synonyms) {
        if (words.length >= 3) break;
        const synWord = allWords.find(w =>
          w.word.toLowerCase() === syn.toLowerCase() && w.id !== word.id
        );
        if (synWord) words.push(synWord);
      }
      // Add word's antonyms from database
      if (word.antonyms) {
        for (const ant of word.antonyms) {
          if (words.length >= 3) break;
          const antWord = allWords.find(w =>
            w.word.toLowerCase() === ant.toLowerCase() && w.id !== word.id
          );
          if (antWord) words.push(antWord);
        }
      }
      break;
    }

    case 'category': {
      const categoryWords = allWords
        .filter(w => w.subcategory === word.subcategory && w.id !== word.id)
        .slice(0, 3);
      words.push(...categoryWords);
      break;
    }

    case 'word_forms': {
      // Look for related words that are different forms
      for (const related of word.relatedWords) {
        if (words.length >= 3) break;
        const relWord = allWords.find(w =>
          w.word.toLowerCase() === related.toLowerCase() && w.id !== word.id
        );
        if (relWord) words.push(relWord);
      }
      break;
    }
  }

  return words;
}

/**
 * Generate bonus parts from selected words
 */
function generateBonusParts(words: VocabularyWord[], pattern: BonusPattern): VocabularyBonusPart[] {
  return words.map((word, index) => {
    const { text, clueType } = generatePartQuestion(word, pattern, index);
    return {
      text,
      answer: word.word,
      acceptableAnswers: word.acceptableAnswers,
      pointValue: 10 as const,
      clueType,
    };
  });
}

/**
 * Generate question text for a bonus part
 */
function generatePartQuestion(
  word: VocabularyWord,
  _pattern: BonusPattern,
  index: number
): { text: string; clueType: ClueType } {
  // Vary the clue type by part for variety
  const clueTypes: ClueType[] = ['definition', 'common_synonym', 'usage_context'];
  const clueType = clueTypes[index % clueTypes.length];

  let text: string;

  switch (clueType) {
    case 'definition':
      text = `Name this ${word.partOfSpeech} meaning "${word.definition}".`;
      break;

    case 'common_synonym':
      if (word.synonyms.length > 0) {
        text = `This ${word.partOfSpeech}, synonymous with "${word.synonyms[0]}", means "${word.definition}".`;
      } else {
        text = `Name this ${word.partOfSpeech} meaning "${word.definition}".`;
      }
      break;

    case 'usage_context':
      if (word.exampleSentences.length > 0) {
        const blanked = word.exampleSentences[0].replace(
          new RegExp(word.word, 'gi'),
          '[BLANK]'
        );
        text = `Fill in the blank: "${blanked}"`;
      } else {
        text = `This ${word.partOfSpeech} describes ${word.definition.toLowerCase()}.`;
      }
      break;

    default:
      text = `Name this ${word.partOfSpeech} meaning "${word.definition}".`;
  }

  return { text, clueType };
}

/**
 * Generate lead-in text for the bonus
 */
function generateLeadin(word: VocabularyWord, pattern: BonusPattern): string {
  switch (pattern) {
    case 'etymology':
      if (word.etymology.roots.length > 0) {
        const root = word.etymology.roots[0];
        return `For 10 points each, answer these questions about words derived from the ${root.language} root "${root.root}" meaning "${root.meaning}".`;
      }
      return 'For 10 points each, answer these vocabulary questions.';

    case 'synonym_antonym':
      return `For 10 points each, identify these words related to "${word.word}".`;

    case 'category':
      return `For 10 points each, name these vocabulary words from the category of ${formatSubcategory(word.subcategory)}.`;

    case 'word_forms':
      return `For 10 points each, identify these words related to "${word.word}".`;

    default:
      return 'For 10 points each, answer these vocabulary questions.';
  }
}

/**
 * Format subcategory for display
 */
function formatSubcategory(subcategory: string): string {
  // Convert camelCase to spaces
  return subcategory
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase();
}

/**
 * Generate a bonus linked to a specific tossup
 */
export function generateLinkedBonus(
  tossupWord: VocabularyWord,
  tossupId: string,
  options: BonusGenerationOptions = {}
): VocabularyBonusQuestion | null {
  return generateVocabularyBonus(tossupWord, tossupId, options);
}

/**
 * Validate a generated bonus
 */
export function validateBonus(bonus: VocabularyBonusQuestion): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!bonus.id) errors.push('Missing id');
  if (!bonus.linkedTossupId) errors.push('Missing linkedTossupId');
  if (!bonus.leadin) errors.push('Missing leadin');

  // Check parts
  if (!bonus.parts || bonus.parts.length !== 3) {
    errors.push('Must have exactly 3 parts');
  } else {
    for (let i = 0; i < 3; i++) {
      const part = bonus.parts[i];
      if (!part.text) errors.push(`Part ${i + 1} missing text`);
      if (!part.answer) errors.push(`Part ${i + 1} missing answer`);
      if (part.pointValue !== 10) errors.push(`Part ${i + 1} point value must be 10`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
