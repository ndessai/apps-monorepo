/**
 * Voice Service
 *
 * Unified voice recognition service that wraps @react-native-voice/voice.
 * Provides session-based tracking, TTS echo filtering, and a single source
 * of truth for voice state across the app.
 *
 * Key features:
 * - Session tracking to prevent stale events
 * - Continuous listening mode (auto-restart on speech end)
 * - TTS echo filtering to avoid interpreting spoken questions as user input
 * - Coordination with nativeTtsService for filtering
 */

import Voice from '@react-native-voice/voice';
import * as tts from './nativeTtsService';

// Configuration for voice listening
export interface VoiceConfig {
  continuous?: boolean;        // Auto-restart when speech ends
  filterTTSEcho?: boolean;     // Filter text matching TTS output
  language?: string;           // Default: 'en-US'
}

// Callbacks for voice events
export interface VoiceServiceCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onResult?: (text: string) => void;
  onPartialResult?: (text: string) => void;
  onError?: (error: string) => void;
}

// Session tracking - each startListening call gets a unique session ID
// This prevents events from old sessions affecting new listening sessions
let sessionId = 0;
let activeSessionId: number | null = null;

// Voice state
let isInitialized = false;
let isCurrentlyListening = false;
let currentConfig: VoiceConfig = {};
let currentCallbacks: VoiceServiceCallbacks = {};
let lastResult = '';

// TTS filtering state
let ttsFilterText = '';
let ttsFilterEnabled = false;

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
 * Filter out TTS echo from speech text
 * Returns empty string if >50% of words match TTS text
 */
function filterTTSEcho(speechText: string): string {
  // Get current TTS text from nativeTtsService
  const currentTTSText = tts.getCurrentText();
  const filterText = ttsFilterText || currentTTSText;

  if (!filterText || !ttsFilterEnabled) {
    return speechText;
  }

  const speechWords = speechText.toLowerCase().split(/\s+/);
  const ttsWords = filterText.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);

  if (ttsWords.length === 0) {
    return speechText;
  }

  let matchCount = 0;
  for (const speechWord of speechWords) {
    for (const ttsWord of ttsWords) {
      if (speechWord === ttsWord || calculateSimilarity(speechWord, ttsWord) >= 0.8) {
        matchCount++;
        break;
      }
    }
  }

  // If >50% of speech matches TTS, filter it out
  const matchRatio = speechWords.length > 0 ? matchCount / speechWords.length : 0;
  if (matchRatio > 0.5) {
    console.log('[VoiceService] Filtering TTS echo:', speechText);
    return '';
  }

  return speechText;
}

/**
 * Handle speech start event
 */
function handleSpeechStart(_e: any): void {
  if (activeSessionId === null) {
    return;
  }

  console.log(`[VoiceService] Session ${activeSessionId} speech started`);
  currentCallbacks.onStart?.();
}

/**
 * Handle speech results event
 */
function handleSpeechResults(e: any): void {
  if (activeSessionId === null || !e.value || e.value.length === 0) {
    return;
  }

  const rawText = e.value[0] || '';
  console.log('[VoiceService] Speech result:', rawText);

  // Apply TTS echo filtering if enabled
  let processedText = rawText;
  if (currentConfig.filterTTSEcho) {
    processedText = filterTTSEcho(rawText);
  }

  if (processedText.trim().length > 0) {
    lastResult = processedText;
    currentCallbacks.onResult?.(processedText);
  }
}

/**
 * Handle partial speech results (if available)
 */
function handleSpeechPartialResults(e: any): void {
  if (activeSessionId === null || !e.value || e.value.length === 0) {
    return;
  }

  const rawText = e.value[0] || '';

  // Apply TTS echo filtering if enabled
  let processedText = rawText;
  if (currentConfig.filterTTSEcho) {
    processedText = filterTTSEcho(rawText);
  }

  if (processedText.trim().length > 0) {
    currentCallbacks.onPartialResult?.(processedText);
  }
}

/**
 * Handle speech end event
 */
function handleSpeechEnd(): void {
  if (activeSessionId === null) {
    return;
  }

  console.log(`[VoiceService] Session ${activeSessionId} speech ended`);
  currentCallbacks.onEnd?.();

  // Auto-restart if continuous mode
  if (currentConfig.continuous && isCurrentlyListening) {
    restartListening();
  } else {
    isCurrentlyListening = false;
  }
}

/**
 * Handle speech error event
 */
function handleSpeechError(e: any): void {
  if (activeSessionId === null) {
    return;
  }

  console.error('[VoiceService] Speech error:', e);

  // Some errors are recoverable in continuous mode
  const recoverableErrors = ['recognition_fail', 'network', 'no_match', 'speech_timeout'];
  const errorCode = e.error?.code || '';

  if (currentConfig.continuous && recoverableErrors.some((code) => errorCode.includes(code))) {
    console.log('[VoiceService] Attempting restart after recoverable error');
    setTimeout(() => {
      if (isCurrentlyListening && activeSessionId !== null) {
        restartListening();
      }
    }, 500);
    return;
  }

  currentCallbacks.onError?.(e.error?.message || 'Speech recognition error');
}

/**
 * Restart listening (for continuous mode)
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
    if (isCurrentlyListening && activeSessionId !== null) {
      try {
        // Re-register handlers before starting
        Voice.onSpeechStart = handleSpeechStart;
        Voice.onSpeechResults = handleSpeechResults;
        Voice.onSpeechPartialResults = handleSpeechPartialResults;
        Voice.onSpeechError = handleSpeechError;
        Voice.onSpeechEnd = handleSpeechEnd;

        await Voice.start(currentConfig.language || 'en-US');
        console.log('[VoiceService] Restarted listening');
      } catch (error) {
        console.error('[VoiceService] Failed to restart:', error);
      }
    }
  }, 150);
}

/**
 * Initialize the voice service
 * Call this once when app starts
 */
export async function initialize(): Promise<boolean> {
  if (isInitialized) {
    return true;
  }

  try {
    const isAvailable = await Voice.isAvailable();
    isInitialized = !!isAvailable;
    console.log('[VoiceService] Initialized, available:', isAvailable);
    return !!isAvailable;
  } catch (error) {
    console.error('[VoiceService] Failed to initialize:', error);
    isInitialized = false;
    return false;
  }
}

/**
 * Check if voice recognition is available
 */
export async function checkAvailability(): Promise<boolean> {
  try {
    const isAvailable = await Voice.isAvailable();
    return !!isAvailable;
  } catch {
    return false;
  }
}

/**
 * Start listening for speech
 */
export async function startListening(
  config: VoiceConfig = {},
  callbacks: VoiceServiceCallbacks = {}
): Promise<boolean> {
  try {
    // If already listening, update callbacks and return
    if (isCurrentlyListening && activeSessionId !== null) {
      console.log('[VoiceService] Already listening, updating callbacks');
      currentCallbacks = callbacks;
      currentConfig = config;
      return true;
    }

    // Check availability
    const isAvailable = await Voice.isAvailable();
    if (!isAvailable) {
      console.warn('[VoiceService] Voice recognition not available');
      return false;
    }

    // Stop any existing session
    try {
      await Voice.stop();
      await Voice.destroy();
    } catch {
      // Ignore - may not be running
    }

    // Create new session
    sessionId++;
    activeSessionId = sessionId;
    currentConfig = config;
    currentCallbacks = callbacks;
    lastResult = '';

    console.log(`[VoiceService] Starting session ${sessionId}`);

    // Set up event handlers BEFORE starting
    Voice.onSpeechStart = handleSpeechStart;
    Voice.onSpeechResults = handleSpeechResults;
    Voice.onSpeechPartialResults = handleSpeechPartialResults;
    Voice.onSpeechError = handleSpeechError;
    Voice.onSpeechEnd = handleSpeechEnd;

    // Small delay to ensure handlers are registered
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Enable TTS filtering if requested
    if (config.filterTTSEcho) {
      ttsFilterEnabled = true;
    }

    // Start listening
    await Voice.start(config.language || 'en-US');
    isCurrentlyListening = true;

    console.log('[VoiceService] Started listening');
    return true;
  } catch (error) {
    console.error('[VoiceService] Failed to start:', error);
    activeSessionId = null;
    currentCallbacks = {};
    isCurrentlyListening = false;
    return false;
  }
}

/**
 * Stop listening for speech
 */
export async function stopListening(): Promise<void> {
  const wasSession = activeSessionId;

  // Invalidate session first
  activeSessionId = null;
  isCurrentlyListening = false;
  currentCallbacks = {};
  ttsFilterEnabled = false;
  ttsFilterText = '';

  console.log(`[VoiceService] Stopping session ${wasSession}`);

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

  // Note: Voice.destroy() handles cleanup of event handlers internally
  console.log('[VoiceService] Stopped');
}

/**
 * Check if currently listening
 */
export function isListening(): boolean {
  return isCurrentlyListening && activeSessionId !== null;
}

/**
 * Get the last speech result
 */
export function getLastResult(): string {
  return lastResult;
}

/**
 * Set TTS text for echo filtering
 * Call this when TTS starts reading a question
 */
export function setTTSFilterText(text: string): void {
  ttsFilterText = text;
  ttsFilterEnabled = true;
  console.log('[VoiceService] TTS filter enabled');
}

/**
 * Clear TTS filter
 * Call this when user buzzes or TTS finishes
 */
export function clearTTSFilter(): void {
  ttsFilterText = '';
  ttsFilterEnabled = false;
  console.log('[VoiceService] TTS filter disabled');
}

/**
 * Check if TTS filtering is enabled
 */
export function isTTSFilterEnabled(): boolean {
  return ttsFilterEnabled;
}

/**
 * Clean up voice service
 * Call when the app is closing or quiz screen unmounts
 */
export function cleanup(): void {
  stopListening();
  isInitialized = false;
}
