/**
 * Word Boundary Utilities
 *
 * Functions for detecting word boundaries and extracting words from text.
 */

/**
 * Characters that define word boundaries
 */
const WORD_BOUNDARY_CHARS = /[\s.,!?;:'"()\-—–\n\r\t]/;

/**
 * Check if a character is a word boundary (space or punctuation)
 *
 * @param char - Single character to check
 * @returns True if the character is a word boundary
 */
export function isWordBoundary(char: string): boolean {
  return WORD_BOUNDARY_CHARS.test(char);
}

/**
 * Extract words from text
 *
 * @param text - Text to extract words from
 * @param minLength - Minimum word length to include (default: 0)
 * @returns Array of words
 */
export function extractWords(text: string, minLength: number = 0): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length >= minLength);
}

/**
 * Get word boundaries (start indices) in text
 *
 * @param text - Text to analyze
 * @returns Array of character indices where words start
 */
export function getWordBoundaries(text: string): number[] {
  const boundaries: number[] = [];
  let inWord = false;

  for (let i = 0; i < text.length; i++) {
    const isBoundary = isWordBoundary(text[i]);

    if (!isBoundary && !inWord) {
      // Start of a new word
      boundaries.push(i);
      inWord = true;
    } else if (isBoundary) {
      inWord = false;
    }
  }

  return boundaries;
}

/**
 * Find the word at a given character index
 *
 * @param text - Text to search in
 * @param charIndex - Character index
 * @returns Object with word, start index, and word index
 */
export function getWordAtIndex(
  text: string,
  charIndex: number
): { word: string; startIndex: number; wordIndex: number } | null {
  if (charIndex < 0 || charIndex >= text.length) {
    return null;
  }

  const boundaries = getWordBoundaries(text);

  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i];

    // Find where this word ends (before the next boundary)
    let wordEnd = start;
    while (wordEnd < text.length && !isWordBoundary(text[wordEnd])) {
      wordEnd++;
    }

    if (charIndex >= start && charIndex < wordEnd) {
      return {
        word: text.slice(start, wordEnd),
        startIndex: start,
        wordIndex: i,
      };
    }
  }

  return null;
}

/**
 * Calculate word index from character index
 *
 * @param text - Text to analyze
 * @param charIndex - Character index
 * @returns Word index (0-based) or -1 if not in a word
 */
export function charIndexToWordIndex(text: string, charIndex: number): number {
  const wordInfo = getWordAtIndex(text, charIndex);
  return wordInfo?.wordIndex ?? -1;
}

/**
 * Find the next word boundary after a character index
 *
 * @param text - Text to search in
 * @param charIndex - Starting character index
 * @returns Index of next word boundary, or text length if none found
 */
export function findNextWordBoundary(text: string, charIndex: number): number {
  for (let i = charIndex; i < text.length; i++) {
    if (isWordBoundary(text[i])) {
      return i;
    }
  }
  return text.length;
}

/**
 * Count total words in text
 *
 * @param text - Text to count words in
 * @returns Number of words
 */
export function countWords(text: string): number {
  return extractWords(text, 1).length;
}
