/**
 * Question Service
 *
 * Loads and validates NAQT-format quiz questions
 * Supports multiple packet files and category-based loading
 */

import { QuizData, TossupQuestion, BonusQuestion, QuestionCategory, QuestionDifficulty } from '../types/quiz';
import sampleQuestions from '../assets/sample-questions.json';

// Types for packet system
interface PacketMetadata {
  id: string;
  file: string;
  difficulty: QuestionDifficulty | 'mixed';
  categories: QuestionCategory[];
  tossupCount: number;
  bonusCount: number;
}

interface QuestionsMetadata {
  version: string;
  generatedAt: string;
  totalPackets: number;
  totalTossups: number;
  totalBonuses: number;
  packets: PacketMetadata[];
  categoryStats: Record<QuestionCategory, { tossups: number; bonuses: number }>;
}

interface QuizFilters {
  categories?: QuestionCategory[];
  difficulty?: QuestionDifficulty;
  packetId?: string;
}

// Cache for loaded packets
const packetCache = new Map<string, QuizData>();
let metadataCache: QuestionsMetadata | null = null;

/**
 * Load questions from JSON file
 * For MVP, loads from bundled sample questions
 * When packets are available, loads from packet system
 */
export async function loadQuestions(): Promise<QuizData> {
  // Try to load from packet system first
  try {
    const metadata = await getPacketList();
    if (metadata && metadata.packets.length > 0) {
      // Load a random packet
      return loadRandomPacket();
    }
  } catch {
    // Fall back to sample questions
  }

  // Fallback: Load from bundled sample questions
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const quizData = sampleQuestions as QuizData;

        if (!validateQuizData(quizData)) {
          reject(new Error('Invalid quiz data format'));
          return;
        }

        resolve(quizData);
      } catch (error) {
        reject(new Error(`Failed to load questions: ${error}`));
      }
    }, 100);
  });
}

/**
 * Get list of available packets
 */
export async function getPacketList(): Promise<QuestionsMetadata | null> {
  if (metadataCache) {
    return metadataCache;
  }

  try {
    // Dynamic import of metadata
    const metadata = await import('../assets/questions/metadata.json');
    metadataCache = metadata.default as QuestionsMetadata;
    return metadataCache;
  } catch {
    return null;
  }
}

/**
 * Load a specific packet by ID
 */
export async function loadPacket(packetId: string): Promise<QuizData> {
  // Check cache
  if (packetCache.has(packetId)) {
    return packetCache.get(packetId)!;
  }

  try {
    // Dynamic import of packet file
    const packet = await import(`../assets/questions/packets/${packetId}.json`);
    const quizData: QuizData = {
      tossups: packet.tossups || packet.default?.tossups || [],
      bonuses: packet.bonuses || packet.default?.bonuses || [],
    };

    if (!validateQuizData(quizData)) {
      throw new Error(`Invalid packet data: ${packetId}`);
    }

    // Cache for future use
    packetCache.set(packetId, quizData);
    return quizData;
  } catch (error) {
    throw new Error(`Failed to load packet ${packetId}: ${error}`);
  }
}

/**
 * Load a random packet, optionally filtered by criteria
 */
export async function loadRandomPacket(filters?: QuizFilters): Promise<QuizData> {
  const metadata = await getPacketList();

  if (!metadata || metadata.packets.length === 0) {
    // Fall back to sample questions
    return loadQuestions();
  }

  // Filter packets based on criteria
  let eligiblePackets = metadata.packets;

  if (filters?.difficulty && filters.difficulty !== 'mixed' as any) {
    eligiblePackets = eligiblePackets.filter(
      p => p.difficulty === filters.difficulty || p.difficulty === 'mixed'
    );
  }

  if (filters?.categories && filters.categories.length > 0) {
    eligiblePackets = eligiblePackets.filter(p =>
      filters.categories!.some(c => p.categories.includes(c))
    );
  }

  if (eligiblePackets.length === 0) {
    throw new Error('No packets match the specified filters');
  }

  // Select random packet
  const randomIndex = Math.floor(Math.random() * eligiblePackets.length);
  const selectedPacket = eligiblePackets[randomIndex];

  return loadPacket(selectedPacket.id);
}

/**
 * Load questions by category
 */
export async function loadByCategory(category: QuestionCategory): Promise<QuizData> {
  try {
    const categoryFileName = category.toLowerCase().replace(/\s+/g, '-');
    const categoryData = await import(`../assets/questions/by-category/${categoryFileName}.json`);

    const quizData: QuizData = {
      tossups: categoryData.tossups || categoryData.default?.tossups || [],
      bonuses: categoryData.bonuses || categoryData.default?.bonuses || [],
    };

    if (!validateQuizData(quizData)) {
      throw new Error(`Invalid category data: ${category}`);
    }

    return quizData;
  } catch (error) {
    throw new Error(`Failed to load category ${category}: ${error}`);
  }
}

/**
 * Load questions filtered by multiple criteria
 */
export async function loadFilteredQuestions(filters: QuizFilters): Promise<QuizData> {
  // If specific packet requested
  if (filters.packetId) {
    return loadPacket(filters.packetId);
  }

  // If single category requested, use category file
  if (filters.categories?.length === 1) {
    const categoryData = await loadByCategory(filters.categories[0]);

    // Apply difficulty filter if specified
    if (filters.difficulty) {
      return {
        tossups: categoryData.tossups.filter(t => t.difficulty === filters.difficulty),
        bonuses: categoryData.bonuses.filter(b => b.difficulty === filters.difficulty),
      };
    }

    return categoryData;
  }

  // Otherwise load a random packet matching filters
  return loadRandomPacket(filters);
}

/**
 * Get statistics about available questions
 */
export async function getQuestionStats(): Promise<{
  totalPackets: number;
  totalTossups: number;
  totalBonuses: number;
  categories: QuestionCategory[];
  categoryStats: Record<string, { tossups: number; bonuses: number }>;
} | null> {
  const metadata = await getPacketList();

  if (!metadata) {
    return null;
  }

  return {
    totalPackets: metadata.totalPackets,
    totalTossups: metadata.totalTossups,
    totalBonuses: metadata.totalBonuses,
    categories: Object.keys(metadata.categoryStats) as QuestionCategory[],
    categoryStats: metadata.categoryStats,
  };
}

/**
 * Clear the packet cache (useful for testing or refreshing data)
 */
export function clearCache(): void {
  packetCache.clear();
  metadataCache = null;
}

/**
 * Validate quiz data structure
 * Ensures all required fields are present and properly formatted
 */
export function validateQuizData(data: any): boolean {
  try {
    // Check if data exists and has required properties
    if (!data || typeof data !== 'object') {
      console.error('Quiz data is not an object');
      return false;
    }

    if (!Array.isArray(data.tossups) || !Array.isArray(data.bonuses)) {
      console.error('Missing tossups or bonuses arrays');
      return false;
    }

    // Validate each toss-up
    for (const tossup of data.tossups) {
      if (!validateTossup(tossup)) {
        return false;
      }
    }

    // Validate each bonus
    for (const bonus of data.bonuses) {
      if (!validateBonus(bonus)) {
        return false;
      }
    }

    // Ensure bonuses link to valid toss-ups
    const tossupIds = new Set(data.tossups.map((t: TossupQuestion) => t.id));
    for (const bonus of data.bonuses) {
      if (!tossupIds.has(bonus.linkedTossupId)) {
        console.error(`Bonus ${bonus.id} links to non-existent toss-up ${bonus.linkedTossupId}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating quiz data:', error);
    return false;
  }
}

/**
 * Validate a single toss-up question
 */
function validateTossup(tossup: any): boolean {
  if (!tossup.id || typeof tossup.id !== 'string') {
    console.error('Toss-up missing or invalid id');
    return false;
  }

  if (!tossup.text || typeof tossup.text !== 'string') {
    console.error(`Toss-up ${tossup.id} missing or invalid text`);
    return false;
  }

  if (typeof tossup.powerMarkPosition !== 'number') {
    console.error(`Toss-up ${tossup.id} missing or invalid powerMarkPosition`);
    return false;
  }

  if (!tossup.answer || typeof tossup.answer !== 'string') {
    console.error(`Toss-up ${tossup.id} missing or invalid answer`);
    return false;
  }

  if (!Array.isArray(tossup.acceptableAnswers) || tossup.acceptableAnswers.length === 0) {
    console.error(`Toss-up ${tossup.id} missing or invalid acceptableAnswers`);
    return false;
  }

  return true;
}

/**
 * Validate a single bonus question
 */
function validateBonus(bonus: any): boolean {
  if (!bonus.id || typeof bonus.id !== 'string') {
    console.error('Bonus missing or invalid id');
    return false;
  }

  if (!bonus.linkedTossupId || typeof bonus.linkedTossupId !== 'string') {
    console.error(`Bonus ${bonus.id} missing or invalid linkedTossupId`);
    return false;
  }

  if (!Array.isArray(bonus.parts) || bonus.parts.length !== 3) {
    console.error(`Bonus ${bonus.id} must have exactly 3 parts`);
    return false;
  }

  // Validate each part
  for (let i = 0; i < bonus.parts.length; i++) {
    const part = bonus.parts[i];
    if (!part.text || typeof part.text !== 'string') {
      console.error(`Bonus ${bonus.id} part ${i} missing or invalid text`);
      return false;
    }
    if (!part.answer || typeof part.answer !== 'string') {
      console.error(`Bonus ${bonus.id} part ${i} missing or invalid answer`);
      return false;
    }
    if (!Array.isArray(part.acceptableAnswers) || part.acceptableAnswers.length === 0) {
      console.error(`Bonus ${bonus.id} part ${i} missing or invalid acceptableAnswers`);
      return false;
    }
  }

  return true;
}

/**
 * Get the bonus question linked to a toss-up
 * @param quizData The quiz data
 * @param tossupId The toss-up question ID
 * @returns The linked bonus question, or null if not found
 */
export function getLinkedBonus(
  quizData: QuizData,
  tossupId: string
): BonusQuestion | null {
  const bonus = quizData.bonuses.find((b) => b.linkedTossupId === tossupId);
  return bonus || null;
}

/**
 * Get a question by ID
 * @param quizData The quiz data
 * @param questionId The question ID
 * @returns The question, or null if not found
 */
export function getQuestionById(
  quizData: QuizData,
  questionId: string
): TossupQuestion | BonusQuestion | null {
  // Check toss-ups
  const tossup = quizData.tossups.find((t) => t.id === questionId);
  if (tossup) return tossup;

  // Check bonuses
  const bonus = quizData.bonuses.find((b) => b.id === questionId);
  if (bonus) return bonus;

  return null;
}
