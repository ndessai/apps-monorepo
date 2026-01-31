/**
 * Etymology Roots Data Exports
 */

// Latin roots
export {
  LATIN_ROOTS,
  getLatinRootById,
  getLatinRootsByRoot,
  getLatinRootsByWord,
} from './latin-roots';

// Greek roots
export {
  GREEK_ROOTS,
  getGreekRootById,
  getGreekRootsByRoot,
  getGreekRootsByWord,
} from './greek-roots';

// Prefixes
export {
  PREFIXES,
  getPrefixById,
  getPrefixesByPrefix,
} from './prefixes';

// Suffixes
export {
  SUFFIXES,
  getSuffixById,
  getSuffixesBySuffix,
  getSuffixesByPartOfSpeech,
} from './suffixes';

import type { RootInfo } from '../../types';
import { LATIN_ROOTS, getLatinRootsByWord } from './latin-roots';
import { GREEK_ROOTS, getGreekRootsByWord } from './greek-roots';

/** Get all roots (Latin and Greek) */
export function getAllRoots(): RootInfo[] {
  return [...LATIN_ROOTS, ...GREEK_ROOTS];
}

/** Get root by ID from any collection */
export function getRootById(id: string): RootInfo | undefined {
  return [...LATIN_ROOTS, ...GREEK_ROOTS].find(root => root.id === id);
}

/** Get roots by word from any collection */
export function getRootsByWord(word: string): RootInfo[] {
  return [
    ...getLatinRootsByWord(word),
    ...getGreekRootsByWord(word),
  ];
}

/** Get roots by root string from any collection */
export function getRootsByRootString(rootStr: string): RootInfo[] {
  const normalized = rootStr.toLowerCase();
  return [...LATIN_ROOTS, ...GREEK_ROOTS].filter(
    root => root.root.toLowerCase() === normalized ||
      root.variants?.some(v => v.toLowerCase() === normalized)
  );
}
