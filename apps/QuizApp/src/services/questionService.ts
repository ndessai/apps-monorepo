/**
 * Question Service
 *
 * Loads and validates NAQT-format quiz questions
 */

import { QuizData, TossupQuestion, BonusQuestion } from '../types/quiz';
import sampleQuestions from '../assets/sample-questions.json';

/**
 * Load questions from JSON file
 * For MVP, loads from bundled sample questions
 * Future: Load from API or local database
 */
export async function loadQuestions(): Promise<QuizData> {
  // Simulate async loading (in future, this would be a network request)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const quizData = sampleQuestions as QuizData;

        // Validate the data structure
        if (!validateQuizData(quizData)) {
          reject(new Error('Invalid quiz data format'));
          return;
        }

        resolve(quizData);
      } catch (error) {
        reject(new Error(`Failed to load questions: ${error}`));
      }
    }, 100); // Small delay to simulate loading
  });
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
