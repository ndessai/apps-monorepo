/**
 * QB Reader API Client
 *
 * Rate-limited client for fetching questions from QB Reader API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import Bottleneck from 'bottleneck';
import { QBREADER_CONFIG } from '../config.js';
import type {
  QBReaderQueryResponse,
  QBReaderRandomResponse,
  QBReaderTossup,
  QBReaderBonus,
  FetchParams,
} from '../types.js';

// Create rate limiter
const limiter = new Bottleneck({
  maxConcurrent: QBREADER_CONFIG.rateLimit.maxConcurrent,
  minTime: QBREADER_CONFIG.rateLimit.minTime,
});

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: QBREADER_CONFIG.baseUrl,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = QBREADER_CONFIG.retryAttempts,
  delayMs: number = QBREADER_CONFIG.retryDelayMs
): Promise<T> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const axiosError = error as AxiosError;

      // Don't retry on 4xx errors (client errors)
      if (axiosError.response && axiosError.response.status >= 400 && axiosError.response.status < 500) {
        throw error;
      }

      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed: ${(error as Error).message}`);

      if (attempt < maxRetries - 1) {
        // Exponential backoff
        const waitTime = delayMs * Math.pow(2, attempt);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
      }
    }
  }

  throw lastError;
}

/**
 * Query questions with filters
 */
export const queryQuestions = limiter.wrap(async (params: {
  queryString?: string;
  categories?: string[];
  subcategories?: string[];
  difficulties?: number[];
  questionType?: 'tossup' | 'bonus' | 'all';
  minYear?: number;
  maxYear?: number;
  randomize?: boolean;
  maxReturnLength?: number;
  setName?: string;
}): Promise<QBReaderQueryResponse> => {
  return fetchWithRetry(async () => {
    const response = await api.get('/query', {
      params: {
        queryString: params.queryString || '',
        categories: params.categories?.join(','),
        subcategories: params.subcategories?.join(','),
        difficulties: params.difficulties?.join(','),
        questionType: params.questionType || 'all',
        minYear: params.minYear,
        maxYear: params.maxYear,
        randomize: params.randomize,
        maxReturnLength: params.maxReturnLength || QBREADER_CONFIG.maxReturnLength,
        setName: params.setName,
      },
    });
    return response.data;
  });
});

/**
 * Get random tossup questions
 */
export const getRandomTossups = limiter.wrap(async (params: {
  categories?: string[];
  subcategories?: string[];
  difficulties?: number[];
  number?: number;
  minYear?: number;
  maxYear?: number;
  standardOnly?: boolean;
  powermarkOnly?: boolean;
}): Promise<QBReaderTossup[]> => {
  return fetchWithRetry(async () => {
    const response = await api.get('/random-tossup', {
      params: {
        categories: params.categories?.join(','),
        subcategories: params.subcategories?.join(','),
        difficulties: params.difficulties?.join(','),
        number: params.number || 1,
        minYear: params.minYear,
        maxYear: params.maxYear,
        standardOnly: params.standardOnly,
        powermarkOnly: params.powermarkOnly,
      },
    });
    return response.data.tossups || [];
  });
});

/**
 * Get random bonus questions
 */
export const getRandomBonuses = limiter.wrap(async (params: {
  categories?: string[];
  subcategories?: string[];
  difficulties?: number[];
  number?: number;
  minYear?: number;
  maxYear?: number;
  standardOnly?: boolean;
  threePartBonuses?: boolean;
}): Promise<QBReaderBonus[]> => {
  return fetchWithRetry(async () => {
    const response = await api.get('/random-bonus', {
      params: {
        categories: params.categories?.join(','),
        subcategories: params.subcategories?.join(','),
        difficulties: params.difficulties?.join(','),
        number: params.number || 1,
        minYear: params.minYear,
        maxYear: params.maxYear,
        standardOnly: params.standardOnly,
        threePartBonuses: params.threePartBonuses ?? true, // Default to 3-part bonuses
      },
    });
    return response.data.bonuses || [];
  });
});

/**
 * Get available set list
 */
export const getSetList = limiter.wrap(async (): Promise<string[]> => {
  return fetchWithRetry(async () => {
    const response = await api.get('/set-list');
    return response.data || [];
  });
});

/**
 * Get questions from a specific packet
 */
export const getPacket = limiter.wrap(async (params: {
  setName: string;
  packetNumber: number;
}): Promise<QBReaderQueryResponse> => {
  return fetchWithRetry(async () => {
    const response = await api.get('/packet', {
      params: {
        setName: params.setName,
        packetNumber: params.packetNumber,
      },
    });
    return response.data;
  });
});

/**
 * Batch fetch tossups by category and difficulty
 * Returns all tossups matching the criteria
 */
export async function fetchTossupsByCategory(
  category: string,
  difficulties: number[],
  targetCount: number = 500
): Promise<QBReaderTossup[]> {
  const allTossups: QBReaderTossup[] = [];
  const seenIds = new Set<string>();

  console.log(`Fetching tossups for ${category} (difficulties: ${difficulties.join(',')})`);

  // First try query endpoint
  try {
    const queryResult = await queryQuestions({
      categories: [category],
      difficulties,
      questionType: 'tossup',
      randomize: true,
      maxReturnLength: Math.min(targetCount, 1000),
    });

    if (queryResult.tossups?.questionArray) {
      for (const tossup of queryResult.tossups.questionArray) {
        if (!seenIds.has(tossup._id)) {
          seenIds.add(tossup._id);
          allTossups.push(tossup);
        }
      }
    }

    console.log(`  Query returned ${allTossups.length} tossups`);
  } catch (error) {
    console.warn(`  Query failed: ${(error as Error).message}`);
  }

  // If we need more, use random endpoint
  while (allTossups.length < targetCount) {
    const remaining = targetCount - allTossups.length;
    const batchSize = Math.min(remaining, 100);

    try {
      const randomTossups = await getRandomTossups({
        categories: [category],
        difficulties,
        number: batchSize,
        standardOnly: true,
      });

      let newCount = 0;
      for (const tossup of randomTossups) {
        if (!seenIds.has(tossup._id)) {
          seenIds.add(tossup._id);
          allTossups.push(tossup);
          newCount++;
        }
      }

      console.log(`  Random batch: ${newCount} new tossups (total: ${allTossups.length})`);

      // If we got no new tossups, we've exhausted the pool
      if (newCount === 0) {
        console.log(`  No more unique tossups available`);
        break;
      }
    } catch (error) {
      console.error(`  Random fetch failed: ${(error as Error).message}`);
      break;
    }
  }

  return allTossups;
}

/**
 * Batch fetch bonuses by category and difficulty
 */
export async function fetchBonusesByCategory(
  category: string,
  difficulties: number[],
  targetCount: number = 500
): Promise<QBReaderBonus[]> {
  const allBonuses: QBReaderBonus[] = [];
  const seenIds = new Set<string>();

  console.log(`Fetching bonuses for ${category} (difficulties: ${difficulties.join(',')})`);

  // First try query endpoint
  try {
    const queryResult = await queryQuestions({
      categories: [category],
      difficulties,
      questionType: 'bonus',
      randomize: true,
      maxReturnLength: Math.min(targetCount, 1000),
    });

    if (queryResult.bonuses?.questionArray) {
      for (const bonus of queryResult.bonuses.questionArray) {
        // Only include 3-part bonuses
        if (bonus.parts?.length === 3 && !seenIds.has(bonus._id)) {
          seenIds.add(bonus._id);
          allBonuses.push(bonus);
        }
      }
    }

    console.log(`  Query returned ${allBonuses.length} bonuses`);
  } catch (error) {
    console.warn(`  Query failed: ${(error as Error).message}`);
  }

  // If we need more, use random endpoint
  while (allBonuses.length < targetCount) {
    const remaining = targetCount - allBonuses.length;
    const batchSize = Math.min(remaining, 100);

    try {
      const randomBonuses = await getRandomBonuses({
        categories: [category],
        difficulties,
        number: batchSize,
        standardOnly: true,
        threePartBonuses: true,
      });

      let newCount = 0;
      for (const bonus of randomBonuses) {
        if (bonus.parts?.length === 3 && !seenIds.has(bonus._id)) {
          seenIds.add(bonus._id);
          allBonuses.push(bonus);
          newCount++;
        }
      }

      console.log(`  Random batch: ${newCount} new bonuses (total: ${allBonuses.length})`);

      if (newCount === 0) {
        console.log(`  No more unique bonuses available`);
        break;
      }
    } catch (error) {
      console.error(`  Random fetch failed: ${(error as Error).message}`);
      break;
    }
  }

  return allBonuses;
}

export default {
  queryQuestions,
  getRandomTossups,
  getRandomBonuses,
  getSetList,
  getPacket,
  fetchTossupsByCategory,
  fetchBonusesByCategory,
};
