/**
 * Vocabulary Quiz Type Exports
 */

// Etymology types
export type {
  OriginLanguage,
  RootInfo,
  PrefixInfo,
  SuffixInfo,
  EtymologyInfo,
} from './etymology';

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
} from './categories';

export {
  CATEGORY_SUBCATEGORY_MAP,
  VOCABULARY_CATEGORIES,
} from './categories';

// Vocabulary types
export type {
  PartOfSpeech,
  QuestionDifficulty,
  VocabularyWord,
  WordFamily,
  ThematicWordGroup,
  WordDatabaseStats,
} from './vocabulary';

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
} from './questions';
