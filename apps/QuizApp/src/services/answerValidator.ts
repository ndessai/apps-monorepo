/**
 * Answer Validation Service
 *
 * Provides fuzzy matching for quiz answers using Levenshtein distance algorithm.
 * Accepts answers that are 80% similar to any acceptable answer.
 */

/**
 * Calculate Levenshtein distance between two strings
 * @param str1 First string
 * @param str2 Second string
 * @returns Edit distance (number of changes needed)
 */
export function calculateLevenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create 2D array for dynamic programming
  const matrix: number[][] = [];

  // Initialize first column and row
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Normalize an answer string for comparison
 * - Trim whitespace
 * - Convert to lowercase
 * - Remove punctuation and special characters
 * - Collapse multiple spaces to single space
 */
export function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ');   // Collapse whitespace
}

/**
 * Calculate similarity score between two strings (0-1)
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity score (1 = identical, 0 = completely different)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const distance = calculateLevenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  if (maxLength === 0) {
    return 1; // Both strings are empty
  }

  return 1 - distance / maxLength;
}

/**
 * Validate a user's answer against acceptable answers
 * Uses fuzzy matching with 80% similarity threshold
 *
 * @param userAnswer The user's submitted answer
 * @param acceptableAnswers Array of acceptable answers
 * @param threshold Similarity threshold (default 0.8 = 80%)
 * @returns true if answer is acceptable, false otherwise
 */
export function validateAnswer(
  userAnswer: string,
  acceptableAnswers: string[],
  threshold: number = 0.8
): boolean {
  // Normalize user answer
  const normalizedUserAnswer = normalizeAnswer(userAnswer);

  // Empty answer is always wrong
  if (normalizedUserAnswer.length === 0) {
    return false;
  }

  // Check against each acceptable answer
  for (const acceptableAnswer of acceptableAnswers) {
    const normalizedAcceptable = normalizeAnswer(acceptableAnswer);

    // Exact match
    if (normalizedUserAnswer === normalizedAcceptable) {
      return true;
    }

    // Fuzzy match
    const similarity = calculateSimilarity(
      normalizedUserAnswer,
      normalizedAcceptable
    );

    if (similarity >= threshold) {
      return true;
    }

    // Check if user answer is contained in acceptable answer
    // (e.g., "Washington" is acceptable for "George Washington")
    if (normalizedAcceptable.includes(normalizedUserAnswer)) {
      return true;
    }

    // Check if acceptable answer is contained in user answer
    // (e.g., "George Washington" is acceptable for "Washington")
    if (normalizedUserAnswer.includes(normalizedAcceptable)) {
      return true;
    }
  }

  return false;
}

/**
 * Get the best matching acceptable answer for a user answer
 * Useful for showing which answer was closest
 *
 * @param userAnswer The user's submitted answer
 * @param acceptableAnswers Array of acceptable answers
 * @returns The best matching acceptable answer and its similarity score
 */
export function getBestMatch(
  userAnswer: string,
  acceptableAnswers: string[]
): { answer: string; similarity: number } {
  const normalizedUserAnswer = normalizeAnswer(userAnswer);

  let bestMatch = acceptableAnswers[0];
  let bestSimilarity = 0;

  for (const acceptableAnswer of acceptableAnswers) {
    const normalizedAcceptable = normalizeAnswer(acceptableAnswer);
    const similarity = calculateSimilarity(
      normalizedUserAnswer,
      normalizedAcceptable
    );

    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = acceptableAnswer;
    }
  }

  return { answer: bestMatch, similarity: bestSimilarity };
}
