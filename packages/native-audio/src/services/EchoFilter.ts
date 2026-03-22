/**
 * EchoFilter - TTS Echo Filtering
 *
 * Filters out speech recognition results that match the currently playing TTS text.
 * This prevents the system from interpreting the TTS output as user input.
 *
 * Features:
 * - Configurable match ratio threshold (default 40%)
 * - Symmetric word length filtering (applies to both TTS and speech words)
 * - Preserved words bypass (e.g., command words like "buzz")
 * - Fuzzy matching using Levenshtein distance
 *
 * @example
 * ```typescript
 * const filter = new EchoFilter({
 *   primaryText: 'What is the capital of France?',
 *   preservedWords: ['buzz', 'stop', 'pause'],
 * });
 *
 * filter.filter('capital of France') // { filtered: true, ... }
 * filter.filter('buzz')              // { filtered: false, reason: 'preserved_word' }
 * filter.filter('Paris')             // { filtered: false, reason: 'no_echo' }
 * ```
 */

import { calculateSimilarity } from '../utils/similarity';
import { extractWords } from '../utils/wordBoundary';

/**
 * Configuration for the echo filter
 */
export interface EchoFilterConfig {
  /** Primary text to filter against (current TTS text) */
  primaryText: string;
  /** Secondary text for fallback (last spoken text) */
  fallbackText?: string;
  /** Words that bypass filtering (e.g., command words) */
  preservedWords?: string[];
  /** Match ratio threshold (default 0.4 = 40%). Filter if match ratio exceeds this. */
  matchRatioThreshold?: number;
  /** Word similarity threshold for fuzzy matching (default 0.75) */
  wordSimilarityThreshold?: number;
  /** Minimum word length for comparison (default 2) */
  minWordLength?: number;
}

/**
 * Result of filtering a speech text
 */
export interface EchoFilterResult {
  /** Whether the text was filtered out */
  filtered: boolean;
  /** The resulting text (empty if filtered) */
  text: string;
  /** Reason for the filter decision */
  reason:
    | 'preserved_word' // Contains a preserved word - bypassed filter
    | 'no_filter_text' // No TTS text to filter against
    | 'no_words' // Text has no significant words
    | 'echo_detected' // Filtered as TTS echo
    | 'no_echo'; // Not an echo - passed through
  /** Match ratio if echo detection was attempted */
  matchRatio?: number;
  /** Number of matching words */
  matchCount?: number;
  /** Total significant words in speech */
  totalWords?: number;
  /** The preserved word that triggered bypass (if applicable) */
  preservedWordMatch?: string;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  matchRatioThreshold: 0.4, // 40% - Filter if more than 40% of words match
  wordSimilarityThreshold: 0.75, // 75% similarity for fuzzy word matching
  minWordLength: 2, // Ignore words shorter than 2 characters
} as const;

/**
 * EchoFilter class
 *
 * Stateless filter that can be configured and used to filter speech text.
 */
export class EchoFilter {
  private config: Required<EchoFilterConfig>;

  constructor(config: EchoFilterConfig) {
    this.config = {
      primaryText: config.primaryText,
      fallbackText: config.fallbackText ?? '',
      preservedWords: config.preservedWords ?? [],
      matchRatioThreshold: config.matchRatioThreshold ?? DEFAULT_CONFIG.matchRatioThreshold,
      wordSimilarityThreshold: config.wordSimilarityThreshold ?? DEFAULT_CONFIG.wordSimilarityThreshold,
      minWordLength: config.minWordLength ?? DEFAULT_CONFIG.minWordLength,
    };
  }

  /**
   * Update the filter configuration
   */
  updateConfig(config: Partial<EchoFilterConfig>): void {
    if (config.primaryText !== undefined) {
      this.config.primaryText = config.primaryText;
    }
    if (config.fallbackText !== undefined) {
      this.config.fallbackText = config.fallbackText;
    }
    if (config.preservedWords !== undefined) {
      this.config.preservedWords = config.preservedWords;
    }
    if (config.matchRatioThreshold !== undefined) {
      this.config.matchRatioThreshold = config.matchRatioThreshold;
    }
    if (config.wordSimilarityThreshold !== undefined) {
      this.config.wordSimilarityThreshold = config.wordSimilarityThreshold;
    }
    if (config.minWordLength !== undefined) {
      this.config.minWordLength = config.minWordLength;
    }
  }

  /**
   * Filter speech text against TTS text
   *
   * @param speechText - The text recognized by speech recognition
   * @returns Filter result with decision and metadata
   */
  filter(speechText: string): EchoFilterResult {
    // 1. Check for preserved words FIRST
    const preservedMatch = this.findPreservedWord(speechText);
    if (preservedMatch) {
      return {
        filtered: false,
        text: speechText,
        reason: 'preserved_word',
        preservedWordMatch: preservedMatch,
      };
    }

    // 2. Get the TTS text to filter against
    const ttsText = this.config.primaryText || this.config.fallbackText;
    if (!ttsText) {
      return {
        filtered: false,
        text: speechText,
        reason: 'no_filter_text',
      };
    }

    // 3. Extract words (symmetric - apply minWordLength to both)
    const speechWords = this.extractSignificantWords(speechText);
    const ttsWords = this.extractSignificantWords(ttsText);

    if (speechWords.length === 0 || ttsWords.length === 0) {
      return {
        filtered: false,
        text: speechText,
        reason: 'no_words',
      };
    }

    // 4. Count matches using fuzzy comparison
    let matchCount = 0;
    for (const speechWord of speechWords) {
      for (const ttsWord of ttsWords) {
        if (this.wordsMatch(speechWord, ttsWord)) {
          matchCount++;
          break; // Only count each speech word once
        }
      }
    }

    // 5. Calculate match ratio and compare to threshold
    const matchRatio = matchCount / speechWords.length;
    const shouldFilter = matchRatio > this.config.matchRatioThreshold;

    return {
      filtered: shouldFilter,
      text: shouldFilter ? '' : speechText,
      reason: shouldFilter ? 'echo_detected' : 'no_echo',
      matchRatio,
      matchCount,
      totalWords: speechWords.length,
    };
  }

  /**
   * Extract significant words from text (words >= minWordLength)
   */
  private extractSignificantWords(text: string): string[] {
    return extractWords(text, this.config.minWordLength);
  }

  /**
   * Check if two words match (exact or fuzzy)
   */
  private wordsMatch(word1: string, word2: string): boolean {
    if (word1 === word2) return true;
    return calculateSimilarity(word1, word2) >= this.config.wordSimilarityThreshold;
  }

  /**
   * Find if text contains a preserved word
   * Returns the matched preserved word or null
   */
  private findPreservedWord(text: string): string | null {
    if (this.config.preservedWords.length === 0) {
      return null;
    }

    const words = text.toLowerCase().split(/\s+/);

    for (const word of words) {
      // Exact match first
      for (const preserved of this.config.preservedWords) {
        if (word === preserved.toLowerCase()) {
          return preserved;
        }
      }

      // Fuzzy match (use lower threshold for command words - 0.7)
      for (const preserved of this.config.preservedWords) {
        if (calculateSimilarity(word, preserved) >= 0.7) {
          return preserved;
        }
      }
    }

    return null;
  }

  /**
   * Check if text contains any preserved word
   */
  containsPreservedWord(text: string): boolean {
    return this.findPreservedWord(text) !== null;
  }

  /**
   * Get current filter configuration
   */
  getConfig(): Readonly<Required<EchoFilterConfig>> {
    return { ...this.config };
  }
}

/**
 * Create an EchoFilter with default settings
 */
export function createEchoFilter(
  primaryText: string,
  options?: Partial<Omit<EchoFilterConfig, 'primaryText'>>
): EchoFilter {
  return new EchoFilter({
    primaryText,
    ...options,
  });
}
