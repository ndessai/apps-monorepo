/**
 * Audio Actions Service
 *
 * Handles hands-free voice commands during quiz:
 * - Detects "Buzz" command during tossup questions
 * - Filters out question text from voice input to avoid interference
 * - Works alongside TTS (text-to-speech) for question reading
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
 * This helps filter out when the microphone picks up the TTS reading the question
 */
function filterQuestionText(speechText: string, questionText: string): string {
  if (!questionText || !isFilteringEnabled) {
    return speechText;
  }

  // Normalize both texts
  const normalizedSpeech = speechText.toLowerCase().trim();
  const normalizedQuestion = questionText.toLowerCase().trim();

  // Split question into significant words (3+ characters)
  const questionWords = normalizedQuestion
    .split(/\s+/)
    .filter((word) => word.length >= 3);

  // Split speech into words
  const speechWords = normalizedSpeech.split(/\s+/);

  // Count how many speech words match question words
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

  // If more than 50% of speech words match question words, filter it out
  const matchRatio = speechWords.length > 0 ? matchCount / speechWords.length : 0;
  if (matchRatio > 0.5) {
    console.log(
      '[AudioActions] Filtering out speech that matches question text:',
      speechText
    );
    return '';
  }

  return speechText;
}

/**
 * Handle speech results from Voice recognition
 */
function handleSpeechResults(e: any): void {
  if (!currentCallback || !e.value || e.value.length === 0) {
    return;
  }

  const rawText = e.value[0] || '';
  console.log('[AudioActions] Raw speech result:', rawText);

  // Check for buzz command first (always check, even during filtering)
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
  console.error('[AudioActions] Speech error:', e);

  // Some errors are recoverable - try to restart listening
  if (isListening) {
    // Error codes that indicate we should restart
    const recoverableErrors = [
      'recognition_fail',
      'network',
      'no_match',
      'speech_timeout',
    ];

    const errorCode = e.error?.code || '';
    if (recoverableErrors.some((code) => errorCode.includes(code))) {
      console.log('[AudioActions] Attempting to restart after recoverable error');
      setTimeout(() => {
        if (isListening) {
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
 * Handle speech end - restart if we're in continuous mode
 */
function handleSpeechEnd(): void {
  console.log('[AudioActions] Speech ended');

  // Restart listening if we're still in listening mode
  if (isListening) {
    restartListening();
  }
}

/**
 * Restart listening after a brief delay
 */
async function restartListening(): Promise<void> {
  try {
    await Voice.stop();
  } catch {
    // Ignore stop errors
  }

  setTimeout(async () => {
    if (isListening) {
      try {
        await Voice.start('en-US');
        console.log('[AudioActions] Restarted listening');
      } catch (error) {
        console.error('[AudioActions] Failed to restart listening:', error);
      }
    }
  }, 100);
}

/**
 * Start continuous listening for voice commands
 */
export async function startAudioActions(
  callback: AudioActionCallback
): Promise<boolean> {
  try {
    const isAvailable = await Voice.isAvailable();
    if (!isAvailable) {
      console.warn('[AudioActions] Voice recognition not available');
      return false;
    }

    // Set up callbacks
    currentCallback = callback;
    Voice.onSpeechResults = handleSpeechResults;
    Voice.onSpeechError = handleSpeechError;
    Voice.onSpeechEnd = handleSpeechEnd;

    // Start listening
    await Voice.start('en-US');
    isListening = true;
    console.log('[AudioActions] Started continuous listening');

    return true;
  } catch (error) {
    console.error('[AudioActions] Failed to start:', error);
    return false;
  }
}

/**
 * Stop listening for voice commands
 */
export async function stopAudioActions(): Promise<void> {
  isListening = false;
  currentCallback = null;
  currentQuestionText = '';
  isFilteringEnabled = false;

  try {
    await Voice.stop();
    await Voice.destroy();
    Voice.removeAllListeners();
    console.log('[AudioActions] Stopped listening');
  } catch (error) {
    console.error('[AudioActions] Error stopping:', error);
  }
}

/**
 * Set the current question text for filtering
 * Call this when a new question starts being read
 */
export function setQuestionTextForFiltering(questionText: string): void {
  currentQuestionText = questionText;
  isFilteringEnabled = true;
  console.log('[AudioActions] Set question text for filtering');
}

/**
 * Clear the question text filter
 * Call this when user buzzes or question reading ends
 */
export function clearQuestionTextFilter(): void {
  currentQuestionText = '';
  isFilteringEnabled = false;
  console.log('[AudioActions] Cleared question text filter');
}

/**
 * Check if audio actions are currently active
 */
export function isAudioActionsActive(): boolean {
  return isListening;
}

/**
 * Pause listening temporarily (e.g., when TTS is speaking)
 * This keeps the service active but ignores results
 */
export function pauseListening(): void {
  isFilteringEnabled = true;
  console.log('[AudioActions] Paused (filtering enabled)');
}

/**
 * Resume listening after pause
 */
export function resumeListening(): void {
  isFilteringEnabled = false;
  console.log('[AudioActions] Resumed (filtering disabled)');
}
