/**
 * Etymology Types for Word Origin Tracking
 * Supports etymology-based learning like Word Power Made Easy
 */

/** Word origin language */
export type OriginLanguage =
  | 'Latin'
  | 'Greek'
  | 'Old English'
  | 'Old French'
  | 'German'
  | 'Italian'
  | 'Spanish'
  | 'Arabic'
  | 'Sanskrit'
  | 'Other';

/** Root information for etymology */
export interface RootInfo {
  /** Unique identifier for the root */
  id: string;
  /** The root itself (e.g., "scrib", "graph") */
  root: string;
  /** Meaning of the root */
  meaning: string;
  /** Origin language */
  language: OriginLanguage;
  /** Variant spellings (e.g., ["scrib", "script"]) */
  variants?: string[];
  /** Example words using this root */
  examples: string[];
}

/** Prefix information */
export interface PrefixInfo {
  /** Unique identifier */
  id: string;
  /** The prefix (e.g., "pre-", "anti-") */
  prefix: string;
  /** Meaning of the prefix */
  meaning: string;
  /** Origin language */
  language: OriginLanguage;
  /** Variant spellings */
  variants?: string[];
  /** Example words using this prefix */
  examples: string[];
}

/** Suffix information */
export interface SuffixInfo {
  /** Unique identifier */
  id: string;
  /** The suffix (e.g., "-tion", "-ous") */
  suffix: string;
  /** Meaning of the suffix */
  meaning: string;
  /** Origin language */
  language: OriginLanguage;
  /** Resulting part of speech when suffix is added */
  partOfSpeechResult: 'noun' | 'verb' | 'adjective' | 'adverb';
  /** Example words using this suffix */
  examples: string[];
}

/** Complete etymology breakdown for a word */
export interface EtymologyInfo {
  /** Primary origin language */
  language: OriginLanguage;
  /** Root(s) used in the word */
  roots: RootInfo[];
  /** Prefix if present */
  prefix?: PrefixInfo;
  /** Suffix if present */
  suffix?: SuffixInfo;
  /** Etymology narrative/explanation */
  narrative: string;
  /** Historical development notes */
  historicalNotes?: string;
  /** Related etymological words (cognates) */
  cognates?: string[];
}
