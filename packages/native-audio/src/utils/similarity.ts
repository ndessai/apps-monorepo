/**
 * String Similarity Utilities
 *
 * Functions for calculating string similarity using Levenshtein distance.
 */

/**
 * Calculate similarity between two strings using Levenshtein distance
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score between 0 (completely different) and 1 (identical)
 *
 * @example
 * calculateSimilarity('buzz', 'buzz') // 1.0
 * calculateSimilarity('buzz', 'bus')  // 0.75
 * calculateSimilarity('hello', 'world') // ~0.2
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Create Levenshtein distance matrix
  const matrix: number[][] = [];

  // Initialize first column
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }

  // Initialize first row
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  // Convert distance to similarity (0-1)
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - matrix[s1.length][s2.length] / maxLen;
}

/**
 * Calculate Levenshtein distance between two strings
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Number of single-character edits needed to transform str1 to str2
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[s1.length][s2.length];
}

/**
 * Check if two words match using fuzzy comparison
 *
 * @param word1 - First word
 * @param word2 - Second word
 * @param threshold - Minimum similarity score to consider a match (default: 0.75)
 * @returns True if words match (exact or fuzzy)
 */
export function wordsMatch(word1: string, word2: string, threshold: number = 0.75): boolean {
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();

  if (w1 === w2) return true;
  return calculateSimilarity(w1, w2) >= threshold;
}

/**
 * Check if text contains any of the given words (with fuzzy matching)
 *
 * @param text - Text to search in
 * @param targetWords - Words to search for
 * @param threshold - Minimum similarity score (default: 0.7)
 * @returns Object with match result and the matched word
 */
export function containsAnyWord(
  text: string,
  targetWords: string[],
  threshold: number = 0.7
): { matches: boolean; matchedWord?: string; foundWord?: string } {
  const textWords = text.toLowerCase().split(/\s+/);

  for (const textWord of textWords) {
    // Exact match first
    for (const target of targetWords) {
      if (textWord === target.toLowerCase()) {
        return { matches: true, matchedWord: target, foundWord: textWord };
      }
    }

    // Fuzzy match
    for (const target of targetWords) {
      if (calculateSimilarity(textWord, target) >= threshold) {
        return { matches: true, matchedWord: target, foundWord: textWord };
      }
    }
  }

  return { matches: false };
}
