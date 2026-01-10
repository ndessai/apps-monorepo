/**
 * AI Generator module exports
 */

export {
  SYSTEM_PROMPT,
  DIFFICULTY_DESCRIPTIONS,
  getTossupPrompt,
  getBonusPrompt,
  getBatchTossupPrompt,
  getValidationPrompt,
} from './prompts.js';

export {
  HUMAN_BODY_TOPICS,
  getSubcategoryTopics,
  getAllSubcategories,
  getTotalTopicCount,
  getAllTopicsFlat,
  getTopicsForDifficulty,
} from './human-body-topics.js';

export {
  generateTossup,
  generateBonus,
  generateAllHumanBodyQuestions,
} from './generator.js';
