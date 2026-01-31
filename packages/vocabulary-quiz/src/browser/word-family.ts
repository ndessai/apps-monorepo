/**
 * Word Family Navigation
 * Navigate between related words that share roots, prefixes, or semantic connections
 */

import type { VocabularyWord, WordFamily } from '../types';
import { getAllWords, getWordById, getWordsByRootId } from '../data/words';
import { getAllRoots } from '../data/roots';

/** Word connection type */
export type ConnectionType =
  | 'same_root'       // Words sharing the same root
  | 'synonym'         // Words with similar meanings
  | 'antonym'         // Words with opposite meanings
  | 'same_category'   // Words in the same category
  | 'same_prefix'     // Words sharing the same prefix
  | 'same_suffix';    // Words sharing the same suffix

/** Word connection */
export interface WordConnection {
  word: VocabularyWord;
  connectionType: ConnectionType;
  strength: number; // 0-1, how strong the connection is
  explanation: string;
}

/** Word family result */
export interface WordFamilyResult {
  word: VocabularyWord;
  rootFamily: WordFamily | null;
  connections: WordConnection[];
  relatedWords: VocabularyWord[];
}

/** Get the word family for a specific word */
export function getWordFamily(wordId: string): WordFamilyResult | null {
  const word = getWordById(wordId);
  if (!word) return null;

  const rootFamily = buildRootFamily(word);
  const connections = findWordConnections(word);
  const relatedWords = word.relatedWords
    .map(rw => getAllWords().find(w => w.word.toLowerCase() === rw.toLowerCase()))
    .filter((w): w is VocabularyWord => w !== undefined);

  return {
    word,
    rootFamily,
    connections,
    relatedWords,
  };
}

/** Build a word family based on shared roots */
function buildRootFamily(word: VocabularyWord): WordFamily | null {
  if (word.etymology.roots.length === 0) return null;

  const primaryRoot = word.etymology.roots[0];
  const familyWords = getWordsByRootId(primaryRoot.id);

  return {
    id: `family-${primaryRoot.id}`,
    rootId: primaryRoot.id,
    root: primaryRoot,
    words: familyWords,
  };
}

/** Find all connections for a word */
function findWordConnections(word: VocabularyWord): WordConnection[] {
  const connections: WordConnection[] = [];
  const allWords = getAllWords();

  // Find words with same roots
  for (const root of word.etymology.roots) {
    const rootWords = getWordsByRootId(root.id);
    for (const rw of rootWords) {
      if (rw.id !== word.id) {
        connections.push({
          word: rw,
          connectionType: 'same_root',
          strength: 0.9,
          explanation: `Both words share the ${root.language} root "${root.root}" meaning "${root.meaning}"`,
        });
      }
    }
  }

  // Find synonyms that are in our word database
  for (const synonym of word.synonyms) {
    const synonymWord = allWords.find(w =>
      w.word.toLowerCase() === synonym.toLowerCase() && w.id !== word.id
    );
    if (synonymWord) {
      connections.push({
        word: synonymWord,
        connectionType: 'synonym',
        strength: 0.7,
        explanation: `"${synonymWord.word}" is a synonym of "${word.word}"`,
      });
    }
  }

  // Find antonyms that are in our word database
  if (word.antonyms) {
    for (const antonym of word.antonyms) {
      const antonymWord = allWords.find(w =>
        w.word.toLowerCase() === antonym.toLowerCase() && w.id !== word.id
      );
      if (antonymWord) {
        connections.push({
          word: antonymWord,
          connectionType: 'antonym',
          strength: 0.6,
          explanation: `"${antonymWord.word}" is an antonym of "${word.word}"`,
        });
      }
    }
  }

  // Find words in the same subcategory
  const sameCategoryWords = allWords.filter(w =>
    w.subcategory === word.subcategory && w.id !== word.id
  );
  for (const catWord of sameCategoryWords.slice(0, 5)) {
    // Skip if already connected
    if (connections.some(c => c.word.id === catWord.id)) continue;

    connections.push({
      word: catWord,
      connectionType: 'same_category',
      strength: 0.4,
      explanation: `Both words belong to the "${word.subcategory}" subcategory`,
    });
  }

  // Find words with same prefix
  if (word.etymology.prefix) {
    const prefix = word.etymology.prefix;
    const samePrefixWords = allWords.filter(w =>
      w.etymology.prefix?.id === prefix.id && w.id !== word.id
    );
    for (const prefixWord of samePrefixWords.slice(0, 3)) {
      if (connections.some(c => c.word.id === prefixWord.id)) continue;

      connections.push({
        word: prefixWord,
        connectionType: 'same_prefix',
        strength: 0.5,
        explanation: `Both words use the prefix "${prefix.prefix}" meaning "${prefix.meaning}"`,
      });
    }
  }

  // Sort by strength
  return connections.sort((a, b) => b.strength - a.strength);
}

/** Get all word families organized by root */
export function getAllWordFamilies(): WordFamily[] {
  const allRoots = getAllRoots();
  const families: WordFamily[] = [];

  for (const root of allRoots) {
    const words = getWordsByRootId(root.id);
    if (words.length > 0) {
      families.push({
        id: `family-${root.id}`,
        rootId: root.id,
        root,
        words,
      });
    }
  }

  return families.sort((a, b) => b.words.length - a.words.length);
}

/** Find words that connect two given words */
export function findConnectionPath(wordId1: string, wordId2: string): VocabularyWord[] {
  const word1 = getWordById(wordId1);
  const word2 = getWordById(wordId2);

  if (!word1 || !word2) return [];

  // Check if directly connected
  const word1Connections = findWordConnections(word1);
  const directConnection = word1Connections.find(c => c.word.id === wordId2);
  if (directConnection) {
    return [word1, word2];
  }

  // Try to find a path through shared connections
  for (const connection of word1Connections) {
    const intermediateConnections = findWordConnections(connection.word);
    if (intermediateConnections.some(c => c.word.id === wordId2)) {
      return [word1, connection.word, word2];
    }
  }

  return []; // No path found
}

/** Get words that can serve as vocabulary "bridges" (highly connected words) */
export function getBridgeWords(limit: number = 10): VocabularyWord[] {
  const allWords = getAllWords();

  const wordsWithConnectionCount = allWords.map(word => ({
    word,
    connectionCount: findWordConnections(word).length,
  }));

  return wordsWithConnectionCount
    .sort((a, b) => b.connectionCount - a.connectionCount)
    .slice(0, limit)
    .map(item => item.word);
}
