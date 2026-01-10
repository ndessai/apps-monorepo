/**
 * Tossup-Bonus Linker
 *
 * Links tossup and bonus questions by category and difficulty
 */

import type {
  TossupQuestion,
  BonusQuestion,
  QuestionCategory,
  QuestionDifficulty,
} from '../types.js';

interface LinkedPair {
  tossup: TossupQuestion;
  bonus: BonusQuestion;
}

/**
 * Group questions by category
 */
function groupByCategory<T extends { category: QuestionCategory }>(
  questions: T[]
): Map<QuestionCategory, T[]> {
  const groups = new Map<QuestionCategory, T[]>();

  for (const q of questions) {
    const existing = groups.get(q.category) || [];
    existing.push(q);
    groups.set(q.category, existing);
  }

  return groups;
}

/**
 * Group questions by difficulty
 */
function groupByDifficulty<T extends { difficulty: QuestionDifficulty }>(
  questions: T[]
): Map<QuestionDifficulty, T[]> {
  const groups = new Map<QuestionDifficulty, T[]>();

  for (const q of questions) {
    const existing = groups.get(q.difficulty) || [];
    existing.push(q);
    groups.set(q.difficulty, existing);
  }

  return groups;
}

/**
 * Shuffle array in place (Fisher-Yates)
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Link tossups and bonuses by matching category and difficulty
 * Returns paired questions with linkedTossupId set
 */
export function linkQuestions(
  tossups: TossupQuestion[],
  bonuses: BonusQuestion[]
): LinkedPair[] {
  const pairs: LinkedPair[] = [];

  // Group by category first
  const tossupsByCategory = groupByCategory(tossups);
  const bonusesByCategory = groupByCategory(bonuses);

  // For each category, pair by difficulty
  for (const [category, categoryTossups] of tossupsByCategory) {
    const categoryBonuses = bonusesByCategory.get(category) || [];

    // Group by difficulty
    const tossupsByDiff = groupByDifficulty(categoryTossups);
    const bonusesByDiff = groupByDifficulty(categoryBonuses);

    // Pair within each difficulty
    for (const [difficulty, diffTossups] of tossupsByDiff) {
      const diffBonuses = bonusesByDiff.get(difficulty) || [];

      // Shuffle both arrays for variety
      const shuffledTossups = shuffle(diffTossups);
      const shuffledBonuses = shuffle(diffBonuses);

      // Pair as many as possible
      const pairCount = Math.min(shuffledTossups.length, shuffledBonuses.length);

      for (let i = 0; i < pairCount; i++) {
        const tossup = shuffledTossups[i];
        const bonus = { ...shuffledBonuses[i], linkedTossupId: tossup.id };

        pairs.push({ tossup, bonus });
      }

      // Log unmatched questions
      if (shuffledTossups.length > pairCount) {
        console.log(`  ${category}/${difficulty}: ${shuffledTossups.length - pairCount} tossups without bonuses`);
      }
      if (shuffledBonuses.length > pairCount) {
        console.log(`  ${category}/${difficulty}: ${shuffledBonuses.length - pairCount} bonuses without tossups`);
      }
    }
  }

  return pairs;
}

/**
 * Link questions with cross-difficulty matching when needed
 * Falls back to nearby difficulties if exact match not available
 */
export function linkQuestionsFlexible(
  tossups: TossupQuestion[],
  bonuses: BonusQuestion[]
): LinkedPair[] {
  const pairs: LinkedPair[] = [];
  const usedTossupIds = new Set<string>();
  const usedBonusIds = new Set<string>();

  // Group by category
  const tossupsByCategory = groupByCategory(tossups);
  const bonusesByCategory = groupByCategory(bonuses);

  const difficultyOrder: QuestionDifficulty[] = ['middle_school', 'high_school', 'college', 'open'];

  for (const [category, categoryTossups] of tossupsByCategory) {
    const categoryBonuses = bonusesByCategory.get(category) || [];

    // Shuffle for variety
    const shuffledTossups = shuffle(categoryTossups);
    const shuffledBonuses = shuffle(categoryBonuses);

    for (const tossup of shuffledTossups) {
      if (usedTossupIds.has(tossup.id)) continue;

      // Try to find a matching bonus (same difficulty first, then nearby)
      let matchedBonus: BonusQuestion | null = null;

      // First try exact difficulty match
      const exactMatch = shuffledBonuses.find(
        b => b.difficulty === tossup.difficulty && !usedBonusIds.has(b.id)
      );

      if (exactMatch) {
        matchedBonus = exactMatch;
      } else {
        // Try adjacent difficulties
        const tossupDiffIndex = difficultyOrder.indexOf(tossup.difficulty);

        for (let offset = 1; offset < difficultyOrder.length && !matchedBonus; offset++) {
          // Try one level harder
          if (tossupDiffIndex + offset < difficultyOrder.length) {
            const harder = difficultyOrder[tossupDiffIndex + offset];
            matchedBonus = shuffledBonuses.find(
              b => b.difficulty === harder && !usedBonusIds.has(b.id)
            ) || null;
          }

          // Try one level easier
          if (!matchedBonus && tossupDiffIndex - offset >= 0) {
            const easier = difficultyOrder[tossupDiffIndex - offset];
            matchedBonus = shuffledBonuses.find(
              b => b.difficulty === easier && !usedBonusIds.has(b.id)
            ) || null;
          }
        }
      }

      if (matchedBonus) {
        usedTossupIds.add(tossup.id);
        usedBonusIds.add(matchedBonus.id);

        pairs.push({
          tossup,
          bonus: { ...matchedBonus, linkedTossupId: tossup.id },
        });
      }
    }
  }

  // Report statistics
  const unpairedTossups = tossups.filter(t => !usedTossupIds.has(t.id)).length;
  const unpairedBonuses = bonuses.filter(b => !usedBonusIds.has(b.id)).length;

  if (unpairedTossups > 0 || unpairedBonuses > 0) {
    console.log(`Linking complete: ${pairs.length} pairs created`);
    console.log(`  Unpaired tossups: ${unpairedTossups}`);
    console.log(`  Unpaired bonuses: ${unpairedBonuses}`);
  }

  return pairs;
}

/**
 * Get unmatched questions that couldn't be paired
 */
export function getUnmatchedQuestions(
  tossups: TossupQuestion[],
  bonuses: BonusQuestion[],
  pairs: LinkedPair[]
): { unmatchedTossups: TossupQuestion[]; unmatchedBonuses: BonusQuestion[] } {
  const pairedTossupIds = new Set(pairs.map(p => p.tossup.id));
  const pairedBonusIds = new Set(pairs.map(p => p.bonus.id));

  return {
    unmatchedTossups: tossups.filter(t => !pairedTossupIds.has(t.id)),
    unmatchedBonuses: bonuses.filter(b => !pairedBonusIds.has(b.id)),
  };
}

export default {
  linkQuestions,
  linkQuestionsFlexible,
  getUnmatchedQuestions,
};
