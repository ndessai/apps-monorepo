/**
 * Search Utilities
 * Search functions for words and roots
 */

import type { VocabularyWord, RootInfo, VocabularyCategory, QuestionDifficulty } from '../types';
import { getAllWords } from '../data/words';
import { getAllRoots } from '../data/roots';

/** Search result types */
export type SearchResultType = 'word' | 'root' | 'prefix' | 'suffix';

/** Unified search result */
export interface SearchResult {
  type: SearchResultType;
  id: string;
  label: string;
  description: string;
  data: VocabularyWord | RootInfo;
  relevanceScore: number;
}

/** Search options */
export interface SearchOptions {
  /** Types of results to include */
  types?: SearchResultType[];
  /** Maximum results */
  limit?: number;
  /** Filter by category */
  category?: VocabularyCategory;
  /** Filter by difficulty */
  difficulty?: QuestionDifficulty;
}

const DEFAULT_SEARCH_OPTIONS: Required<SearchOptions> = {
  types: ['word', 'root'],
  limit: 20,
  category: undefined as unknown as VocabularyCategory,
  difficulty: undefined as unknown as QuestionDifficulty,
};

/**
 * Unified search across words and roots
 */
export function search(query: string, options: SearchOptions = {}): SearchResult[] {
  const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
  const normalized = query.toLowerCase().trim();

  if (!normalized) return [];

  const results: SearchResult[] = [];

  // Search words
  if (opts.types?.includes('word')) {
    const wordResults = searchWords(normalized, opts);
    results.push(...wordResults);
  }

  // Search roots
  if (opts.types?.includes('root')) {
    const rootResults = searchRoots(normalized);
    results.push(...rootResults);
  }

  // Sort by relevance and limit
  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, opts.limit);
}

/**
 * Search words by query
 */
function searchWords(query: string, options: SearchOptions): SearchResult[] {
  let words = getAllWords();

  // Apply filters
  if (options.category) {
    words = words.filter(w => w.category === options.category);
  }
  if (options.difficulty) {
    words = words.filter(w => w.difficulty === options.difficulty);
  }

  const results: SearchResult[] = [];

  for (const word of words) {
    const score = calculateWordRelevance(word, query);
    if (score > 0) {
      results.push({
        type: 'word',
        id: word.id,
        label: word.word,
        description: word.definition,
        data: word,
        relevanceScore: score,
      });
    }
  }

  return results;
}

/**
 * Search roots by query
 */
function searchRoots(query: string): SearchResult[] {
  const roots = getAllRoots();

  const results: SearchResult[] = [];

  for (const root of roots) {
    const score = calculateRootRelevance(root, query);
    if (score > 0) {
      results.push({
        type: 'root',
        id: root.id,
        label: root.root,
        description: `${root.language}: ${root.meaning}`,
        data: root,
        relevanceScore: score,
      });
    }
  }

  return results;
}

/**
 * Calculate relevance score for a word
 */
function calculateWordRelevance(word: VocabularyWord, query: string): number {
  let score = 0;

  // Exact word match (highest)
  if (word.word.toLowerCase() === query) {
    score += 100;
  } else if (word.word.toLowerCase().startsWith(query)) {
    score += 80;
  } else if (word.word.toLowerCase().includes(query)) {
    score += 50;
  }

  // Definition match
  if (word.definition.toLowerCase().includes(query)) {
    score += 30;
  }

  // Synonym match
  if (word.synonyms.some(s => s.toLowerCase().includes(query))) {
    score += 25;
  }

  // Root match
  if (word.etymology.roots.some(r =>
    r.root.toLowerCase().includes(query) ||
    r.meaning.toLowerCase().includes(query)
  )) {
    score += 20;
  }

  return score;
}

/**
 * Calculate relevance score for a root
 */
function calculateRootRelevance(root: RootInfo, query: string): number {
  let score = 0;

  // Exact root match (highest)
  if (root.root.toLowerCase() === query) {
    score += 100;
  } else if (root.root.toLowerCase().startsWith(query)) {
    score += 80;
  } else if (root.root.toLowerCase().includes(query)) {
    score += 50;
  }

  // Variant match
  if (root.variants?.some(v => v.toLowerCase().includes(query))) {
    score += 60;
  }

  // Meaning match
  if (root.meaning.toLowerCase().includes(query)) {
    score += 40;
  }

  // Example word match
  if (root.examples.some(e => e.toLowerCase().includes(query))) {
    score += 30;
  }

  return score;
}

/**
 * Autocomplete suggestions
 */
export function getAutocompleteSuggestions(
  prefix: string,
  limit: number = 10
): string[] {
  const normalized = prefix.toLowerCase().trim();
  if (!normalized) return [];

  const words = getAllWords();
  const suggestions = new Set<string>();

  // Add matching words
  for (const word of words) {
    if (word.word.toLowerCase().startsWith(normalized)) {
      suggestions.add(word.word);
      if (suggestions.size >= limit) break;
    }
  }

  // Add matching roots if we have room
  if (suggestions.size < limit) {
    const roots = getAllRoots();
    for (const root of roots) {
      if (root.root.toLowerCase().startsWith(normalized)) {
        suggestions.add(root.root);
        if (suggestions.size >= limit) break;
      }
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Find words similar to the given word
 */
export function findSimilarWords(wordId: string, limit: number = 5): VocabularyWord[] {
  const words = getAllWords();
  const targetWord = words.find(w => w.id === wordId);

  if (!targetWord) return [];

  return words
    .filter(w => w.id !== wordId)
    .map(word => ({
      word,
      similarity: calculateWordSimilarity(targetWord, word),
    }))
    .filter(item => item.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.word);
}

/**
 * Calculate similarity between two words
 */
function calculateWordSimilarity(word1: VocabularyWord, word2: VocabularyWord): number {
  let similarity = 0;

  // Same category
  if (word1.category === word2.category) {
    similarity += 20;
  }

  // Same subcategory
  if (word1.subcategory === word2.subcategory) {
    similarity += 30;
  }

  // Shared roots
  const sharedRoots = word1.etymology.roots.filter(r1 =>
    word2.etymology.roots.some(r2 => r2.id === r1.id)
  );
  similarity += sharedRoots.length * 40;

  // Mutual synonyms
  const mutualSynonyms = word1.synonyms.filter(s1 =>
    word2.synonyms.some(s2 => s1.toLowerCase() === s2.toLowerCase())
  );
  similarity += mutualSynonyms.length * 15;

  // One is synonym of other
  if (word1.synonyms.some(s => s.toLowerCase() === word2.word.toLowerCase()) ||
      word2.synonyms.some(s => s.toLowerCase() === word1.word.toLowerCase())) {
    similarity += 50;
  }

  // One is antonym of other
  if (word1.antonyms?.some(a => a.toLowerCase() === word2.word.toLowerCase()) ||
      word2.antonyms?.some(a => a.toLowerCase() === word1.word.toLowerCase())) {
    similarity += 35;
  }

  return similarity;
}
