/**
 * Settings Type Definitions
 * Types for settings screen and quiz configuration
 */

import type { ThemeMode } from '@monorepo/ui-components';

export type { ThemeMode };

// NAQT Difficulty Levels
export type NAQTDifficulty =
  | 'middle_school'
  | 'jv_high_school'
  | 'varsity'
  | 'college'
  | 'open';

export const NAQT_DIFFICULTY_LABELS: Record<NAQTDifficulty, string> = {
  middle_school: 'Middle School',
  jv_high_school: 'JV High School',
  varsity: 'Varsity',
  college: 'College',
  open: 'Open',
};

export const NAQT_DIFFICULTIES: NAQTDifficulty[] = [
  'middle_school',
  'jv_high_school',
  'varsity',
  'college',
  'open',
];

// Quiz Settings interface
export interface QuizSettingsData {
  buzzerTimeMs: number; // 1000-10000ms
  answerTimeMs: number; // 1000-10000ms (deprecated, kept for compatibility)
  tossupAnswerTimeMs: number; // 1000-10000ms - Answer time for tossup questions
  bonusAnswerTimeMs: number; // 1000-10000ms - Answer time for bonus questions
  microphoneEnabled: boolean; // Whether mic is auto-enabled when answering
  autoSubmitOnSilence: boolean; // Whether to auto-submit after silence when speaking
  autoSubmitSilenceMs: number; // 500-3000ms - Silence duration before auto-submit
  difficulty: NAQTDifficulty;
  theme: ThemeMode;
}

export const DEFAULT_QUIZ_SETTINGS: QuizSettingsData = {
  buzzerTimeMs: 3000,
  answerTimeMs: 3000,
  tossupAnswerTimeMs: 8000, // 8 seconds for tossup answers
  bonusAnswerTimeMs: 5000, // 5 seconds for bonus answers
  microphoneEnabled: true, // Microphone enabled by default
  autoSubmitOnSilence: true, // Auto-submit spoken answers by default
  autoSubmitSilenceMs: 1500, // 1.5 seconds of silence before auto-submit
  difficulty: 'varsity',
  theme: 'light',
};

export const MIN_TIME_MS = 1000;
export const MAX_TIME_MS = 10000;
export const TIME_STEP_MS = 500;

// Auto-submit silence time bounds
export const MIN_SILENCE_MS = 500;
export const MAX_SILENCE_MS = 3000;
export const SILENCE_STEP_MS = 100;

// Team interfaces
export interface TeamData {
  teamId: string;
  name: string;
  description?: string;
  ownerId: string;
  memberCount: number;
}

export interface TeamMemberData {
  userId: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface TeamInvitationData {
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
}

export interface CreateTeamData {
  name: string;
  description?: string;
}

// Badge interfaces
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface BadgeData {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

// Predefined badges
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first_quiz', name: 'First Steps', description: 'Complete your first quiz', icon: 'flag-checkered' },
  { id: 'perfect_round', name: 'Perfect Round', description: 'Get 100% accuracy on a quiz', icon: 'star-circle' },
  { id: 'quiz_master', name: 'Quiz Master', description: 'Complete 10 quizzes', icon: 'trophy' },
  { id: 'accuracy_ace', name: 'Accuracy Ace', description: 'Achieve 90%+ accuracy on any quiz', icon: 'bullseye-arrow' },
  { id: 'century_club', name: 'Century Club', description: 'Score 100+ points in a single quiz', icon: 'numeric-100-box' },
  { id: 'varsity_player', name: 'Varsity Player', description: 'Complete 5 quizzes at Varsity difficulty', icon: 'school' },
  { id: 'college_scholar', name: 'College Scholar', description: 'Complete 5 quizzes at College difficulty', icon: 'account-school' },
  { id: 'open_champion', name: 'Open Champion', description: 'Score 80%+ on Open difficulty', icon: 'crown' },
];

// History/Stats interfaces
export interface QuizHistoryStats {
  totalQuizzes: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalScore: number;
  averageScore: number;
  totalTossupCorrect: number;
  totalTossupAttempted: number;
  totalBonusPoints: number;
  totalPlayTimeSeconds: number;
}

export interface QuizHistoryEntry {
  sessionId: string;
  difficulty: NAQTDifficulty;
  totalScore: number;
  maxScore: number;
  accuracy: number;
  tossupCorrect: number;
  tossupTotal: number;
  bonusPoints: number;
  bonusMaxPoints: number;
  durationSeconds: number;
  completedAt: Date;
}
