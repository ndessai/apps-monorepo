/**
 * @monorepo/vocabulary-quiz
 *
 * NAQT-style vocabulary quiz package based on:
 * - Word Power Made Easy (Norman Lewis)
 * - Six Weeks to Words of Power (Wilfred Funk)
 *
 * Features:
 * - Etymology-based vocabulary learning
 * - Pyramidal tossup question generation
 * - 3-part bonus question generation
 * - Etymology browser (root explorer, word families, etymology graph)
 * - Word database organized by categories
 */

// ============================================
// TYPE EXPORTS
// ============================================

// Etymology types
export type {
  OriginLanguage,
  RootInfo,
  PrefixInfo,
  SuffixInfo,
  EtymologyInfo,
} from './types';

// Category types
export type {
  VocabularyCategory,
  VocabularySubcategory,
  HumanBehaviorSubcategory,
  EmotionsFeelingsSubcategory,
  MedicalScientificSubcategory,
  LiteraryArtisticSubcategory,
  AbstractConceptsSubcategory,
  ActionsVerbsSubcategory,
  SubcategoryDefinition,
  CategoryDefinition,
} from './types';

export {
  CATEGORY_SUBCATEGORY_MAP,
  VOCABULARY_CATEGORIES,
} from './types';

// Vocabulary types
export type {
  PartOfSpeech,
  QuestionDifficulty,
  VocabularyWord,
  WordFamily,
  ThematicWordGroup,
  WordDatabaseStats,
} from './types';

// Question types
export type {
  QuestionSource,
  ClueType,
  VocabularyClue,
  VocabularyTossupQuestion,
  VocabularyBonusPart,
  BonusPattern,
  VocabularyBonusQuestion,
  VocabularyQuizData,
  QuizGenerationOptions,
} from './types';

// ============================================
// DATA EXPORTS
// ============================================

// Root data
export {
  LATIN_ROOTS,
  GREEK_ROOTS,
  PREFIXES,
  SUFFIXES,
  getAllRoots,
  getRootById,
  getRootsByWord,
  getRootsByRootString,
  getLatinRootById,
  getLatinRootsByRoot,
  getLatinRootsByWord,
  getGreekRootById,
  getGreekRootsByRoot,
  getGreekRootsByWord,
  getPrefixById,
  getPrefixesByPrefix,
  getSuffixById,
  getSuffixesBySuffix,
  getSuffixesByPartOfSpeech,
} from './data/roots';

// Word data
export {
  HUMAN_BEHAVIOR_WORDS,
  getAllWords,
  getWordsByCategory,
  getWordsBySubcategory,
  getWordsByDifficulty,
  getWordById,
  getWordsByRootId,
  searchWords,
  getWordDatabaseStats,
} from './data/words';

// ============================================
// ETYMOLOGY BROWSER EXPORTS
// ============================================

// Root Explorer
export {
  exploreRoot,
  searchRoots,
  getRootsByLanguage,
  getAllAvailableRoots,
  getRootsByFirstLetter,
  getMostProductiveRoots,
  getRootDatabaseStats,
} from './browser';

export type {
  RootWithWords,
  RootExplorationResult,
} from './browser';

// Word Family
export {
  getWordFamily,
  getAllWordFamilies,
  findConnectionPath,
  getBridgeWords,
} from './browser';

export type {
  ConnectionType,
  WordConnection,
  WordFamilyResult,
} from './browser';

// Etymology Graph
export {
  buildEtymologyGraph,
  getRootSubgraph,
  getWordSubgraph,
  exportGraphForVisualization,
} from './browser';

export type {
  NodeType,
  EtymologyNode,
  EdgeType,
  EtymologyEdge,
  EtymologyGraph,
} from './browser';

// ============================================
// GENERATOR EXPORTS
// ============================================

// Clue Builder
export {
  buildPyramidalClues,
  assembleQuestionText,
  calculatePowerMarkPosition,
  buildExplanation,
} from './generators';

// Tossup Generator
export {
  generateVocabularyTossup,
  generateTossupBatch,
  generateMixedDifficultyTossups,
  validateTossup,
  insertPowerMark,
  getPowerPortion,
  getNonPowerPortion,
} from './generators';

export type { TossupGenerationOptions } from './generators';

// Bonus Generator
export {
  generateVocabularyBonus,
  generateLinkedBonus,
  validateBonus,
} from './generators';

export type { BonusGenerationOptions } from './generators';

// Packet Generator
export {
  generateVocabularyQuizPacket,
  generateCategoryQuizPacket,
  generateBalancedQuizPacket,
  generateSampleQuiz,
} from './generators';

// ============================================
// UTILITY EXPORTS
// ============================================

export {
  search,
  getAutocompleteSuggestions,
  findSimilarWords,
} from './utils';

export type {
  SearchResultType,
  SearchResult,
  SearchOptions,
} from './utils';
