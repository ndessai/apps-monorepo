import { Database, Q } from '@nozbe/watermelondb';
import { QuizSettings } from '../models/QuizSettings';
import type { QuizSettingsData, NAQTDifficulty, ThemeMode } from '../types/settings';

/**
 * Default quiz settings
 */
const DEFAULT_SETTINGS: QuizSettingsData = {
  buzzerTimeMs: 3000,
  answerTimeMs: 3000,
  difficulty: 'varsity',
  theme: 'light',
};

/**
 * Get quiz settings for a user
 */
export async function getQuizSettings(
  database: Database,
  userId: string
): Promise<QuizSettingsData> {
  const settingsCollection = database.get<QuizSettings>('quiz_settings');

  const settings = await settingsCollection
    .query(Q.where('user_id', userId))
    .fetch();

  if (settings.length === 0) {
    return { ...DEFAULT_SETTINGS };
  }

  const s = settings[0];
  return {
    buzzerTimeMs: s.buzzerTimeMs,
    answerTimeMs: s.answerTimeMs,
    difficulty: s.difficulty as NAQTDifficulty,
    theme: (s.theme as ThemeMode) || 'light',
  };
}

/**
 * Update quiz settings for a user (creates if doesn't exist)
 */
export async function updateQuizSettings(
  database: Database,
  userId: string,
  newSettings: Partial<QuizSettingsData>
): Promise<QuizSettingsData> {
  const settingsCollection = database.get<QuizSettings>('quiz_settings');

  const existingSettings = await settingsCollection
    .query(Q.where('user_id', userId))
    .fetch();

  let updatedSettings: QuizSettingsData;

  await database.write(async () => {
    if (existingSettings.length === 0) {
      // Create new settings
      const merged = { ...DEFAULT_SETTINGS, ...newSettings };
      await settingsCollection.create((s) => {
        s.userId = userId;
        s.buzzerTimeMs = merged.buzzerTimeMs;
        s.answerTimeMs = merged.answerTimeMs;
        s.difficulty = merged.difficulty;
        s.theme = merged.theme;
      });
      updatedSettings = merged;
    } else {
      // Update existing settings
      const existing = existingSettings[0];
      await existing.update((s) => {
        if (newSettings.buzzerTimeMs !== undefined) {
          s.buzzerTimeMs = newSettings.buzzerTimeMs;
        }
        if (newSettings.answerTimeMs !== undefined) {
          s.answerTimeMs = newSettings.answerTimeMs;
        }
        if (newSettings.difficulty !== undefined) {
          s.difficulty = newSettings.difficulty;
        }
        if (newSettings.theme !== undefined) {
          s.theme = newSettings.theme;
        }
      });
      updatedSettings = {
        buzzerTimeMs: newSettings.buzzerTimeMs ?? existing.buzzerTimeMs,
        answerTimeMs: newSettings.answerTimeMs ?? existing.answerTimeMs,
        difficulty: (newSettings.difficulty ?? existing.difficulty) as NAQTDifficulty,
        theme: (newSettings.theme ?? existing.theme ?? 'light') as ThemeMode,
      };
    }
  });

  return updatedSettings!;
}

/**
 * Reset quiz settings to defaults
 */
export async function resetQuizSettings(
  database: Database,
  userId: string
): Promise<QuizSettingsData> {
  const settingsCollection = database.get<QuizSettings>('quiz_settings');

  const existingSettings = await settingsCollection
    .query(Q.where('user_id', userId))
    .fetch();

  await database.write(async () => {
    if (existingSettings.length > 0) {
      const existing = existingSettings[0];
      await existing.update((s) => {
        s.buzzerTimeMs = DEFAULT_SETTINGS.buzzerTimeMs;
        s.answerTimeMs = DEFAULT_SETTINGS.answerTimeMs;
        s.difficulty = DEFAULT_SETTINGS.difficulty;
        s.theme = DEFAULT_SETTINGS.theme;
      });
    } else {
      await settingsCollection.create((s) => {
        s.userId = userId;
        s.buzzerTimeMs = DEFAULT_SETTINGS.buzzerTimeMs;
        s.answerTimeMs = DEFAULT_SETTINGS.answerTimeMs;
        s.difficulty = DEFAULT_SETTINGS.difficulty;
        s.theme = DEFAULT_SETTINGS.theme;
      });
    }
  });

  return { ...DEFAULT_SETTINGS };
}

/**
 * Validate buzzer time is within acceptable range
 */
export function validateBuzzerTime(ms: number): number {
  return Math.max(1000, Math.min(10000, ms));
}

/**
 * Validate answer time is within acceptable range
 */
export function validateAnswerTime(ms: number): number {
  return Math.max(1000, Math.min(10000, ms));
}
