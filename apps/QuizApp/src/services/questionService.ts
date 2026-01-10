/**
 * Question Service
 *
 * Loads and validates NAQT-format quiz questions
 * For MVP/testing, uses bundled sample questions (2 tossups + bonuses)
 *
 * To enable full packet system with 5000+ questions:
 * 1. Set USE_PACKET_SYSTEM to true
 * 2. Uncomment the dynamic import functions below
 */

import { QuizData, TossupQuestion, BonusQuestion, QuestionCategory, QuestionDifficulty } from '../types/quiz';
import sampleQuestions from '../assets/sample-questions.json';

// Types for packet system (kept for future use)
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

/**
 * Configuration flag for packet system
 * Set to true to enable loading from 5000+ question packets
 * When false, uses bundled sample questions (2 tossups + bonuses) for testing
 */
const USE_PACKET_SYSTEM = false;

/**
 * Load questions from JSON file
 * Returns sample questions for testing (2 tossups + bonuses)
 */
export async function loadQuestions(): Promise<QuizData> {
  // Load from bundled sample questions (2 tossups + bonuses for testing)
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
 * Returns null when packet system is disabled
 */
export async function getPacketList(): Promise<QuestionsMetadata | null> {
  if (!USE_PACKET_SYSTEM) {
    return null;
  }
  // Packet system disabled - return null
  return null;
}

/**
 * Load a specific packet by ID
 * Throws error when packet system is disabled
 */
export async function loadPacket(_packetId: string): Promise<QuizData> {
  if (!USE_PACKET_SYSTEM) {
    throw new Error('Packet system is disabled. Set USE_PACKET_SYSTEM to true to enable.');
  }
  throw new Error('Packet system is disabled');
}

/**
 * Load a random packet, optionally filtered by criteria
 * Falls back to sample questions when packet system is disabled
 */
export async function loadRandomPacket(_filters?: QuizFilters): Promise<QuizData> {
  if (!USE_PACKET_SYSTEM) {
    return loadQuestions();
  }
  return loadQuestions();
}

/**
 * Load questions by category
 * Throws error when packet system is disabled
 */
export async function loadByCategory(_category: QuestionCategory): Promise<QuizData> {
  if (!USE_PACKET_SYSTEM) {
    throw new Error('Packet system is disabled. Set USE_PACKET_SYSTEM to true to enable.');
  }
  throw new Error('Packet system is disabled');
}

/**
 * Load questions filtered by multiple criteria
 * Falls back to sample questions when packet system is disabled
 */
export async function loadFilteredQuestions(_filters: QuizFilters): Promise<QuizData> {
  if (!USE_PACKET_SYSTEM) {
    return loadQuestions();
  }
  return loadQuestions();
}

/**
 * Get statistics about available questions
 * Returns null when packet system is disabled
 */
export async function getQuestionStats(): Promise<{
  totalPackets: number;
  totalTossups: number;
  totalBonuses: number;
  categories: QuestionCategory[];
  categoryStats: Record<string, { tossups: number; bonuses: number }>;
} | null> {
  if (!USE_PACKET_SYSTEM) {
    return null;
  }
  return null;
}

/**
 * Clear the packet cache (no-op when packet system is disabled)
 */
export function clearCache(): void {
  // No-op when packet system is disabled
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
