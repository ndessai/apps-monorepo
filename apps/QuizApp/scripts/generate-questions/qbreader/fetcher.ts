/**
 * QB Reader Question Fetcher
 *
 * High-level functions to fetch and transform questions from QB Reader
 */

import { fetchTossupsByCategory, fetchBonusesByCategory } from './client.js';
import { transformTossups, transformBonuses } from './transformer.js';
import { QB_CATEGORIES, QB_DIFFICULTY_RANGES, TARGET_COUNTS, CATEGORY_MAP } from '../config.js';
import type { TossupQuestion, BonusQuestion, QuestionCategory } from '../types.js';

interface FetchResult {
  category: QuestionCategory;
  tossups: TossupQuestion[];
  bonuses: BonusQuestion[];
}

/**
 * Fetch all questions for a single category across all difficulties
 */
export async function fetchCategoryQuestions(
  qbCategory: string,
  targetTossups: number,
  targetBonuses: number
): Promise<FetchResult | null> {
  const appCategory = CATEGORY_MAP[qbCategory] as QuestionCategory;
  if (!appCategory) {
    console.log(`Skipping unmapped category: ${qbCategory}`);
    return null;
  }

  console.log(`\n=== Fetching ${appCategory} ===`);
  console.log(`Target: ${targetTossups} tossups, ${targetBonuses} bonuses`);

  const allTossups: TossupQuestion[] = [];
  const allBonuses: BonusQuestion[] = [];

  // Fetch for each difficulty range
  for (const [difficultyName, difficulties] of Object.entries(QB_DIFFICULTY_RANGES)) {
    const perDifficultyTarget = Math.ceil(targetTossups / 4);

    console.log(`\n  ${difficultyName} (QB difficulties: ${difficulties.join(',')})`);

    // Fetch tossups
    const qbTossups = await fetchTossupsByCategory(qbCategory, difficulties, perDifficultyTarget);
    const tossups = transformTossups(qbTossups);
    allTossups.push(...tossups);

    // Fetch bonuses
    const qbBonuses = await fetchBonusesByCategory(qbCategory, difficulties, perDifficultyTarget);
    const bonuses = transformBonuses(qbBonuses);
    allBonuses.push(...bonuses);

    console.log(`  Got ${tossups.length} tossups, ${bonuses.length} bonuses`);
  }

  console.log(`\n${appCategory} total: ${allTossups.length} tossups, ${allBonuses.length} bonuses`);

  return {
    category: appCategory,
    tossups: allTossups,
    bonuses: allBonuses,
  };
}

/**
 * Fetch questions for all categories
 */
export async function fetchAllCategories(): Promise<Map<QuestionCategory, FetchResult>> {
  const results = new Map<QuestionCategory, FetchResult>();

  for (const qbCategory of QB_CATEGORIES) {
    const appCategory = CATEGORY_MAP[qbCategory] as QuestionCategory;
    if (!appCategory) continue;

    // Get target counts for this category
    const targets = TARGET_COUNTS[appCategory as keyof typeof TARGET_COUNTS] || {
      tossups: 300,
      bonuses: 300,
    };

    try {
      const result = await fetchCategoryQuestions(
        qbCategory,
        targets.tossups,
        targets.bonuses
      );

      if (result) {
        // Merge if category already exists (e.g., Religion -> Philosophy)
        const existing = results.get(result.category);
        if (existing) {
          existing.tossups.push(...result.tossups);
          existing.bonuses.push(...result.bonuses);
        } else {
          results.set(result.category, result);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${qbCategory}:`, error);
    }
  }

  return results;
}

/**
 * Fetch questions for a specific category only
 */
export async function fetchSingleCategory(
  category: QuestionCategory
): Promise<FetchResult | null> {
  // Find matching QB category
  let qbCategory: string | null = null;
  for (const [qb, app] of Object.entries(CATEGORY_MAP)) {
    if (app === category) {
      qbCategory = qb;
      break;
    }
  }

  if (!qbCategory) {
    console.error(`No QB Reader mapping for category: ${category}`);
    return null;
  }

  const targets = TARGET_COUNTS[category as keyof typeof TARGET_COUNTS] || {
    tossups: 300,
    bonuses: 300,
  };

  return fetchCategoryQuestions(qbCategory, targets.tossups, targets.bonuses);
}

/**
 * Get statistics about fetched questions
 */
export function getQuestionStats(results: Map<QuestionCategory, FetchResult>): {
  totalTossups: number;
  totalBonuses: number;
  byCategory: Record<string, { tossups: number; bonuses: number }>;
  byDifficulty: Record<string, { tossups: number; bonuses: number }>;
} {
  let totalTossups = 0;
  let totalBonuses = 0;
  const byCategory: Record<string, { tossups: number; bonuses: number }> = {};
  const byDifficulty: Record<string, { tossups: number; bonuses: number }> = {
    middle_school: { tossups: 0, bonuses: 0 },
    high_school: { tossups: 0, bonuses: 0 },
    college: { tossups: 0, bonuses: 0 },
    open: { tossups: 0, bonuses: 0 },
  };

  for (const [category, result] of results) {
    totalTossups += result.tossups.length;
    totalBonuses += result.bonuses.length;

    byCategory[category] = {
      tossups: result.tossups.length,
      bonuses: result.bonuses.length,
    };

    // Count by difficulty
    for (const tossup of result.tossups) {
      byDifficulty[tossup.difficulty].tossups++;
    }
    for (const bonus of result.bonuses) {
      byDifficulty[bonus.difficulty].bonuses++;
    }
  }

  return {
    totalTossups,
    totalBonuses,
    byCategory,
    byDifficulty,
  };
}

export default {
  fetchCategoryQuestions,
  fetchAllCategories,
  fetchSingleCategory,
  getQuestionStats,
};
