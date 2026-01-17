/**
 * Audio Actions Service
 *
 * Handles hands-free voice commands during quiz:
 * - Detects "Buzz" command during tossup questions
 * - Uses nativeVoiceService for speech recognition
 * - Coordinates TTS filtering through nativeVoiceService
 *
 * Key design decisions:
 * - Delegates voice handling to nativeVoiceService
 * - Keeps buzz detection logic (fuzzy matching) local
 * - Uses session tracking to prevent stale events
 */

import * as voiceService from './nativeVoiceService';

// Words that trigger a buzz action (case-insensitive)
const BUZZ_TRIGGER_WORDS = ['buzz', 'bus', 'buz', 'buds', 'buzzer', 'pause', 'stop'];

// Minimum similarity threshold for fuzzy matching (0-1)
const FUZZY_MATCH_THRESHOLD = 0.7;

export type AudioActionCallback = {
  onBuzzDetected: () => void;
  onSpeechResult: (text: string) => void;
  onError?: (error: string) => void;
};

// Session tracking
let sessionId = 0;
let activeSessionId: number | null = null;
let currentCallback: AudioActionCallback | null = null;

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
 * Check if text contains a buzz trigger word
 */
function containsBuzzTrigger(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/);

  for (const word of words) {
    // Exact match check
    if (BUZZ_TRIGGER_WORDS.includes(word)) {
      return true;
    }

    // Fuzzy match check for each trigger word
    for (const trigger of BUZZ_TRIGGER_WORDS) {
      if (calculateSimilarity(word, trigger) >= FUZZY_MATCH_THRESHOLD) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Handle speech results from voiceService
 */
function handleSpeechResult(text: string): void {
  if (activeSessionId === null || !currentCallback) {
    return;
  }

  console.log('[AudioActions] Speech result:', text);

  // Check for buzz command first
  if (containsBuzzTrigger(text)) {
    console.log('[AudioActions] Buzz detected!');
    currentCallback.onBuzzDetected();
    return;
  }

  // Pass through filtered speech result
  if (text.trim().length > 0) {
    currentCallback.onSpeechResult(text);
  }
}

/**
 * Handle speech errors from voiceService
 */
function handleSpeechError(error: string): void {
  if (activeSessionId === null) {
    return;
  }

  console.error('[AudioActions] Speech error:', error);
  currentCallback?.onError?.(error);
}

/**
 * Start continuous listening for voice commands
 */
export async function startAudioActions(
  callback: AudioActionCallback
): Promise<boolean> {
  try {
    // If already listening, just update the callback and return
    if (activeSessionId !== null && voiceService.isListening()) {
      console.log('[AudioActions] Already listening, updating callback');
      currentCallback = callback;
      return true;
    }

    // Create new session
    sessionId++;
    activeSessionId = sessionId;
    currentCallback = callback;

    console.log(`[AudioActions] Starting session ${sessionId}`);

    // Start listening via voiceService with TTS filtering enabled
    const success = await voiceService.startListening(
      {
        continuous: true,
        filterTTSEcho: true,
        language: 'en-US',
      },
      {
        onResult: handleSpeechResult,
        onError: handleSpeechError,
        onEnd: () => {
          console.log('[AudioActions] Voice session ended');
        },
      }
    );

    if (!success) {
      console.warn('[AudioActions] Failed to start voiceService');
      activeSessionId = null;
      currentCallback = null;
      return false;
    }

    console.log('[AudioActions] Started listening');
    return true;
  } catch (error) {
    console.error('[AudioActions] Failed to start:', error);
    activeSessionId = null;
    currentCallback = null;
    return false;
  }
}

/**
 * Stop listening for voice commands
 */
export async function stopAudioActions(): Promise<void> {
  const wasSession = activeSessionId;

  // Invalidate session first
  activeSessionId = null;
  currentCallback = null;

  console.log(`[AudioActions] Stopping session ${wasSession}`);

  // Stop voiceService
  await voiceService.stopListening();

  console.log('[AudioActions] Stopped');
}

/**
 * Set the current question text for filtering
 * This tells voiceService to filter out TTS echo
 */
export function setQuestionTextForFiltering(questionText: string): void {
  voiceService.setTTSFilterText(questionText);
}

/**
 * Clear the question text filter
 */
export function clearQuestionTextFilter(): void {
  voiceService.clearTTSFilter();
}

/**
 * Check if audio actions are active
 */
export function isAudioActionsActive(): boolean {
  return activeSessionId !== null && voiceService.isListening();
}

/**
 * Pause listening (enable filtering)
 * @deprecated Use setQuestionTextForFiltering instead
 */
export function pauseListening(): void {
  // TTS filtering is already handled by voiceService
  // This is kept for API compatibility
}

/**
 * Resume listening (disable filtering)
 * @deprecated Use clearQuestionTextFilter instead
 */
export function resumeListening(): void {
  // TTS filtering is already handled by voiceService
  // This is kept for API compatibility
}
