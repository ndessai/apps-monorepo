/**
 * Utility exports
 */

export {
  stripHtml,
  stripHtmlPreservePowerMark,
  cleanAnswerText,
  removePronunciationGuides,
  normalizeText,
} from './html-stripper.js';

export {
  calculatePowerMarkPosition,
  validatePowerMarkPosition,
  adjustToWordBoundary,
} from './power-mark.js';

export {
  parseAnswer,
  parseSimpleAnswer,
  combineAcceptableAnswers,
} from './answer-parser.js';
