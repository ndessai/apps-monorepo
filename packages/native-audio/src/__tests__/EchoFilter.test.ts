/**
 * EchoFilter unit tests
 */

import { EchoFilter, createEchoFilter } from '../services/EchoFilter';

describe('EchoFilter', () => {
  describe('threshold consistency', () => {
    it('should filter when match ratio exceeds 40%', () => {
      const filter = new EchoFilter({
        primaryText: 'The quick brown fox jumps over the lazy dog',
      });

      // 5 matching words out of 5 = 100%
      const result = filter.filter('the quick brown fox jumps');
      expect(result.filtered).toBe(true);
      expect(result.reason).toBe('echo_detected');
      expect(result.matchRatio).toBeGreaterThan(0.4);
    });

    it('should not filter when match ratio is below 40%', () => {
      const filter = new EchoFilter({
        primaryText: 'The quick brown fox jumps over the lazy dog',
      });

      // Only 1 potential match out of 2 words
      const result = filter.filter('hello world');
      expect(result.filtered).toBe(false);
      expect(result.reason).toBe('no_echo');
    });

    it('should use configurable threshold', () => {
      const filter = new EchoFilter({
        primaryText: 'Hello world today',
        matchRatioThreshold: 0.8, // Higher threshold
      });

      // 50% match - below 80% threshold
      const result = filter.filter('hello there');
      expect(result.filtered).toBe(false);
    });

    it('should use default 40% threshold', () => {
      const filter = new EchoFilter({
        primaryText: 'one two three four five',
      });

      // 2 out of 4 = 50% > 40%
      const result = filter.filter('one two other words');
      expect(result.filtered).toBe(true);
    });
  });

  describe('preserved words', () => {
    it('should not filter speech containing preserved words', () => {
      const filter = new EchoFilter({
        primaryText: 'What is the capital of France?',
        preservedWords: ['buzz', 'stop', 'pause'],
      });

      const result = filter.filter('buzz');
      expect(result.filtered).toBe(false);
      expect(result.reason).toBe('preserved_word');
      expect(result.preservedWordMatch).toBe('buzz');
    });

    it('should not filter when preserved word is in longer text', () => {
      const filter = new EchoFilter({
        primaryText: 'What is the capital of France?',
        preservedWords: ['buzz'],
      });

      const result = filter.filter('buzz now');
      expect(result.filtered).toBe(false);
      expect(result.reason).toBe('preserved_word');
    });

    it('should use fuzzy matching for preserved words', () => {
      const filter = new EchoFilter({
        primaryText: 'What is the capital of France?',
        preservedWords: ['buzz'],
      });

      // "bus" is similar to "buzz" (0.75 similarity)
      const result = filter.filter('bus');
      expect(result.filtered).toBe(false);
      expect(result.reason).toBe('preserved_word');
    });

    it('should handle multiple preserved words', () => {
      const filter = new EchoFilter({
        primaryText: 'This is a test question',
        preservedWords: ['buzz', 'stop', 'pause'],
      });

      expect(filter.filter('stop').filtered).toBe(false);
      expect(filter.filter('pause').filtered).toBe(false);
      expect(filter.filter('stap').filtered).toBe(false); // Fuzzy match for stop
    });
  });

  describe('symmetric word filtering', () => {
    it('should apply minWordLength to both TTS and speech words', () => {
      const filter = new EchoFilter({
        primaryText: 'I am a cat',
        minWordLength: 2,
      });

      // "a" and "I" should be ignored in both texts
      // Only "am" and "cat" should be compared
      const result = filter.filter('am cat');
      // 2/2 = 100% match
      expect(result.filtered).toBe(true);
    });

    it('should ignore very short words in speech', () => {
      const filter = new EchoFilter({
        primaryText: 'The big brown dog',
        minWordLength: 2,
      });

      // "I" should be ignored, only "big" counted
      const result = filter.filter('I big');
      // 1/1 = 100% (only "big" counts)
      expect(result.matchCount).toBe(1);
      expect(result.totalWords).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should not filter when no TTS text provided', () => {
      const filter = new EchoFilter({
        primaryText: '',
      });

      const result = filter.filter('hello world');
      expect(result.filtered).toBe(false);
      expect(result.reason).toBe('no_filter_text');
    });

    it('should use fallback text when primary is empty', () => {
      const filter = new EchoFilter({
        primaryText: '',
        fallbackText: 'hello world',
      });

      const result = filter.filter('hello world');
      expect(result.filtered).toBe(true);
    });

    it('should not filter empty speech', () => {
      const filter = new EchoFilter({
        primaryText: 'Hello world',
      });

      const result = filter.filter('');
      expect(result.filtered).toBe(false);
      expect(result.reason).toBe('no_words');
    });

    it('should handle speech with only short words', () => {
      const filter = new EchoFilter({
        primaryText: 'Hello world',
        minWordLength: 5,
      });

      // All words are too short to count
      const result = filter.filter('a I me');
      expect(result.filtered).toBe(false);
      expect(result.reason).toBe('no_words');
    });
  });

  describe('fuzzy matching', () => {
    it('should match similar words', () => {
      const filter = new EchoFilter({
        primaryText: 'capital of France',
        wordSimilarityThreshold: 0.75,
      });

      // "capitol" is similar to "capital"
      const result = filter.filter('capitol france');
      expect(result.filtered).toBe(true);
    });

    it('should not match dissimilar words', () => {
      const filter = new EchoFilter({
        primaryText: 'capital of France',
        wordSimilarityThreshold: 0.75,
      });

      const result = filter.filter('London England');
      expect(result.filtered).toBe(false);
    });
  });

  describe('updateConfig', () => {
    it('should update primary text', () => {
      const filter = new EchoFilter({
        primaryText: 'Hello world',
      });

      filter.updateConfig({ primaryText: 'Goodbye world' });

      const result = filter.filter('goodbye world');
      expect(result.filtered).toBe(true);
    });

    it('should update preserved words', () => {
      const filter = new EchoFilter({
        primaryText: 'Hello world',
        preservedWords: ['buzz'],
      });

      filter.updateConfig({ preservedWords: ['stop'] });

      expect(filter.filter('buzz').reason).not.toBe('preserved_word');
      expect(filter.filter('stop').reason).toBe('preserved_word');
    });
  });

  describe('containsPreservedWord', () => {
    it('should return true when text contains preserved word', () => {
      const filter = new EchoFilter({
        primaryText: 'Hello world',
        preservedWords: ['buzz', 'stop'],
      });

      expect(filter.containsPreservedWord('please buzz now')).toBe(true);
      expect(filter.containsPreservedWord('stop reading')).toBe(true);
    });

    it('should return false when text does not contain preserved word', () => {
      const filter = new EchoFilter({
        primaryText: 'Hello world',
        preservedWords: ['buzz'],
      });

      expect(filter.containsPreservedWord('hello there')).toBe(false);
    });
  });

  describe('createEchoFilter helper', () => {
    it('should create filter with primary text', () => {
      const filter = createEchoFilter('Hello world');
      const result = filter.filter('hello world');
      expect(result.filtered).toBe(true);
    });

    it('should accept options', () => {
      const filter = createEchoFilter('Hello world', {
        preservedWords: ['buzz'],
      });

      expect(filter.filter('buzz').filtered).toBe(false);
    });
  });
});
