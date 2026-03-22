/**
 * Similarity utility tests
 */

import {
  calculateSimilarity,
  levenshteinDistance,
  wordsMatch,
  containsAnyWord,
} from '../utils/similarity';

describe('calculateSimilarity', () => {
  it('should return 1 for identical strings', () => {
    expect(calculateSimilarity('hello', 'hello')).toBe(1);
    expect(calculateSimilarity('buzz', 'buzz')).toBe(1);
  });

  it('should return 0 for empty strings', () => {
    expect(calculateSimilarity('hello', '')).toBe(0);
    expect(calculateSimilarity('', 'hello')).toBe(0);
  });

  it('should be case insensitive', () => {
    expect(calculateSimilarity('Hello', 'hello')).toBe(1);
    expect(calculateSimilarity('BUZZ', 'buzz')).toBe(1);
  });

  it('should calculate similarity for similar words', () => {
    // "buzz" vs "bus" - 1 deletion = distance 1, max len 4 = 0.75 similarity
    expect(calculateSimilarity('buzz', 'bus')).toBe(0.75);

    // "buzz" vs "buz" - 1 deletion = distance 1, max len 4 = 0.75 similarity
    expect(calculateSimilarity('buzz', 'buz')).toBe(0.75);
  });

  it('should return low similarity for different words', () => {
    expect(calculateSimilarity('hello', 'world')).toBeLessThan(0.5);
    expect(calculateSimilarity('cat', 'dog')).toBeLessThan(0.5);
  });
});

describe('levenshteinDistance', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
  });

  it('should return string length for empty comparison', () => {
    expect(levenshteinDistance('hello', '')).toBe(5);
    expect(levenshteinDistance('', 'hello')).toBe(5);
  });

  it('should calculate correct distance for substitutions', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1);
    expect(levenshteinDistance('cat', 'cut')).toBe(1);
  });

  it('should calculate correct distance for insertions/deletions', () => {
    expect(levenshteinDistance('cat', 'cats')).toBe(1);
    expect(levenshteinDistance('cats', 'cat')).toBe(1);
  });

  it('should handle multiple edits', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
  });
});

describe('wordsMatch', () => {
  it('should match identical words', () => {
    expect(wordsMatch('hello', 'hello')).toBe(true);
  });

  it('should match with default threshold (0.75)', () => {
    expect(wordsMatch('buzz', 'bus')).toBe(true);
    expect(wordsMatch('buzz', 'buz')).toBe(true);
  });

  it('should not match dissimilar words', () => {
    expect(wordsMatch('hello', 'world')).toBe(false);
  });

  it('should respect custom threshold', () => {
    // "buzz" vs "bus" = 0.75 similarity
    expect(wordsMatch('buzz', 'bus', 0.8)).toBe(false);
    expect(wordsMatch('buzz', 'bus', 0.7)).toBe(true);
  });
});

describe('containsAnyWord', () => {
  it('should find exact matches', () => {
    const result = containsAnyWord('please buzz now', ['buzz', 'stop']);
    expect(result.matches).toBe(true);
    expect(result.matchedWord).toBe('buzz');
    expect(result.foundWord).toBe('buzz');
  });

  it('should find fuzzy matches', () => {
    const result = containsAnyWord('please bus now', ['buzz', 'stop']);
    expect(result.matches).toBe(true);
    expect(result.matchedWord).toBe('buzz');
    expect(result.foundWord).toBe('bus');
  });

  it('should return no match when none found', () => {
    const result = containsAnyWord('hello world', ['buzz', 'stop']);
    expect(result.matches).toBe(false);
    expect(result.matchedWord).toBeUndefined();
  });

  it('should respect custom threshold', () => {
    // "bus" vs "buzz" = 0.75
    const strictResult = containsAnyWord('bus', ['buzz'], 0.8);
    expect(strictResult.matches).toBe(false);

    const lenientResult = containsAnyWord('bus', ['buzz'], 0.7);
    expect(lenientResult.matches).toBe(true);
  });

  it('should prioritize exact matches', () => {
    const result = containsAnyWord('stop now', ['buzz', 'stop']);
    expect(result.matches).toBe(true);
    expect(result.matchedWord).toBe('stop');
  });
});
