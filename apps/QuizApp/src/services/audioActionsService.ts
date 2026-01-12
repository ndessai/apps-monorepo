/**
 * Audio Actions Service
 *
 * Handles hands-free voice commands during quiz:
 * - Detects "Buzz" command during tossup questions
 * - Filters out question text from voice input to avoid interference
 * - Works alongside TTS (text-to-speech) for question reading
 *
 * Key design decisions:
 * - Sets up event handlers BEFORE calling Voice.start() to prevent "no listeners" warnings
 * - Keeps listeners registered while active to avoid race conditions
 * - Uses session tracking to prevent stale events
 */

import Voice from '@react-native-voice/voice';

// Words that trigger a buzz action (case-insensitive)
const BUZZ_TRIGGER_WORDS = ['buzz', 'bus', 'buz', 'buds', 'buzzer', 'pause'];

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

let isListening = false;
let currentCallback: AudioActionCallback | null = null;
let currentQuestionText: string = '';
let isFilteringEnabled = false;

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
 * Remove question text fragments from speech result
 */
function filterQuestionText(speechText: string, questionText: string): string {
  if (!questionText || !isFilteringEnabled) {
    return speechText;
  }

  const normalizedSpeech = speechText.toLowerCase().trim();
  const normalizedQuestion = questionText.toLowerCase().trim();

  const questionWords = normalizedQuestion
    .split(/\s+/)
    .filter((word) => word.length >= 3);

  const speechWords = normalizedSpeech.split(/\s+/);

  let matchCount = 0;
  for (const speechWord of speechWords) {
    for (const questionWord of questionWords) {
      if (
        speechWord === questionWord ||
        calculateSimilarity(speechWord, questionWord) >= 0.8
      ) {
        matchCount++;
        break;
      }
    }
  }

  const matchRatio = speechWords.length > 0 ? matchCount / speechWords.length : 0;
  if (matchRatio > 0.5) {
    console.log('[AudioActions] Filtering out question echo:', speechText);
    return '';
  }

  return speechText;
}

/**
 * Handle speech results
 */
function handleSpeechResults(e: any): void {
  // Ignore if no active session
  if (activeSessionId === null || !currentCallback || !e.value || e.value.length === 0) {
    return;
  }

  const rawText = e.value[0] || '';
  console.log('[AudioActions] Speech result:', rawText);

  // Check for buzz command first
  if (containsBuzzTrigger(rawText)) {
    console.log('[AudioActions] Buzz detected!');
    currentCallback.onBuzzDetected();
    return;
  }

  // Filter out question text if enabled
  const filteredText = filterQuestionText(rawText, currentQuestionText);

  if (filteredText.trim().length > 0) {
    currentCallback.onSpeechResult(filteredText);
  }
}

/**
 * Handle speech errors
 */
function handleSpeechError(e: any): void {
  // Ignore if no active session
  if (activeSessionId === null) {
    return;
  }

  console.error('[AudioActions] Speech error:', e);

  // Some errors are recoverable
  if (isListening) {
    const recoverableErrors = ['recognition_fail', 'network', 'no_match', 'speech_timeout'];
    const errorCode = e.error?.code || '';

    if (recoverableErrors.some((code) => errorCode.includes(code))) {
      console.log('[AudioActions] Attempting restart after error');
      setTimeout(() => {
        if (isListening && activeSessionId !== null) {
          restartListening();
        }
      }, 500);
      return;
    }
  }

  if (currentCallback?.onError) {
    currentCallback.onError(e.error?.message || 'Speech recognition error');
  }
}

/**
 * Handle speech end - restart if in continuous mode
 */
function handleSpeechEnd(): void {
  // Ignore if no active session
  if (activeSessionId === null) {
    return;
  }

  console.log('[AudioActions] Speech ended');

  if (isListening) {
    restartListening();
  }
}

/**
 * Handle speech start
 */
function handleSpeechStart(_e: any): void {
  // Ignore if no active session
  if (activeSessionId === null) {
    return;
  }
  console.log('[AudioActions] Speech started');
}

/**
 * Restart listening
 */
async function restartListening(): Promise<void> {
  if (activeSessionId === null) {
    return;
  }

  try {
    await Voice.stop();
  } catch {
    // Ignore
  }

  try {
    await Voice.destroy();
  } catch {
    // Ignore
  }

  setTimeout(async () => {
    if (isListening && activeSessionId !== null) {
      try {
        // Re-register handlers before starting
        Voice.onSpeechStart = handleSpeechStart;
        Voice.onSpeechResults = handleSpeechResults;
        Voice.onSpeechError = handleSpeechError;
        Voice.onSpeechEnd = handleSpeechEnd;

        await Voice.start('en-US');
        console.log('[AudioActions] Restarted listening');
      } catch (error) {
        console.error('[AudioActions] Failed to restart:', error);
        // Don't retry immediately to avoid loops
      }
    }
  }, 150);
}

/**
 * Start continuous listening for voice commands
 */
export async function startAudioActions(
  callback: AudioActionCallback
): Promise<boolean> {
  try {
    // If already listening, just update the callback and return
    if (isListening && activeSessionId !== null) {
      console.log('[AudioActions] Already listening, updating callback');
      currentCallback = callback;
      return true;
    }

    const isAvailable = await Voice.isAvailable();
    if (!isAvailable) {
      console.warn('[AudioActions] Voice recognition not available');
      return false;
    }

    // Stop any existing session first to avoid "already started" error
    try {
      await Voice.stop();
      await Voice.destroy();
    } catch {
      // Ignore - may not be running
    }

    // Create new session
    sessionId++;
    activeSessionId = sessionId;
    currentCallback = callback;

    console.log(`[AudioActions] Starting session ${sessionId}`);

    // Set up event handlers BEFORE starting - this prevents "no listeners" warnings
    Voice.onSpeechStart = handleSpeechStart;
    Voice.onSpeechResults = handleSpeechResults;
    Voice.onSpeechError = handleSpeechError;
    Voice.onSpeechEnd = handleSpeechEnd;

    // Small delay to ensure handlers are registered
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Now start listening
    await Voice.start('en-US');
    isListening = true;

    console.log('[AudioActions] Started listening');
    return true;
  } catch (error) {
    console.error('[AudioActions] Failed to start:', error);
    activeSessionId = null;
    currentCallback = null;
    isListening = false;
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
  isListening = false;
  currentCallback = null;
  currentQuestionText = '';
  isFilteringEnabled = false;

  console.log(`[AudioActions] Stopping session ${wasSession}`);

  try {
    await Voice.stop();
  } catch {
    // Ignore
  }

  try {
    await Voice.destroy();
  } catch {
    // Ignore
  }

  // Clear handlers
  Voice.onSpeechStart = undefined;
  Voice.onSpeechResults = undefined;
  Voice.onSpeechError = undefined;
  Voice.onSpeechEnd = undefined;

  console.log('[AudioActions] Stopped');
}

/**
 * Set the current question text for filtering
 */
export function setQuestionTextForFiltering(questionText: string): void {
  currentQuestionText = questionText;
  isFilteringEnabled = true;
}

/**
 * Clear the question text filter
 */
export function clearQuestionTextFilter(): void {
  currentQuestionText = '';
  isFilteringEnabled = false;
}

/**
 * Check if audio actions are active
 */
export function isAudioActionsActive(): boolean {
  return isListening && activeSessionId !== null;
}

/**
 * Pause listening (enable filtering)
 */
export function pauseListening(): void {
  isFilteringEnabled = true;
}

/**
 * Resume listening (disable filtering)
 */
export function resumeListening(): void {
  isFilteringEnabled = false;
}
