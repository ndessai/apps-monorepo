/**
 * Quiz Scoring Service
 *
 * Implements NAQT scoring rules for toss-up and bonus questions
 */

import { TossupResult, BonusResult, QuizSession } from '../types/quiz';

/**
 * Calculate points for a toss-up question
 * NAQT Rules:
 * - Correct before power mark: 15 points
 * - Correct after power mark: 10 points
 * - Incorrect with interrupt (buzzed during reading): -5 points
 * - Incorrect without interrupt (buzzed after reading): 0 points
 *
 * @param isCorrect Whether the answer was correct
 * @param wasBeforePowerMark Whether user buzzed before power mark
 * @param wasInterrupted Whether user interrupted the question
 * @returns Points earned (-5, 0, 10, or 15)
 */
export function calculateTossupPoints(
  isCorrect: boolean,
  wasBeforePowerMark: boolean,
  wasInterrupted: boolean
): number {
  if (isCorrect) {
    // Correct answer
    return wasBeforePowerMark ? 15 : 10;
  } else {
    // Incorrect answer
    return wasInterrupted ? -5 : 0;
  }
}

/**
 * Calculate total points for a bonus question
 * Each correct part is worth 10 points (independent scoring)
 *
 * @param parts Array of bonus part results
 * @returns Total bonus points (0-30)
 */
export function calculateBonusPoints(
  parts: BonusResult['parts']
): number {
  return parts.reduce((total, part) => total + part.points, 0);
}

/**
 * Calculate overall session score and statistics
 *
 * @param session The quiz session to score
 * @returns Updated session with totals and accuracy
 */
export function calculateSessionScore(
  session: QuizSession
): {
  totalScore: number;
  maxPossibleScore: number;
  accuracy: number;
} {
  // Calculate total score from toss-ups
  const tossupScore = session.tossupResults.reduce(
    (total, result) => total + result.points,
    0
  );

  // Calculate total score from bonuses
  const bonusScore = session.bonusResults.reduce(
    (total, result) => total + result.totalPoints,
    0
  );

  const totalScore = tossupScore + bonusScore;

  // Calculate max possible score
  // Each toss-up: max 15 points
  // Each bonus (3 parts): max 30 points
  const numTossups = session.tossupResults.length;
  const numBonuses = session.bonusResults.length;
  const maxPossibleScore = numTossups * 15 + numBonuses * 30;

  // Calculate accuracy (percentage of max score achieved)
  const accuracy =
    maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

  return {
    totalScore,
    maxPossibleScore,
    accuracy: Math.max(0, accuracy), // Ensure non-negative (in case of penalties)
  };
}

/**
 * Calculate points for a single bonus part
 * @param isCorrect Whether the answer was correct
 * @returns 10 if correct, 0 if incorrect
 */
export function calculateBonusPartPoints(isCorrect: boolean): number {
  return isCorrect ? 10 : 0;
}

/**
 * Get score summary as a formatted string
 * @param session The quiz session
 * @returns Formatted score string (e.g., "45 / 90 (50%)")
 */
export function getScoreSummary(session: QuizSession): string {
  const { totalScore, maxPossibleScore, accuracy } =
    calculateSessionScore(session);

  return `${totalScore} / ${maxPossibleScore} (${accuracy.toFixed(1)}%)`;
}

/**
 * Determine if a score qualifies for a performance level
 * @param accuracy Accuracy percentage (0-100)
 * @returns Performance level description
 */
export function getPerformanceLevel(accuracy: number): string {
  if (accuracy >= 90) return 'Outstanding';
  if (accuracy >= 80) return 'Excellent';
  if (accuracy >= 70) return 'Very Good';
  if (accuracy >= 60) return 'Good';
  if (accuracy >= 50) return 'Fair';
  return 'Needs Practice';
}

/**
 * Count correct vs incorrect answers
 * @param session The quiz session
 * @returns Object with correct and incorrect counts
 */
export function getAnswerCounts(session: QuizSession): {
  tossupCorrect: number;
  tossupIncorrect: number;
  bonusCorrect: number;
  bonusIncorrect: number;
  totalCorrect: number;
  totalIncorrect: number;
} {
  const tossupCorrect = session.tossupResults.filter(
    (r) => r.isCorrect
  ).length;
  const tossupIncorrect = session.tossupResults.filter(
    (r) => !r.isCorrect
  ).length;

  let bonusCorrect = 0;
  let bonusIncorrect = 0;

  session.bonusResults.forEach((result) => {
    result.parts.forEach((part) => {
      if (part.isCorrect) {
        bonusCorrect++;
      } else {
        bonusIncorrect++;
      }
    });
  });

  return {
    tossupCorrect,
    tossupIncorrect,
    bonusCorrect,
    bonusIncorrect,
    totalCorrect: tossupCorrect + bonusCorrect,
    totalIncorrect: tossupIncorrect + bonusIncorrect,
  };
}
