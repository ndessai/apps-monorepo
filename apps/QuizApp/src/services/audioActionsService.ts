/**
 * Audio Actions Service
 *
 * Pure classifier for voice commands during quiz.
 * Does NOT manage voice service - that is now owned by useQuizVoice hook.
 *
 * Key features:
 * - classifyAction: Pure function that classifies speech into actions
 * - Question-type aware command detection
 * - Fuzzy matching for command word detection
 *
 * ARCHITECTURE NOTE:
 * This service was refactored from a stateful service to pure functions.
 * Voice service lifecycle is now managed by useQuizVoice hook in QuizScreen.
 */

import type {
  QuestionTypeKey,
  AudioActionResult,
  AudioActionContext,
  AudioCommand,
} from '../types/quizFormat';
import { isCommandSupported, getCommandsForMode } from '../types/quizFormat';

// Command trigger words for different actions
const BUZZ_TRIGGER_WORDS = ['buzz', 'bus', 'buz', 'buds', 'buzzer'];
const PAUSE_TRIGGER_WORDS = ['pause', 'paws', 'pos'];
const STOP_TRIGGER_WORDS = ['stop', 'top', 'stap'];
const QUIT_TRIGGER_WORDS = ['quit', 'exit', 'leave'];
const SUBMIT_TRIGGER_WORDS = ['submit', 'done', 'finish', 'send'];

// Minimum similarity threshold for fuzzy matching (0-1)
const FUZZY_MATCH_THRESHOLD = 0.7;

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const maxLen = Math.max(s1.length, s2.length);
  return 1 - matrix[s1.length][s2.length] / maxLen;
}

/**
 * Check if text matches any trigger words (exact or fuzzy)
 */
function matchesTriggerWords(text: string, triggerWords: string[]): { matches: boolean; confidence: number } {
  const words = text.toLowerCase().split(/\s+/);
  let bestConfidence = 0;

  for (const word of words) {
    // Exact match check
    if (triggerWords.includes(word)) {
      return { matches: true, confidence: 1.0 };
    }

    // Fuzzy match check
    for (const trigger of triggerWords) {
      const similarity = calculateSimilarity(word, trigger);
      if (similarity >= FUZZY_MATCH_THRESHOLD) {
        bestConfidence = Math.max(bestConfidence, similarity);
      }
    }
  }

  return { matches: bestConfidence >= FUZZY_MATCH_THRESHOLD, confidence: bestConfidence };
}

/**
 * Check if text contains any command word (buzz, pause, stop, quit, submit)
 * Used by TTS echo filtering to preserve command words
 */
export function containsCommandWord(text: string): boolean {
  const allTriggers = [...BUZZ_TRIGGER_WORDS, ...PAUSE_TRIGGER_WORDS, ...STOP_TRIGGER_WORDS, ...QUIT_TRIGGER_WORDS, ...SUBMIT_TRIGGER_WORDS];
  const { matches } = matchesTriggerWords(text, allTriggers);
  return matches;
}

/**
 * Helper to check if a command is supported based on context
 * Uses mode-aware checking if quizMode is provided, otherwise falls back to standard check
 */
function isCommandSupportedInContext(
  questionType: QuestionTypeKey,
  command: AudioCommand,
  quizMode?: 'pro' | 'learn'
): boolean {
  if (quizMode) {
    const supportedCommands = getCommandsForMode(questionType, quizMode);
    return supportedCommands.includes(command);
  }
  return isCommandSupported(questionType, command);
}

/**
 * Pure function: Classify speech into an action based on context
 *
 * @param speech - The speech text to classify
 * @param context - The current quiz context (question type, reading state, etc.)
 * @returns AudioActionResult with the classified action type
 */
export function classifyAction(speech: string, context: AudioActionContext): AudioActionResult {
  const { questionType, quizMode, isReading, allowCommands } = context;

  if (!allowCommands || speech.trim().length === 0) {
    return { type: 'none', rawSpeech: speech };
  }

  // Check for buzz/interrupt command
  const buzzMatch = matchesTriggerWords(speech, BUZZ_TRIGGER_WORDS);
  if (buzzMatch.matches && isCommandSupportedInContext(questionType, 'Buzz', quizMode)) {
    return {
      type: 'interrupt',
      confidence: buzzMatch.confidence,
      rawSpeech: speech,
    };
  }

  // Check for pause command
  const pauseMatch = matchesTriggerWords(speech, PAUSE_TRIGGER_WORDS);
  if (pauseMatch.matches && isCommandSupportedInContext(questionType, 'Pause', quizMode)) {
    return {
      type: 'pause',
      confidence: pauseMatch.confidence,
      rawSpeech: speech,
    };
  }

  // Check for stop command
  const stopMatch = matchesTriggerWords(speech, STOP_TRIGGER_WORDS);
  if (stopMatch.matches && isCommandSupportedInContext(questionType, 'Stop', quizMode)) {
    return {
      type: 'stop',
      confidence: stopMatch.confidence,
      rawSpeech: speech,
    };
  }

  // Check for quit command (supported for all question types)
  const quitMatch = matchesTriggerWords(speech, QUIT_TRIGGER_WORDS);
  if (quitMatch.matches) {
    return {
      type: 'quit',
      confidence: quitMatch.confidence,
      rawSpeech: speech,
    };
  }

  // Check for submit command
  const submitMatch = matchesTriggerWords(speech, SUBMIT_TRIGGER_WORDS);
  if (submitMatch.matches && isCommandSupportedInContext(questionType, 'Submit', quizMode)) {
    return {
      type: 'submit',
      confidence: submitMatch.confidence,
      rawSpeech: speech,
    };
  }

  // Not a command - treat as answer text
  return {
    type: 'answer',
    text: speech,
    rawSpeech: speech,
  };
}

/**
 * Create an AudioActionContext from quiz state
 */
export function createActionContext(
  questionType: QuestionTypeKey,
  isReading: boolean,
  allowCommands: boolean
): AudioActionContext {
  return {
    questionType,
    isReading,
    allowCommands,
  };
}