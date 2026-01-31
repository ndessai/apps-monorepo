/**
 * Question Generators Exports
 */

// Clue Builder
export {
  buildPyramidalClues,
  assembleQuestionText,
  calculatePowerMarkPosition,
  buildExplanation,
} from './clue-builder';

// Tossup Generator
export {
  generateVocabularyTossup,
  generateTossupBatch,
  generateMixedDifficultyTossups,
  validateTossup,
  insertPowerMark,
  getPowerPortion,
  getNonPowerPortion,
} from './tossup-generator';

export type { TossupGenerationOptions } from './tossup-generator';

// Bonus Generator
export {
  generateVocabularyBonus,
  generateLinkedBonus,
  validateBonus,
} from './bonus-generator';

export type { BonusGenerationOptions } from './bonus-generator';

// Packet Generator
export {
  generateVocabularyQuizPacket,
  generateCategoryQuizPacket,
  generateBalancedQuizPacket,
  generateSampleQuiz,
} from './packet-generator';
