/**
 * Root Explorer
 * Explore vocabulary words by their etymological roots
 */

import type { RootInfo, VocabularyWord, PrefixInfo, SuffixInfo } from '../types';
import { getAllRoots, getRootById, LATIN_ROOTS, GREEK_ROOTS } from '../data/roots';
import { PREFIXES, SUFFIXES } from '../data/roots';
import { getWordsByRootId } from '../data/words';

/** Root with associated words */
export interface RootWithWords {
  root: RootInfo;
  words: VocabularyWord[];
  relatedRoots: RootInfo[];
}

/** Root exploration result */
export interface RootExplorationResult {
  root: RootInfo;
  words: VocabularyWord[];
  relatedRoots: RootInfo[];
  prefixes: PrefixInfo[];
  suffixes: SuffixInfo[];
  totalWordCount: number;
}

/** Get all roots organized by language */
export function getRootsByLanguage(): { latin: RootInfo[]; greek: RootInfo[] } {
  return {
    latin: LATIN_ROOTS,
    greek: GREEK_ROOTS,
  };
}

/** Get all available roots */
export function getAllAvailableRoots(): RootInfo[] {
  return getAllRoots();
}

/** Explore a specific root */
export function exploreRoot(rootId: string): RootExplorationResult | null {
  const root = getRootById(rootId);
  if (!root) return null;

  const words = getWordsByRootId(rootId);
  const relatedRoots = findRelatedRoots(root);
  const prefixes = findRelatedPrefixes(root);
  const suffixes = findRelatedSuffixes(root);

  return {
    root,
    words,
    relatedRoots,
    prefixes,
    suffixes,
    totalWordCount: words.length,
  };
}

/** Find roots related to the given root (by language or meaning) */
function findRelatedRoots(root: RootInfo): RootInfo[] {
  const allRoots = getAllRoots();
  return allRoots.filter(r => {
    if (r.id === root.id) return false;

    // Same language
    if (r.language === root.language) {
      // Check for overlapping example words
      const hasOverlap = r.examples.some(ex =>
        root.examples.some(rootEx =>
          ex.toLowerCase() === rootEx.toLowerCase()
        )
      );
      if (hasOverlap) return true;
    }

    // Similar meaning (basic matching)
    const rootMeaningWords = root.meaning.toLowerCase().split(/\s+/);
    const rMeaningWords = r.meaning.toLowerCase().split(/\s+/);
    const hasCommonMeaning = rootMeaningWords.some(word =>
      word.length > 3 && rMeaningWords.includes(word)
    );

    return hasCommonMeaning;
  }).slice(0, 5); // Limit to 5 related roots
}

/** Find prefixes that work with this root */
function findRelatedPrefixes(root: RootInfo): PrefixInfo[] {
  const rootWords = new Set(root.examples.map(e => e.toLowerCase()));

  return PREFIXES.filter(prefix =>
    prefix.examples.some(ex => {
      const exLower = ex.toLowerCase();
      return rootWords.has(exLower) ||
        root.examples.some(rootEx =>
          exLower.includes(rootEx.toLowerCase().substring(0, 4))
        );
    })
  ).slice(0, 5);
}

/** Find suffixes that work with this root */
function findRelatedSuffixes(root: RootInfo): SuffixInfo[] {
  const rootWords = new Set(root.examples.map(e => e.toLowerCase()));

  return SUFFIXES.filter(suffix =>
    suffix.examples.some(ex => {
      const exLower = ex.toLowerCase();
      return rootWords.has(exLower);
    })
  ).slice(0, 5);
}

/** Search for roots by meaning or root string */
export function searchRoots(query: string): RootInfo[] {
  const normalized = query.toLowerCase().trim();
  const allRoots = getAllRoots();

  return allRoots.filter(root =>
    root.root.toLowerCase().includes(normalized) ||
    root.meaning.toLowerCase().includes(normalized) ||
    root.variants?.some(v => v.toLowerCase().includes(normalized)) ||
    root.examples.some(ex => ex.toLowerCase().includes(normalized))
  );
}

/** Get roots by first letter */
export function getRootsByFirstLetter(letter: string): RootInfo[] {
  const normalized = letter.toLowerCase();
  return getAllRoots().filter(root =>
    root.root.toLowerCase().startsWith(normalized)
  );
}

/** Get roots with the most associated words */
export function getMostProductiveRoots(limit: number = 10): RootWithWords[] {
  const allRoots = getAllRoots();

  const rootsWithWordCount = allRoots.map(root => ({
    root,
    words: getWordsByRootId(root.id),
    relatedRoots: findRelatedRoots(root),
  }));

  return rootsWithWordCount
    .sort((a, b) => b.words.length - a.words.length)
    .slice(0, limit);
}

/** Get statistics about the root database */
export function getRootDatabaseStats() {
  const latinRoots = LATIN_ROOTS;
  const greekRoots = GREEK_ROOTS;
  const prefixes = PREFIXES;
  const suffixes = SUFFIXES;

  return {
    totalRoots: latinRoots.length + greekRoots.length,
    latinRoots: latinRoots.length,
    greekRoots: greekRoots.length,
    prefixes: prefixes.length,
    suffixes: suffixes.length,
  };
}
