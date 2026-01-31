/**
 * Vocabulary Words Database Exports
 */

import type { VocabularyWord, VocabularyCategory, VocabularySubcategory, QuestionDifficulty } from '../../types';
import { HUMAN_BEHAVIOR_WORDS } from './human-behavior';
import { EMOTIONS_FEELINGS_WORDS } from './emotions-feelings';
import { MEDICAL_SCIENTIFIC_WORDS } from './medical-scientific';
import { LITERARY_ARTISTIC_WORDS } from './literary-artistic';
import { ABSTRACT_CONCEPTS_WORDS } from './abstract-concepts';
import { ACTIONS_VERBS_WORDS } from './actions-verbs';

// Re-export category-specific data
export { HUMAN_BEHAVIOR_WORDS } from './human-behavior';
export { EMOTIONS_FEELINGS_WORDS } from './emotions-feelings';
export { MEDICAL_SCIENTIFIC_WORDS } from './medical-scientific';
export { LITERARY_ARTISTIC_WORDS } from './literary-artistic';
export { ABSTRACT_CONCEPTS_WORDS } from './abstract-concepts';
export { ACTIONS_VERBS_WORDS } from './actions-verbs';

/** Get all vocabulary words */
export function getAllWords(): VocabularyWord[] {
  return [
    ...HUMAN_BEHAVIOR_WORDS,
    ...EMOTIONS_FEELINGS_WORDS,
    ...MEDICAL_SCIENTIFIC_WORDS,
    ...LITERARY_ARTISTIC_WORDS,
    ...ABSTRACT_CONCEPTS_WORDS,
    ...ACTIONS_VERBS_WORDS,
  ];
}

/** Get words by category */
export function getWordsByCategory(category: VocabularyCategory): VocabularyWord[] {
  switch (category) {
    case 'HumanBehavior':
      return HUMAN_BEHAVIOR_WORDS;
    case 'EmotionsFeelings':
      return EMOTIONS_FEELINGS_WORDS;
    case 'MedicalScientific':
      return MEDICAL_SCIENTIFIC_WORDS;
    case 'LiteraryArtistic':
      return LITERARY_ARTISTIC_WORDS;
    case 'AbstractConcepts':
      return ABSTRACT_CONCEPTS_WORDS;
    case 'ActionsVerbs':
      return ACTIONS_VERBS_WORDS;
    default:
      return [];
  }
}

/** Get words by subcategory */
export function getWordsBySubcategory(subcategory: VocabularySubcategory): VocabularyWord[] {
  return getAllWords().filter(word => word.subcategory === subcategory);
}

/** Get words by difficulty */
export function getWordsByDifficulty(difficulty: QuestionDifficulty): VocabularyWord[] {
  return getAllWords().filter(word => word.difficulty === difficulty);
}

/** Get a word by ID */
export function getWordById(id: string): VocabularyWord | undefined {
  return getAllWords().find(word => word.id === id);
}

/** Get words by root ID */
export function getWordsByRootId(rootId: string): VocabularyWord[] {
  return getAllWords().filter(word =>
    word.etymology.roots.some(root => root.id === rootId)
  );
}

/** Search words by term (matches word, definition, or synonyms) */
export function searchWords(term: string): VocabularyWord[] {
  const normalized = term.toLowerCase();
  return getAllWords().filter(word =>
    word.word.toLowerCase().includes(normalized) ||
    word.definition.toLowerCase().includes(normalized) ||
    word.synonyms.some(syn => syn.toLowerCase().includes(normalized))
  );
}

/** Get word database statistics */
export function getWordDatabaseStats() {
  const words = getAllWords();
  const byCategory: Record<VocabularyCategory, number> = {
    HumanBehavior: HUMAN_BEHAVIOR_WORDS.length,
    EmotionsFeelings: EMOTIONS_FEELINGS_WORDS.length,
    MedicalScientific: MEDICAL_SCIENTIFIC_WORDS.length,
    LiteraryArtistic: LITERARY_ARTISTIC_WORDS.length,
    AbstractConcepts: ABSTRACT_CONCEPTS_WORDS.length,
    ActionsVerbs: ACTIONS_VERBS_WORDS.length,
  };

  const byDifficulty: Record<QuestionDifficulty, number> = {
    middle_school: words.filter(w => w.difficulty === 'middle_school').length,
    high_school: words.filter(w => w.difficulty === 'high_school').length,
    college: words.filter(w => w.difficulty === 'college').length,
    open: words.filter(w => w.difficulty === 'open').length,
  };

  return {
    totalWords: words.length,
    byCategory,
    byDifficulty,
  };
}
