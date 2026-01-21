/**
 * Quiz Format Type Definitions
 *
 * Extensible type system for multiple quiz formats and question types.
 * Supports audio command configuration per question type.
 */

import type { QuizMode } from './quiz';

// Quiz Format Types - the overall quiz structure
export type QuizFormat = 'TossupBonus' | 'Standard';

// Question Type Keys - individual question types within a quiz
export type QuestionTypeKey = 'Tossup' | 'Bonus' | 'Standard';

// Audio Commands that can be triggered by voice
export type AudioCommand = 'Buzz' | 'Pause' | 'Stop' | 'Quit' | 'Submit';

// Action types returned by the classifier
export type AudioActionType = 'interrupt' | 'answer' | 'pause' | 'stop' | 'quit' | 'submit' | 'none';

// Classification result from the audio actions classifier
export interface AudioActionResult {
  type: AudioActionType;
  text?: string;         // For 'answer' type - the spoken answer text
  confidence?: number;   // Command match confidence (0-1)
  rawSpeech?: string;    // Original unprocessed speech
}

// Context provided to the classifier for making decisions
export interface AudioActionContext {
  questionType: QuestionTypeKey;
  quizMode?: QuizMode;
  isReading: boolean;
  allowCommands: boolean;
}

// Configuration for audio actions per question type
export interface QuestionTypeAudioConfig {
  supportedCommands: AudioCommand[];
  allowInterruptDuringReading: boolean;
}

// Question type audio configurations
export const QUESTION_TYPE_AUDIO_CONFIG: Record<QuestionTypeKey, QuestionTypeAudioConfig> = {
  Tossup: {
    supportedCommands: ['Buzz', 'Submit'],
    allowInterruptDuringReading: true,
  },
  Bonus: {
    supportedCommands: ['Pause', 'Stop', 'Submit'],
    allowInterruptDuringReading: false,
  },
  Standard: {
    supportedCommands: ['Buzz', 'Pause', 'Stop', 'Submit'],
    allowInterruptDuringReading: true,
  },
};

/**
 * Check if a command is supported for a given question type
 */
export function isCommandSupported(questionType: QuestionTypeKey, command: AudioCommand): boolean {
  const config = QUESTION_TYPE_AUDIO_CONFIG[questionType];
  return config.supportedCommands.includes(command);
}

/**
 * Get the audio configuration for a question type
 */
export function getQuestionTypeAudioConfig(questionType: QuestionTypeKey): QuestionTypeAudioConfig {
  return QUESTION_TYPE_AUDIO_CONFIG[questionType];
}

/**
 * Get all supported commands for a question type
 */
export function getSupportedCommands(questionType: QuestionTypeKey): AudioCommand[] {
  return QUESTION_TYPE_AUDIO_CONFIG[questionType].supportedCommands;
}

/**
 * Check if interrupting during reading is allowed for a question type
 */
export function canInterruptDuringReading(questionType: QuestionTypeKey): boolean {
  return QUESTION_TYPE_AUDIO_CONFIG[questionType].allowInterruptDuringReading;
}

/**
 * Get supported commands for a question type based on quiz mode
 * Learn mode allows pause/stop for all question types (for pausing quiz)
 * Pro mode uses standard command configuration
 */
export function getCommandsForMode(questionType: QuestionTypeKey, mode: QuizMode): AudioCommand[] {
  if (mode === 'learn') {
    // Learn mode allows pause/stop for all question types to enable pausing the quiz
    // Also includes the standard commands for the question type
    const standardCommands = QUESTION_TYPE_AUDIO_CONFIG[questionType].supportedCommands;
    const learnCommands: AudioCommand[] = ['Pause', 'Stop'];

    // Merge: add learn commands that aren't already in standard commands
    const merged = [...standardCommands];
    for (const cmd of learnCommands) {
      if (!merged.includes(cmd)) {
        merged.push(cmd);
      }
    }
    return merged;
  }

  // Pro mode uses standard configuration
  return QUESTION_TYPE_AUDIO_CONFIG[questionType].supportedCommands;
}
