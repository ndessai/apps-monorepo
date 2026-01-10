import { Database, Q } from '@nozbe/watermelondb';
import { v4 as uuidv4 } from 'uuid';
import { QuizHistory } from '../models/QuizHistory';
import type {
  QuizHistoryStats,
  QuizHistoryEntry,
  NAQTDifficulty,
} from '../types/settings';

/**
 * Save a completed quiz to history
 */
export async function saveQuizHistory(
  database: Database,
  userId: string,
  session: {
    totalScore: number;
    maxScore: number;
    tossupCorrect: number;
    tossupTotal: number;
    bonusPoints: number;
    bonusMaxPoints: number;
    results: unknown[];
  },
  difficulty: NAQTDifficulty,
  durationSeconds: number
): Promise<QuizHistory> {
  const historyCollection = database.get<QuizHistory>('quiz_history');

  const accuracy =
    session.tossupTotal > 0
      ? Math.round((session.tossupCorrect / session.tossupTotal) * 100)
      : 0;

  const history = await database.write(async () => {
    return await historyCollection.create((h) => {
      h.sessionId = uuidv4();
      h.userId = userId;
      h.difficulty = difficulty;
      h.totalScore = session.totalScore;
      h.maxScore = session.maxScore;
      h.accuracy = accuracy;
      h.tossupCorrect = session.tossupCorrect;
      h.tossupTotal = session.tossupTotal;
      h.bonusPoints = session.bonusPoints;
      h.bonusMaxPoints = session.bonusMaxPoints;
      h.durationSeconds = durationSeconds;
      h.resultsJson = session.results as object;
    });
  });

  return history;
}

/**
 * Get quiz history for a user
 */
export async function getUserHistory(
  database: Database,
  userId: string,
  limit?: number
): Promise<QuizHistoryEntry[]> {
  const historyCollection = database.get<QuizHistory>('quiz_history');

  let query = historyCollection.query(
    Q.where('user_id', userId),
    Q.sortBy('completed_at', Q.desc)
  );

  if (limit) {
    query = historyCollection.query(
      Q.where('user_id', userId),
      Q.sortBy('completed_at', Q.desc),
      Q.take(limit)
    );
  }

  const entries = await query.fetch();

  return entries.map((entry) => ({
    sessionId: entry.sessionId,
    difficulty: entry.difficulty as NAQTDifficulty,
    totalScore: entry.totalScore,
    maxScore: entry.maxScore,
    accuracy: entry.accuracy,
    tossupCorrect: entry.tossupCorrect,
    tossupTotal: entry.tossupTotal,
    bonusPoints: entry.bonusPoints,
    bonusMaxPoints: entry.bonusMaxPoints,
    durationSeconds: entry.durationSeconds,
    completedAt: entry.completedAt,
  }));
}

/**
 * Get aggregated stats for a user
 */
export async function getUserStats(
  database: Database,
  userId: string
): Promise<QuizHistoryStats> {
  const historyCollection = database.get<QuizHistory>('quiz_history');

  const entries = await historyCollection
    .query(Q.where('user_id', userId))
    .fetch();

  if (entries.length === 0) {
    return {
      totalQuizzes: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      totalScore: 0,
      averageScore: 0,
      totalTossupCorrect: 0,
      totalTossupAttempted: 0,
      totalBonusPoints: 0,
      totalPlayTimeSeconds: 0,
    };
  }

  const totalQuizzes = entries.length;
  const totalAccuracy = entries.reduce((sum, e) => sum + e.accuracy, 0);
  const averageAccuracy = Math.round(totalAccuracy / totalQuizzes);
  const bestAccuracy = Math.max(...entries.map((e) => e.accuracy));
  const totalScore = entries.reduce((sum, e) => sum + e.totalScore, 0);
  const averageScore = Math.round(totalScore / totalQuizzes);
  const totalTossupCorrect = entries.reduce((sum, e) => sum + e.tossupCorrect, 0);
  const totalTossupAttempted = entries.reduce((sum, e) => sum + e.tossupTotal, 0);
  const totalBonusPoints = entries.reduce((sum, e) => sum + e.bonusPoints, 0);
  const totalPlayTimeSeconds = entries.reduce((sum, e) => sum + e.durationSeconds, 0);

  return {
    totalQuizzes,
    averageAccuracy,
    bestAccuracy,
    totalScore,
    averageScore,
    totalTossupCorrect,
    totalTossupAttempted,
    totalBonusPoints,
    totalPlayTimeSeconds,
  };
}

/**
 * Get a single quiz history entry by session ID
 */
export async function getHistoryEntry(
  database: Database,
  sessionId: string
): Promise<QuizHistoryEntry | null> {
  const historyCollection = database.get<QuizHistory>('quiz_history');

  const entries = await historyCollection
    .query(Q.where('session_id', sessionId))
    .fetch();

  if (entries.length === 0) {
    return null;
  }

  const entry = entries[0];
  return {
    sessionId: entry.sessionId,
    difficulty: entry.difficulty as NAQTDifficulty,
    totalScore: entry.totalScore,
    maxScore: entry.maxScore,
    accuracy: entry.accuracy,
    tossupCorrect: entry.tossupCorrect,
    tossupTotal: entry.tossupTotal,
    bonusPoints: entry.bonusPoints,
    bonusMaxPoints: entry.bonusMaxPoints,
    durationSeconds: entry.durationSeconds,
    completedAt: entry.completedAt,
  };
}

/**
 * Delete all history for a user
 */
export async function clearUserHistory(
  database: Database,
  userId: string
): Promise<void> {
  const historyCollection = database.get<QuizHistory>('quiz_history');

  const entries = await historyCollection
    .query(Q.where('user_id', userId))
    .fetch();

  await database.write(async () => {
    for (const entry of entries) {
      await entry.markAsDeleted();
    }
  });
}
