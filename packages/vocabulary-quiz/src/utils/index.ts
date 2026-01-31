/**
 * Utility Functions Exports
 */

// Search utilities
export {
  search,
  getAutocompleteSuggestions,
  findSimilarWords,
} from './search';

export type {
  SearchResultType,
  SearchResult,
  SearchOptions,
} from './search';

// Re-export clue builder utilities (they're also useful as utilities)
export {
  calculatePowerMarkPosition,
  buildExplanation,
} from '../generators/clue-builder';
